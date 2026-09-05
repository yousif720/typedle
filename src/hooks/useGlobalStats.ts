import { useCallback, useEffect, useState } from 'react'

import { api, createEmptyStats } from '../lib/api'
import { isNonDailySeed } from '../lib/practice'
import { globalStatsCache } from '../lib/storage'
import type { GlobalStatsOutcome, UserStats } from '../lib/types'

export function useGlobalStats(seed: string) {
  const [stats, setStats] = useState<UserStats>(() =>
    isNonDailySeed(seed) ? createEmptyStats() : (globalStatsCache.read(seed) ?? createEmptyStats()),
  )

  useEffect(() => {
    // Practice and challenge rounds are not part of any day's shared stats, so
    // there is nothing to fetch and nothing to show.
    if (isNonDailySeed(seed)) {
      return
    }

    const controller = new AbortController()

    async function load() {
      try {
        const remote = await api.getGlobalStats(seed, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        setStats(remote)
        globalStatsCache.write(seed, remote)
      } catch {
        // Offline or the API is down: the cached copy read during init is still
        // shown, so the results screen degrades rather than breaking.
      }
    }

    void load()

    return () => controller.abort()
  }, [seed])

  const submitOutcome = useCallback(
    async (outcome: GlobalStatsOutcome) => {
      if (isNonDailySeed(outcome.seed)) {
        return
      }

      try {
        const updated = await api.submitGlobalOutcome(outcome)
        setStats(updated)
        globalStatsCache.write(outcome.seed, updated)
      } catch {
        // Losing a single stats submission is not worth interrupting the player.
      }
    },
    [],
  )

  return { globalStats: stats, submitOutcome }
}
