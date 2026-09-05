import type { MAX_GUESSES } from './gameRules'

export type StreakState = {
  current: number
  best: number
  lastSeed: string | null
}

export type GuessDistribution = Record<number, number>

export type UserStats = {
  played: number
  wins: number
  losses: number
  guessDistribution: GuessDistribution
  totalWinningGuesses: number
  recordedSeeds: string[]
}

export type UserProfile = {
  userKey: string
  username: string
}

export type UserCompletion = {
  seed: string
  solved: boolean
  failed: boolean
  attemptsUsed: number
  guessedPokemon: string
  targetPokemon: string
  guessHistory: string[]
  completedAt: string
}

export type UserCompletionsMap = Record<string, UserCompletion>

export type UserProgress = {
  streakState: StreakState
  stats: UserStats
}

export type GlobalStatsOutcome = {
  seed: string
  outcomeId: string
  solved: boolean
  attemptsUsed: number
}

export type LeaderboardEntry = {
  rank?: number
  userKey: string
  username: string
  currentStreak: number
  bestStreak: number
  played: number
  wins: number
}

export type DayState = {
  guessValue: string
  message: string
  wrongGuessCount: number
  solved: boolean
  failed: boolean
  lastSubmittedPokemon: string
  guessHistory: string[]
}

export type GameMode = 'daily' | 'practice' | 'challenge'

export type MegaFilter = 'all' | 'exclude' | 'only'

export type PracticeFilters = {
  /** Empty means "no region filter" — every region is allowed. */
  regions: string[]
  megaFilter: MegaFilter
}

export type ThemePreference = 'system' | 'light' | 'dark'

export type Settings = {
  theme: ThemePreference
  soundEnabled: boolean
  reducedMotion: boolean
  highContrast: boolean
  hardMode: boolean
}

// Re-exported so consumers importing types don't need a second import path.
export type MaxGuesses = typeof MAX_GUESSES
