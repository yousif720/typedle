import { maxGuesses, seedPattern } from './config.js'

export function createEmptyStats() {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    guessDistribution: Object.fromEntries(
      Array.from({ length: maxGuesses }, (_, index) => [index + 1, 0]),
    ),
    totalWinningGuesses: 0,
    recordedSeeds: [],
  }
}

export function createEmptyStatsStore() {
  return { byDay: {} }
}

export function createEmptyUsersStore() {
  return { users: {} }
}

export function createEmptyStreakState() {
  return { current: 0, best: 0, lastSeed: null }
}

function toSafeCount(value, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback
}

export function sanitizeStreakState(rawState) {
  const state = rawState && typeof rawState === 'object' ? rawState : {}

  return {
    current: toSafeCount(state.current),
    best: toSafeCount(state.best),
    lastSeed: typeof state.lastSeed === 'string' && seedPattern.test(state.lastSeed) ? state.lastSeed : null,
  }
}

export function sanitizeStats(rawStats) {
  const baseStats = createEmptyStats()
  const stats = rawStats && typeof rawStats === 'object' ? rawStats : {}
  const rawDistribution = stats.guessDistribution && typeof stats.guessDistribution === 'object'
    ? stats.guessDistribution
    : {}

  const guessDistribution = {}

  for (let guess = 1; guess <= maxGuesses; guess += 1) {
    guessDistribution[guess] = toSafeCount(rawDistribution[guess])
  }

  return {
    played: toSafeCount(stats.played, baseStats.played),
    wins: toSafeCount(stats.wins, baseStats.wins),
    losses: toSafeCount(stats.losses, baseStats.losses),
    guessDistribution,
    totalWinningGuesses: toSafeCount(stats.totalWinningGuesses, baseStats.totalWinningGuesses),
    recordedSeeds: Array.isArray(stats.recordedSeeds)
      ? stats.recordedSeeds.filter((entry) => typeof entry === 'string').slice(0, 5000)
      : [],
  }
}

export function sanitizeCompletion(rawCompletion, seed) {
  const completion = rawCompletion && typeof rawCompletion === 'object' ? rawCompletion : {}
  const attemptsUsed = Number.isFinite(completion.attemptsUsed)
    ? Math.max(1, Math.min(maxGuesses, Math.floor(completion.attemptsUsed)))
    : 1

  return {
    seed,
    solved: Boolean(completion.solved),
    failed: Boolean(completion.failed),
    attemptsUsed,
    guessedPokemon: typeof completion.guessedPokemon === 'string' ? completion.guessedPokemon.slice(0, 80) : '',
    targetPokemon: typeof completion.targetPokemon === 'string' ? completion.targetPokemon.slice(0, 80) : '',
    guessHistory: Array.isArray(completion.guessHistory)
      ? completion.guessHistory
          .filter((value) => typeof value === 'string')
          .slice(0, maxGuesses)
          .map((value) => value.slice(0, 80))
      : [],
    completedAt: typeof completion.completedAt === 'string' ? completion.completedAt : new Date(0).toISOString(),
  }
}

export function sanitizeStatsStore(rawStore) {
  const store = rawStore && typeof rawStore === 'object' ? rawStore : {}
  const byDay = store.byDay && typeof store.byDay === 'object' ? store.byDay : {}
  const safeStore = createEmptyStatsStore()

  for (const [seed, rawStats] of Object.entries(byDay)) {
    if (typeof seed === 'string' && seedPattern.test(seed)) {
      safeStore.byDay[seed] = sanitizeStats(rawStats)
    }
  }

  // Backward compatibility for the old single-object stats format.
  if (Object.keys(safeStore.byDay).length === 0 && Number.isFinite(store.played)) {
    safeStore.byDay.legacy = sanitizeStats(store)
  }

  return safeStore
}

function sanitizeSessions(rawSessions) {
  if (!rawSessions || typeof rawSessions !== 'object') {
    return {}
  }

  const sessions = {}
  const now = Date.now()

  for (const [token, rawSession] of Object.entries(rawSessions)) {
    if (typeof token !== 'string' || token.length < 32) {
      continue
    }

    const expiresAt = Number.isFinite(rawSession?.expiresAt) ? rawSession.expiresAt : 0

    // Drop anything already expired rather than carrying dead tokens forward.
    if (expiresAt > now) {
      sessions[token] = {
        expiresAt,
        createdAt: Number.isFinite(rawSession?.createdAt) ? rawSession.createdAt : now,
      }
    }
  }

  return sessions
}

export function sanitizeUsersStore(rawStore) {
  const store = rawStore && typeof rawStore === 'object' ? rawStore : {}
  const users = store.users && typeof store.users === 'object' ? store.users : {}
  const safeStore = createEmptyUsersStore()

  for (const [userKey, value] of Object.entries(users)) {
    if (!value || typeof value !== 'object') {
      continue
    }

    const username = typeof value.username === 'string' ? value.username.trim() : ''
    const passwordHash = typeof value.passwordHash === 'string' ? value.passwordHash.trim() : ''

    if (!username || !passwordHash) {
      continue
    }

    const completions = value.completions && typeof value.completions === 'object' ? value.completions : {}
    const safeCompletions = {}

    for (const [seed, rawCompletion] of Object.entries(completions)) {
      if (typeof seed === 'string' && seedPattern.test(seed)) {
        safeCompletions[seed] = sanitizeCompletion(rawCompletion, seed)
      }
    }

    safeStore.users[userKey] = {
      username,
      passwordHash,
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date(0).toISOString(),
      streakState: sanitizeStreakState(value.streakState),
      stats: sanitizeStats(value.stats),
      completions: safeCompletions,
      friends: Array.isArray(value.friends)
        ? [...new Set(value.friends.filter((entry) => typeof entry === 'string'))].slice(0, 500)
        : [],
      achievements: Array.isArray(value.achievements)
        ? [...new Set(value.achievements.filter((entry) => typeof entry === 'string'))].slice(0, 200)
        : [],
      sessions: sanitizeSessions(value.sessions),
    }
  }

  return safeStore
}

export function normalizeUserKey(userKey) {
  return typeof userKey === 'string' ? userKey.trim().toLowerCase() : ''
}

export function getStatsForSeed(statsStore, seed) {
  return statsStore.byDay[seed] ? sanitizeStats(statsStore.byDay[seed]) : createEmptyStats()
}
