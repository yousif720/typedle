import { describe, expect, it } from 'vitest'

import { createEmptyStats } from './api'
import { countUnlocked, evaluateAchievements } from './achievements'
import type { StreakState, UserCompletion, UserCompletionsMap, UserStats } from './types'

function completion(overrides: Partial<UserCompletion>): UserCompletion {
  return {
    seed: '2026-09-05',
    solved: true,
    failed: false,
    attemptsUsed: 3,
    guessedPokemon: 'Chewtle',
    targetPokemon: 'Chewtle',
    guessHistory: [],
    completedAt: new Date().toISOString(),
    ...overrides,
  }
}

function context({
  stats = {},
  streak = {},
  completions = {},
}: {
  stats?: Partial<UserStats>
  streak?: Partial<StreakState>
  completions?: UserCompletionsMap
}) {
  return {
    stats: { ...createEmptyStats(), ...stats },
    streakState: { current: 0, best: 0, lastSeed: null, ...streak },
    completions,
  }
}

describe('achievements', () => {
  it('starts with everything locked', () => {
    const achievements = evaluateAchievements(context({}))

    expect(achievements.length).toBeGreaterThan(0)
    expect(countUnlocked(achievements)).toBe(0)
  })

  it('unlocks the first win after one win', () => {
    const achievements = evaluateAchievements(context({ stats: { wins: 1, played: 1 } }))
    const firstWin = achievements.find((entry) => entry.id === 'first-win')

    expect(firstWin?.unlocked).toBe(true)
  })

  it('unlocks Bullseye only for a one-guess win', () => {
    const missed = evaluateAchievements(
      context({ completions: { a: completion({ seed: 'a', attemptsUsed: 2 }) } }),
    )
    expect(missed.find((entry) => entry.id === 'bullseye')?.unlocked).toBe(false)

    const hit = evaluateAchievements(context({ completions: { a: completion({ seed: 'a', attemptsUsed: 1 }) } }))
    expect(hit.find((entry) => entry.id === 'bullseye')?.unlocked).toBe(true)
  })

  it('does not count a loss on the final guess as a comeback', () => {
    const loss = evaluateAchievements(
      context({ completions: { a: completion({ seed: 'a', solved: false, failed: true, attemptsUsed: 6 }) } }),
    )

    expect(loss.find((entry) => entry.id === 'comeback-kid')?.unlocked).toBe(false)
  })

  it('tracks partial progress towards streak milestones', () => {
    const achievements = evaluateAchievements(context({ streak: { best: 15 } }))

    expect(achievements.find((entry) => entry.id === 'streak-7')?.unlocked).toBe(true)

    const thirty = achievements.find((entry) => entry.id === 'streak-30')
    expect(thirty?.unlocked).toBe(false)
    expect(thirty?.progress).toBeCloseTo(0.5)
  })

  it('never reports progress above 1', () => {
    const achievements = evaluateAchievements(context({ stats: { played: 500, wins: 400 }, streak: { best: 200 } }))

    for (const achievement of achievements) {
      expect(achievement.progress).toBeLessThanOrEqual(1)
    }
  })

  it('unlocks Region Master only once every region is covered', () => {
    // Two regions covered is not enough.
    const partial = evaluateAchievements(
      context({
        completions: {
          a: completion({ seed: 'a', targetPokemon: 'Bulbasaur' }), // Kanto
          b: completion({ seed: 'b', targetPokemon: 'Chikorita' }), // Johto
        },
      }),
    )

    const regionMaster = partial.find((entry) => entry.id === 'region-master')
    expect(regionMaster?.unlocked).toBe(false)
    expect(regionMaster?.progress).toBeGreaterThan(0)
  })

  it('ignores losses when counting region coverage', () => {
    const achievements = evaluateAchievements(
      context({
        completions: {
          a: completion({ seed: 'a', targetPokemon: 'Bulbasaur', solved: false, failed: true }),
        },
      }),
    )

    expect(achievements.find((entry) => entry.id === 'region-master')?.progress).toBe(0)
  })

  it('is a pure function of its inputs', () => {
    const input = context({ stats: { wins: 3, played: 4 }, streak: { best: 5 } })

    expect(evaluateAchievements(input)).toEqual(evaluateAchievements(input))
  })
})
