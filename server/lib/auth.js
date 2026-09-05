import bcrypt from 'bcryptjs'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

import { bcryptRounds, sessionLifetimeMs } from './config.js'
import { usersStore } from './store.js'

const legacySha256Pattern = /^[a-f0-9]{64}$/i

/**
 * v1 of this app hashed passwords client-side with unsalted SHA-256 and the
 * server stored whatever it was handed. That meant the "hash" *was* the
 * credential: anyone who observed it could replay it forever, and the lack of a
 * salt made the stored values trivially rainbow-tableable.
 *
 * v2 sends the raw password over HTTPS and hashes it server-side with bcrypt.
 * Existing accounts still carry a legacy SHA-256 hash, so on a successful login
 * against that legacy value we transparently upgrade the record to bcrypt. No
 * password resets, no lockouts, and the weak hashes disappear as people log in.
 */
export function isLegacyHash(passwordHash) {
  return legacySha256Pattern.test(passwordHash)
}

function legacyHash(password) {
  return createHash('sha256').update(password, 'utf8').digest('hex')
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left, 'utf8')
  const rightBuffer = Buffer.from(right, 'utf8')

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export async function hashPassword(password) {
  return bcrypt.hash(password, bcryptRounds)
}

export async function verifyPassword(password, storedHash) {
  if (isLegacyHash(storedHash)) {
    return {
      valid: safeCompare(legacyHash(password), storedHash),
      needsUpgrade: true,
    }
  }

  return {
    valid: await bcrypt.compare(password, storedHash),
    needsUpgrade: false,
  }
}

export function createSessionToken() {
  return randomBytes(32).toString('hex')
}

function pruneExpiredSessions(sessions) {
  const now = Date.now()
  const pruned = {}

  for (const [token, session] of Object.entries(sessions ?? {})) {
    if (session?.expiresAt > now) {
      pruned[token] = session
    }
  }

  return pruned
}

export async function issueSession(userKey) {
  const token = createSessionToken()
  const now = Date.now()

  await usersStore.update((store) => {
    const user = store.users[userKey]

    if (!user) {
      return store
    }

    const sessions = pruneExpiredSessions(user.sessions)
    sessions[token] = { createdAt: now, expiresAt: now + sessionLifetimeMs }

    return {
      ...store,
      users: {
        ...store.users,
        [userKey]: { ...user, sessions },
      },
    }
  })

  return token
}

export async function revokeSession(userKey, token) {
  await usersStore.update((store) => {
    const user = store.users[userKey]

    if (!user) {
      return store
    }

    const sessions = pruneExpiredSessions(user.sessions)
    delete sessions[token]

    return {
      ...store,
      users: {
        ...store.users,
        [userKey]: { ...user, sessions },
      },
    }
  })
}

/**
 * Resolves a bearer token to the user it belongs to, or null when the token is
 * unknown or expired. Reads from the in-memory cache so this stays cheap enough
 * to run on every authenticated request.
 */
export function resolveSession(token) {
  if (typeof token !== 'string' || token.length < 32) {
    return null
  }

  const store = usersStore.read()
  const now = Date.now()

  for (const [userKey, user] of Object.entries(store.users)) {
    const session = user.sessions?.[token]

    if (session && session.expiresAt > now) {
      return { userKey, user }
    }
  }

  return null
}

export function readBearerToken(req) {
  const header = req.get('authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match ? match[1].trim() : null
}
