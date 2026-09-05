import { Router } from 'express'

import { usersStore } from '../lib/store.js'

const router = Router()

const maxLimit = 100
const defaultLimit = 25

/**
 * Public leaderboard. Deliberately exposes only a display name and streak
 * numbers — never password hashes, session tokens, completion history or
 * anything else that lives on the user record.
 */
router.get('/streaks', (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit ?? '', 10)
  const limit = Number.isInteger(requestedLimit)
    ? Math.max(1, Math.min(maxLimit, requestedLimit))
    : defaultLimit

  const store = usersStore.read()

  const entries = Object.entries(store.users)
    .map(([userKey, user]) => ({
      userKey,
      username: user.username,
      currentStreak: user.streakState?.current ?? 0,
      bestStreak: user.streakState?.best ?? 0,
      played: user.stats?.played ?? 0,
      wins: user.stats?.wins ?? 0,
    }))
    .filter((entry) => entry.played > 0)
    .sort(
      (left, right) =>
        right.bestStreak - left.bestStreak ||
        right.currentStreak - left.currentStreak ||
        right.wins - left.wins ||
        left.username.localeCompare(right.username),
    )
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  res.json({ entries })
})

export default router
