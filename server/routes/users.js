import { Router } from 'express'

import { maxGuesses, seedPattern } from '../lib/config.js'
import { asyncRoute, requireAuth, requireSelf, writeLimiter } from '../lib/middleware.js'
import { normalizeUserKey, sanitizeCompletion, sanitizeStats, sanitizeStreakState } from '../lib/sanitize.js'
import { usersStore } from '../lib/store.js'

const router = Router({ mergeParams: true })

// Every route below is scoped to a single account and requires a valid session
// token belonging to that same account.
router.use('/:userKey', requireAuth, requireSelf)

function updateUser(userKey, mutator) {
  return usersStore.update((store) => {
    const user = store.users[userKey]

    if (!user) {
      return store
    }

    return {
      ...store,
      users: { ...store.users, [userKey]: mutator(user) },
    }
  })
}

router.get('/:userKey/progress', (req, res) => {
  const { user } = req.auth

  res.json({
    userKey: req.auth.userKey,
    progress: {
      streakState: sanitizeStreakState(user.streakState),
      stats: sanitizeStats(user.stats),
    },
  })
})

router.put(
  '/:userKey/progress',
  writeLimiter,
  asyncRoute(async (req, res) => {
    const { userKey } = req.auth
    const incomingStreakState = req.body?.streakState
    const incomingStats = req.body?.stats

    const store = await updateUser(userKey, (user) => ({
      ...user,
      streakState: incomingStreakState ? sanitizeStreakState(incomingStreakState) : user.streakState,
      stats: incomingStats ? sanitizeStats(incomingStats) : user.stats,
    }))

    const updated = store.users[userKey]

    res.json({
      userKey,
      progress: { streakState: updated.streakState, stats: updated.stats },
    })
  }),
)

router.get('/:userKey/completions', (req, res) => {
  res.json({ userKey: req.auth.userKey, completions: req.auth.user.completions ?? {} })
})

router.post(
  '/:userKey/completions',
  writeLimiter,
  asyncRoute(async (req, res) => {
    const { userKey } = req.auth
    const seed = typeof req.body?.seed === 'string' ? req.body.seed : ''
    const { solved, failed, attemptsUsed } = req.body ?? {}

    if (!seedPattern.test(seed)) {
      res.status(400).json({ error: 'seed is required as YYYY-MM-DD.' })
      return
    }

    if (typeof solved !== 'boolean' || typeof failed !== 'boolean') {
      res.status(400).json({ error: 'solved and failed must be booleans.' })
      return
    }

    if (!Number.isInteger(attemptsUsed) || attemptsUsed < 1 || attemptsUsed > maxGuesses) {
      res.status(400).json({ error: `attemptsUsed must be an integer from 1 to ${maxGuesses}.` })
      return
    }

    const existing = req.auth.user.completions?.[seed]

    // A finished day is immutable: re-posting it can repair missing detail but
    // never rewrites the outcome.
    if (existing) {
      const existingHistory = Array.isArray(existing.guessHistory) ? existing.guessHistory : []
      const incomingHistory = Array.isArray(req.body?.guessHistory) ? req.body.guessHistory : []
      const nextHistory = existingHistory.length > 0 ? existingHistory : incomingHistory
      const nextGuessedPokemon = existing.guessedPokemon || (req.body?.guessedPokemon ?? '')
      const nextTargetPokemon = existing.targetPokemon || (req.body?.targetPokemon ?? '')

      const needsRepair =
        nextHistory.length !== existingHistory.length ||
        nextGuessedPokemon !== existing.guessedPokemon ||
        nextTargetPokemon !== existing.targetPokemon

      if (!needsRepair) {
        res.json({ completion: existing, deduped: true })
        return
      }

      const repaired = sanitizeCompletion(
        {
          ...existing,
          guessedPokemon: nextGuessedPokemon,
          targetPokemon: nextTargetPokemon,
          guessHistory: nextHistory,
        },
        seed,
      )

      await updateUser(userKey, (user) => ({
        ...user,
        completions: { ...(user.completions ?? {}), [seed]: repaired },
      }))

      res.json({ completion: repaired, deduped: true })
      return
    }

    const completion = sanitizeCompletion(
      {
        solved,
        failed,
        attemptsUsed,
        guessedPokemon: req.body?.guessedPokemon,
        targetPokemon: req.body?.targetPokemon,
        guessHistory: req.body?.guessHistory,
        completedAt: typeof req.body?.completedAt === 'string' ? req.body.completedAt : new Date().toISOString(),
      },
      seed,
    )

    await updateUser(userKey, (user) => ({
      ...user,
      completions: { ...(user.completions ?? {}), [seed]: completion },
    }))

    res.status(201).json({ completion, deduped: false })
  }),
)

router.get('/:userKey/friends', (req, res) => {
  const store = usersStore.read()
  const friends = (req.auth.user.friends ?? [])
    .map((friendKey) => {
      const friend = store.users[friendKey]

      if (!friend) {
        return null
      }

      return {
        userKey: friendKey,
        username: friend.username,
        currentStreak: friend.streakState?.current ?? 0,
        bestStreak: friend.streakState?.best ?? 0,
        played: friend.stats?.played ?? 0,
        wins: friend.stats?.wins ?? 0,
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.bestStreak - left.bestStreak || right.currentStreak - left.currentStreak)

  res.json({ friends })
})

router.post(
  '/:userKey/friends',
  writeLimiter,
  asyncRoute(async (req, res) => {
    const { userKey } = req.auth
    const friendKey = normalizeUserKey(req.body?.username)

    if (!friendKey) {
      res.status(400).json({ error: 'A username is required.' })
      return
    }

    if (friendKey === userKey) {
      res.status(400).json({ error: "You can't add yourself as a friend." })
      return
    }

    if (!usersStore.read().users[friendKey]) {
      res.status(404).json({ error: 'No player with that username.' })
      return
    }

    await updateUser(userKey, (user) => ({
      ...user,
      friends: [...new Set([...(user.friends ?? []), friendKey])],
    }))

    res.status(201).json({ ok: true, friendKey })
  }),
)

router.delete(
  '/:userKey/friends/:friendKey',
  writeLimiter,
  asyncRoute(async (req, res) => {
    const { userKey } = req.auth
    const friendKey = normalizeUserKey(req.params.friendKey)

    await updateUser(userKey, (user) => ({
      ...user,
      friends: (user.friends ?? []).filter((entry) => entry !== friendKey),
    }))

    res.json({ ok: true })
  }),
)

export default router
