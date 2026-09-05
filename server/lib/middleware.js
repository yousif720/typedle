import rateLimit from 'express-rate-limit'

import { readBearerToken, resolveSession } from './auth.js'
import { normalizeUserKey } from './sanitize.js'

/**
 * v1 had no authentication on any /users/:userKey/* route. Anyone who knew a
 * username could overwrite that account's streak, stats and completions with a
 * single request, and read anyone's full play history. These two middlewares
 * are what close that hole.
 */
export function requireAuth(req, res, next) {
  const token = readBearerToken(req)
  const session = token ? resolveSession(token) : null

  if (!session) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  req.auth = { userKey: session.userKey, user: session.user, token }
  next()
}

/**
 * Ensures the authenticated user is the owner of the :userKey being addressed,
 * so a valid token for account A can't be used to touch account B.
 */
export function requireSelf(req, res, next) {
  const requestedKey = normalizeUserKey(req.params.userKey)

  if (!requestedKey || requestedKey !== req.auth?.userKey) {
    res.status(403).json({ error: 'You can only access your own account.' })
    return
  }

  next()
}

const rateLimitOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
}

// Deliberately strict: this is the surface an attacker would hammer to guess
// passwords or enumerate usernames.
export const authLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
})

export const writeLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 60 * 1000,
  limit: 60,
})

export const generalLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 60 * 1000,
  limit: 300,
})

export function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

export function errorHandler(error, _req, res, _next) {
  console.error('Unhandled API error:', error)

  if (res.headersSent) {
    return
  }

  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}
