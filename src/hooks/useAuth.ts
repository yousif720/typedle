import { useCallback, useEffect, useState } from 'react'

import { ApiError, api, createEmptyStats } from '../lib/api'
import { authStorage } from '../lib/storage'
import type { UserCompletionsMap, UserProfile, UserProgress } from '../lib/types'

export type AuthState = {
  profile: UserProfile | null
  progress: UserProgress
  completions: UserCompletionsMap
  /** True while an existing session is being restored on first load. */
  loading: boolean
}

const emptyProgress: UserProgress = {
  streakState: { current: 0, best: 0, lastSeed: null },
  stats: createEmptyStats(),
}

const signedOutState: AuthState = {
  profile: null,
  progress: emptyProgress,
  completions: {},
  loading: false,
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => ({
    ...signedOutState,
    // Only show a loading state when there's actually a token to restore.
    loading: Boolean(authStorage.getToken()),
  }))

  useEffect(() => {
    const token = authStorage.getToken()

    if (!token) {
      // Initial state already says "signed out"; nothing to do.
      return
    }

    const controller = new AbortController()

    async function restoreSession() {
      try {
        const profile = await api.me(controller.signal)
        const [progress, completions] = await Promise.all([
          api.getProgress(profile.userKey, controller.signal),
          api.getCompletions(profile.userKey, controller.signal),
        ])

        if (controller.signal.aborted) {
          return
        }

        setState({ profile, progress, completions, loading: false })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        // A rejected token means the session is genuinely gone, so clear it
        // rather than leaving the app in a half-signed-in state.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          authStorage.clear()
        }

        setState(signedOutState)
      }
    }

    void restoreSession()

    return () => controller.abort()
  }, [])

  const signIn = useCallback(async (username: string, password: string, mode: 'login' | 'register') => {
    const result = mode === 'register' ? await api.register(username, password) : await api.login(username, password)

    authStorage.save(result.user.userKey, result.token)

    const [progress, completions] = await Promise.all([
      api.getProgress(result.user.userKey),
      api.getCompletions(result.user.userKey),
    ])

    setState({ profile: result.user, progress, completions, loading: false })
    return result.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Even if the server call fails, drop local credentials so the user is
      // signed out from their own device's point of view.
    }

    authStorage.clear()
    setState(signedOutState)
  }, [])

  const applyProgress = useCallback((progress: UserProgress) => {
    setState((current) => ({ ...current, progress }))
  }, [])

  const applyCompletion = useCallback((seed: string, completion: UserCompletionsMap[string]) => {
    setState((current) => ({ ...current, completions: { ...current.completions, [seed]: completion } }))
  }, [])

  return { ...state, signIn, signOut, applyProgress, applyCompletion }
}
