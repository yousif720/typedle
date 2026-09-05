import { MAX_GUESSES } from './gameRules'
import type { DayState, PracticeFilters, Settings, UserStats } from './types'

const KEYS = {
  currentUser: 'typedle-current-user-v2',
  authToken: 'typedle-auth-token-v2',
  guestClientId: 'typedle-guest-client-id-v1',
  globalStats: 'typedle-global-stats-v1',
  settings: 'typedle-settings-v1',
  practiceFilters: 'typedle-practice-filters-v1',
  dayStatePrefix: 'typedle-daystate-v2-',
} as const

/**
 * Every storage access is wrapped: Safari private mode, disabled cookies and
 * storage-quota errors all throw here, and v1 would have taken the whole app
 * down with an unhandled exception during render.
 */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage unavailable or full — the game still works, it just won't persist.
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore.
  }
}

function readJson<T>(key: string, fallback: T): T {
  const raw = safeGet(key)

  if (!raw) {
    return fallback
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    safeSet(key, JSON.stringify(value))
  } catch {
    // Ignore serialization failures.
  }
}

export const authStorage = {
  getUserKey: () => safeGet(KEYS.currentUser),
  getToken: () => safeGet(KEYS.authToken),
  save(userKey: string, token: string) {
    safeSet(KEYS.currentUser, userKey)
    safeSet(KEYS.authToken, token)
  },
  clear() {
    safeRemove(KEYS.currentUser)
    safeRemove(KEYS.authToken)
  },
}

export function getOrCreateGuestClientId() {
  const existing = safeGet(KEYS.guestClientId)

  if (existing) {
    return existing
  }

  const generated =
    globalThis.crypto?.randomUUID?.() ??
    `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  safeSet(KEYS.guestClientId, generated)
  return generated
}

export const globalStatsCache = {
  read(seed: string): UserStats | null {
    const cache = readJson<Record<string, UserStats>>(KEYS.globalStats, {})
    return cache[seed] ?? null
  },
  write(seed: string, stats: UserStats) {
    const cache = readJson<Record<string, UserStats>>(KEYS.globalStats, {})
    cache[seed] = stats
    writeJson(KEYS.globalStats, cache)
  },
}

/**
 * Day state moved from cookies to localStorage. v1 wrote a 365-day cookie per
 * played day, which meant every request to the site carried an ever-growing
 * payload of old game state. localStorage is never sent to the server.
 */
export const dayStateStorage = {
  read(seed: string, userKey: string): DayState | null {
    const raw = readJson<Partial<DayState> | null>(`${KEYS.dayStatePrefix}${userKey}-${seed}`, null)

    if (
      !raw ||
      typeof raw.guessValue !== 'string' ||
      typeof raw.wrongGuessCount !== 'number' ||
      typeof raw.solved !== 'boolean' ||
      typeof raw.failed !== 'boolean'
    ) {
      return null
    }

    return {
      guessValue: raw.guessValue,
      message: typeof raw.message === 'string' ? raw.message : '',
      wrongGuessCount: Math.max(0, Math.min(MAX_GUESSES, raw.wrongGuessCount)),
      lastSubmittedPokemon: typeof raw.lastSubmittedPokemon === 'string' ? raw.lastSubmittedPokemon : '',
      guessHistory: Array.isArray(raw.guessHistory)
        ? raw.guessHistory.filter((value): value is string => typeof value === 'string')
        : [],
      solved: raw.solved,
      failed: raw.failed,
    }
  },
  write(seed: string, userKey: string, state: DayState) {
    writeJson(`${KEYS.dayStatePrefix}${userKey}-${seed}`, state)
  },
}

export const settingsStorage = {
  read(fallback: Settings): Settings {
    const stored = readJson<Partial<Settings>>(KEYS.settings, {})

    return {
      theme: stored.theme === 'light' || stored.theme === 'dark' || stored.theme === 'system' ? stored.theme : fallback.theme,
      soundEnabled: typeof stored.soundEnabled === 'boolean' ? stored.soundEnabled : fallback.soundEnabled,
      reducedMotion: typeof stored.reducedMotion === 'boolean' ? stored.reducedMotion : fallback.reducedMotion,
      highContrast: typeof stored.highContrast === 'boolean' ? stored.highContrast : fallback.highContrast,
      hardMode: typeof stored.hardMode === 'boolean' ? stored.hardMode : fallback.hardMode,
    }
  },
  write(settings: Settings) {
    writeJson(KEYS.settings, settings)
  },
}

export const practiceFiltersStorage = {
  read(fallback: PracticeFilters): PracticeFilters {
    const stored = readJson<Partial<PracticeFilters>>(KEYS.practiceFilters, {})

    return {
      regions: Array.isArray(stored.regions) ? stored.regions.filter((r): r is string => typeof r === 'string') : fallback.regions,
      megaFilter:
        stored.megaFilter === 'exclude' || stored.megaFilter === 'only' || stored.megaFilter === 'all'
          ? stored.megaFilter
          : fallback.megaFilter,
    }
  },
  write(filters: PracticeFilters) {
    writeJson(KEYS.practiceFilters, filters)
  },
}
