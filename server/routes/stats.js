import { Router } from 'express'

import { maxGuesses, seedPattern } from '../lib/config.js'
import { asyncRoute, writeLimiter } from '../lib/middleware.js'
import { getStatsForSeed, sanitizeStats } from '../lib/sanitize.js'
import { statsStore } from '../lib/store.js'

const router = Router()

function applyOutcome(stats, { outcomeId, solved, attemptsUsed }) {
  if (stats.recordedSeeds.includes(outcomeId)) {
    return stats
  }

  return sanitizeStats({
    ...stats,
    played: stats.played + 1,
    wins: stats.wins + (solved ? 1 : 0),
    losses: stats.losses + (solved ? 0 : 1),
    totalWinningGuesses: stats.totalWinningGuesses + (solved ? attemptsUsed : 0),
    recordedSeeds: [...stats.recordedSeeds, outcomeId],
    guessDistribution: {
      ...stats.guessDistribution,
      [attemptsUsed]: stats.guessDistribution[attemptsUsed] + (solved ? 1 : 0),
    },
  })
}

router.get('/global', (req, res) => {
  const seed = typeof req.query.seed === 'string' ? req.query.seed : ''

  if (!seedPattern.test(seed)) {
    res.status(400).json({ error: 'seed query parameter is required as YYYY-MM-DD.' })
    return
  }

  res.json({ seed, stats: getStatsForSeed(statsStore.read(), seed) })
})

router.post(
  '/global',
  writeLimiter,
  asyncRoute(async (req, res) => {
    const { seed, outcomeId, solved, attemptsUsed } = req.body ?? {}

    if (typeof seed !== 'string' || !seedPattern.test(seed)) {
      res.status(400).json({ error: 'seed is required as YYYY-MM-DD.' })
      return
    }

    if (typeof outcomeId !== 'string' || outcomeId.trim().length === 0 || outcomeId.length > 200) {
      res.status(400).json({ error: 'outcomeId is required.' })
      return
    }

    if (typeof solved !== 'boolean') {
      res.status(400).json({ error: 'solved must be a boolean.' })
      return
    }

    if (!Number.isInteger(attemptsUsed) || attemptsUsed < 1 || attemptsUsed > maxGuesses) {
      res.status(400).json({ error: `attemptsUsed must be an integer from 1 to ${maxGuesses}.` })
      return
    }

    const trimmedOutcomeId = outcomeId.trim()
    const before = getStatsForSeed(statsStore.read(), seed)
    const deduped = before.recordedSeeds.includes(trimmedOutcomeId)

    const store = await statsStore.update((current) => {
      const currentStats = getStatsForSeed(current, seed)

      return {
        ...current,
        byDay: {
          ...current.byDay,
          [seed]: applyOutcome(currentStats, { outcomeId: trimmedOutcomeId, solved, attemptsUsed }),
        },
      }
    })

    res.json({ seed, stats: getStatsForSeed(store, seed), deduped })
  }),
)

export default router
