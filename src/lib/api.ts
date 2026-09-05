import { authStorage } from './storage'
import type {
  GlobalStatsOutcome,
  LeaderboardEntry,
  UserCompletion,
  UserCompletionsMap,
  UserProfile,
  UserProgress,
  UserStats,
} from './types'
import { MAX_GUESSES } from './gameRules'

const configuredBaseUrl = import.meta.env.VITE_STATS_API_BASE_URL?.trim() ?? 'https://typedle.onrender.com'
const baseUrl = configuredBaseUrl.replace(/\/+$/g, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

async function request<T>(path: string, { method = 'GET', body, auth = false, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = authStorage.getToken()

    if (!token) {
      throw new ApiError('You are signed out. Please sign in again.', 401)
    }

    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.'

    try {
      const payload = (await response.json()) as { error?: string }
      message = payload.error ?? message
    } catch {
      // Non-JSON error body; keep the generic message.
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function coerceStats(raw: Partial<UserStats> | undefined): UserStats {
  const distribution: Record<number, number> = {}

  for (let guess = 1; guess <= MAX_GUESSES; guess += 1) {
    const value = raw?.guessDistribution?.[guess]
    distribution[guess] = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0
  }

  return {
    played: typeof raw?.played === 'number' ? raw.played : 0,
    wins: typeof raw?.wins === 'number' ? raw.wins : 0,
    losses: typeof raw?.losses === 'number' ? raw.losses : 0,
    guessDistribution: distribution,
    totalWinningGuesses: typeof raw?.totalWinningGuesses === 'number' ? raw.totalWinningGuesses : 0,
    recordedSeeds: Array.isArray(raw?.recordedSeeds)
      ? raw.recordedSeeds.filter((seed): seed is string => typeof seed === 'string')
      : [],
  }
}

export function createEmptyStats(): UserStats {
  return coerceStats(undefined)
}

export const api = {
  async register(username: string, password: string): Promise<{ user: UserProfile; token: string }> {
    return request('/api/auth/register', { method: 'POST', body: { username, password } })
  },

  async login(username: string, password: string): Promise<{ user: UserProfile; token: string }> {
    return request('/api/auth/login', { method: 'POST', body: { username, password } })
  },

  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST', auth: true })
  },

  async me(signal?: AbortSignal): Promise<UserProfile> {
    const payload = await request<{ user: UserProfile }>('/api/auth/me', { auth: true, signal })
    return payload.user
  },

  async getProgress(userKey: string, signal?: AbortSignal): Promise<UserProgress> {
    const payload = await request<{ progress: { streakState: UserProgress['streakState']; stats: Partial<UserStats> } }>(
      `/api/auth/users/${encodeURIComponent(userKey)}/progress`,
      { auth: true, signal },
    )

    return {
      streakState: {
        current: payload.progress?.streakState?.current ?? 0,
        best: payload.progress?.streakState?.best ?? 0,
        lastSeed: payload.progress?.streakState?.lastSeed ?? null,
      },
      stats: coerceStats(payload.progress?.stats),
    }
  },

  async saveProgress(userKey: string, progress: Partial<UserProgress>): Promise<void> {
    await request(`/api/auth/users/${encodeURIComponent(userKey)}/progress`, {
      method: 'PUT',
      body: progress,
      auth: true,
    })
  },

  async getCompletions(userKey: string, signal?: AbortSignal): Promise<UserCompletionsMap> {
    const payload = await request<{ completions?: Record<string, Partial<UserCompletion>> }>(
      `/api/auth/users/${encodeURIComponent(userKey)}/completions`,
      { auth: true, signal },
    )

    const completions: UserCompletionsMap = {}

    for (const [seed, entry] of Object.entries(payload.completions ?? {})) {
      if (!entry || typeof entry !== 'object') {
        continue
      }

      completions[seed] = {
        seed,
        solved: Boolean(entry.solved),
        failed: Boolean(entry.failed),
        attemptsUsed:
          typeof entry.attemptsUsed === 'number' ? Math.max(1, Math.min(MAX_GUESSES, entry.attemptsUsed)) : 1,
        guessedPokemon: typeof entry.guessedPokemon === 'string' ? entry.guessedPokemon : '',
        targetPokemon: typeof entry.targetPokemon === 'string' ? entry.targetPokemon : '',
        guessHistory: Array.isArray(entry.guessHistory)
          ? entry.guessHistory.filter((value): value is string => typeof value === 'string')
          : [],
        completedAt: typeof entry.completedAt === 'string' ? entry.completedAt : new Date(0).toISOString(),
      }
    }

    return completions
  },

  async saveCompletion(userKey: string, completion: UserCompletion): Promise<UserCompletion> {
    const payload = await request<{ completion: UserCompletion }>(
      `/api/auth/users/${encodeURIComponent(userKey)}/completions`,
      { method: 'POST', body: completion, auth: true },
    )

    return payload.completion
  },

  async getGlobalStats(seed: string, signal?: AbortSignal): Promise<UserStats> {
    const payload = await request<{ stats?: Partial<UserStats> }>(
      `/api/stats/global?seed=${encodeURIComponent(seed)}`,
      { signal },
    )

    return coerceStats(payload.stats)
  },

  async submitGlobalOutcome(outcome: GlobalStatsOutcome): Promise<UserStats> {
    const payload = await request<{ stats?: Partial<UserStats> }>('/api/stats/global', {
      method: 'POST',
      body: outcome,
    })

    return coerceStats(payload.stats)
  },

  async getLeaderboard(limit = 25, signal?: AbortSignal): Promise<LeaderboardEntry[]> {
    const payload = await request<{ entries?: LeaderboardEntry[] }>(`/api/leaderboard/streaks?limit=${limit}`, { signal })
    return payload.entries ?? []
  },

  async getFriends(userKey: string, signal?: AbortSignal): Promise<LeaderboardEntry[]> {
    const payload = await request<{ friends?: LeaderboardEntry[] }>(
      `/api/auth/users/${encodeURIComponent(userKey)}/friends`,
      { auth: true, signal },
    )

    return payload.friends ?? []
  },

  async addFriend(userKey: string, username: string): Promise<void> {
    await request(`/api/auth/users/${encodeURIComponent(userKey)}/friends`, {
      method: 'POST',
      body: { username },
      auth: true,
    })
  },

  async removeFriend(userKey: string, friendKey: string): Promise<void> {
    await request(
      `/api/auth/users/${encodeURIComponent(userKey)}/friends/${encodeURIComponent(friendKey)}`,
      { method: 'DELETE', auth: true },
    )
  },
}
