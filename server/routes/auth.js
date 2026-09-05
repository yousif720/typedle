import { Router } from 'express'

import { hashPassword, issueSession, revokeSession, verifyPassword } from '../lib/auth.js'
import { asyncRoute, authLimiter, requireAuth } from '../lib/middleware.js'
import {
  createEmptyStats,
  createEmptyStreakState,
  normalizeUserKey,
} from '../lib/sanitize.js'
import { usersStore } from '../lib/store.js'

const router = Router()

const usernamePattern = /^[a-zA-Z0-9_.-]{3,20}$/
const minPasswordLength = 8
const maxPasswordLength = 200

function validateCredentials(username, password) {
  if (typeof username !== 'string' || !usernamePattern.test(username.trim())) {
    return 'Username must be 3-20 characters, using letters, numbers, dots, dashes or underscores.'
  }

  if (typeof password !== 'string' || password.length < minPasswordLength) {
    return `Password must be at least ${minPasswordLength} characters.`
  }

  if (password.length > maxPasswordLength) {
    return 'Password is too long.'
  }

  return null
}

function publicUser(userKey, user) {
  return { userKey, username: user.username }
}

router.post(
  '/register',
  authLimiter,
  asyncRoute(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
    const password = req.body?.password
    const validationError = validateCredentials(username, password)

    if (validationError) {
      res.status(400).json({ error: validationError })
      return
    }

    const userKey = normalizeUserKey(username)

    if (usersStore.read().users[userKey]) {
      res.status(409).json({ error: 'That username is already taken.' })
      return
    }

    const passwordHash = await hashPassword(password)
    let created = true

    await usersStore.update((store) => {
      // Re-check inside the serialized write so two simultaneous registrations
      // for the same name can't both succeed.
      if (store.users[userKey]) {
        created = false
        return store
      }

      return {
        ...store,
        users: {
          ...store.users,
          [userKey]: {
            username,
            passwordHash,
            createdAt: new Date().toISOString(),
            streakState: createEmptyStreakState(),
            stats: createEmptyStats(),
            completions: {},
            friends: [],
            sessions: {},
          },
        },
      }
    })

    if (!created) {
      res.status(409).json({ error: 'That username is already taken.' })
      return
    }

    const token = await issueSession(userKey)
    res.status(201).json({ user: publicUser(userKey, usersStore.read().users[userKey]), token })
  }),
)

router.post(
  '/login',
  authLimiter,
  asyncRoute(async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
    const password = req.body?.password
    const userKey = normalizeUserKey(username)

    if (!userKey || typeof password !== 'string' || password.length === 0) {
      res.status(400).json({ error: 'Username and password are required.' })
      return
    }

    const user = usersStore.read().users[userKey]

    if (!user) {
      // Same message and rough timing as a bad password, so this endpoint can't
      // be used to enumerate which usernames exist.
      await hashPassword(password)
      res.status(401).json({ error: 'Invalid username or password.' })
      return
    }

    const { valid, needsUpgrade } = await verifyPassword(password, user.passwordHash)

    if (!valid) {
      res.status(401).json({ error: 'Invalid username or password.' })
      return
    }

    if (needsUpgrade) {
      // Transparently migrate the legacy unsalted SHA-256 hash to bcrypt.
      const upgradedHash = await hashPassword(password)

      await usersStore.update((store) => {
        const current = store.users[userKey]

        if (!current) {
          return store
        }

        return {
          ...store,
          users: { ...store.users, [userKey]: { ...current, passwordHash: upgradedHash } },
        }
      })
    }

    const token = await issueSession(userKey)
    res.json({ user: publicUser(userKey, usersStore.read().users[userKey]), token })
  }),
)

router.post(
  '/logout',
  requireAuth,
  asyncRoute(async (req, res) => {
    await revokeSession(req.auth.userKey, req.auth.token)
    res.json({ ok: true })
  }),
)

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.auth.userKey, req.auth.user) })
})

export default router
