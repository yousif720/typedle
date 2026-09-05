import { getRegion, regions } from '../data/pokemon'
import { MAX_GUESSES } from './gameRules'
import type { StreakState, UserCompletionsMap, UserStats } from './types'

export type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  /** 0-1. Lets the UI show partial progress instead of just locked/unlocked. */
  progress: number
  unlocked: boolean
}

type AchievementContext = {
  stats: UserStats
  streakState: StreakState
  completions: UserCompletionsMap
}

function ratio(value: number, target: number) {
  if (target <= 0) return 1
  return Math.max(0, Math.min(1, value / target))
}

/**
 * Achievements are derived, not stored. They're a pure function of stats the
 * account already tracks, so there's no extra schema, no sync problem, and no
 * way for them to drift out of step with the underlying numbers.
 */
export function evaluateAchievements({ stats, streakState, completions }: AchievementContext): Achievement[] {
  const completionList = Object.values(completions)
  const wins = completionList.filter((entry) => entry.solved)

  const solvedInOne = wins.some((entry) => entry.attemptsUsed === 1)
  const solvedOnLast = wins.some((entry) => entry.attemptsUsed === MAX_GUESSES)

  const solvedRegions = new Set(
    wins.map((entry) => getRegion(entry.targetPokemon)).filter((region) => regions.includes(region)),
  )

  const definitions: Array<Omit<Achievement, 'unlocked'>> = [
    {
      id: 'first-win',
      name: 'First Catch',
      description: 'Solve your first puzzle.',
      icon: '🎯',
      progress: ratio(stats.wins, 1),
    },
    {
      id: 'bullseye',
      name: 'Bullseye',
      description: 'Solve a puzzle on the very first guess.',
      icon: '🎪',
      progress: solvedInOne ? 1 : 0,
    },
    {
      id: 'comeback-kid',
      name: 'Comeback Kid',
      description: `Solve a puzzle on guess ${MAX_GUESSES}.`,
      icon: '😅',
      progress: solvedOnLast ? 1 : 0,
    },
    {
      id: 'streak-3',
      name: 'On a Roll',
      description: 'Reach a 3-day streak.',
      icon: '🔥',
      progress: ratio(streakState.best, 3),
    },
    {
      id: 'streak-7',
      name: 'Week Long',
      description: 'Reach a 7-day streak.',
      icon: '📅',
      progress: ratio(streakState.best, 7),
    },
    {
      id: 'streak-30',
      name: 'Unbroken',
      description: 'Reach a 30-day streak.',
      icon: '💎',
      progress: ratio(streakState.best, 30),
    },
    {
      id: 'played-10',
      name: 'Regular',
      description: 'Play 10 puzzles.',
      icon: '🎮',
      progress: ratio(stats.played, 10),
    },
    {
      id: 'played-50',
      name: 'Devoted',
      description: 'Play 50 puzzles.',
      icon: '🏆',
      progress: ratio(stats.played, 50),
    },
    {
      id: 'region-master',
      name: 'Region Master',
      description: 'Solve a puzzle from every region.',
      icon: '🗺️',
      progress: ratio(solvedRegions.size, regions.length),
    },
    {
      id: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Win 10 puzzles in 3 guesses or fewer.',
      icon: '🎖️',
      progress: ratio(wins.filter((entry) => entry.attemptsUsed <= 3).length, 10),
    },
  ]

  return definitions.map((definition) => ({ ...definition, unlocked: definition.progress >= 1 }))
}

export function countUnlocked(achievements: Achievement[]) {
  return achievements.filter((achievement) => achievement.unlocked).length
}
