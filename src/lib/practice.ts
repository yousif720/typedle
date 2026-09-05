import { getRegion, isMegaFormName, pokemonPool, type PokemonEntry } from '../data/pokemon'
import type { PracticeFilters } from './types'

export const PRACTICE_SEED_PREFIX = 'practice-'
export const CHALLENGE_SEED_PREFIX = 'challenge-'

export function createDefaultPracticeFilters(): PracticeFilters {
  return { regions: [], megaFilter: 'all' }
}

export function isPracticeSeed(seed: string) {
  return seed.startsWith(PRACTICE_SEED_PREFIX)
}

export function isChallengeSeed(seed: string) {
  return seed.startsWith(CHALLENGE_SEED_PREFIX)
}

/**
 * Practice rounds and shared challenge links are one-off and not tied to a
 * calendar day, so they must never touch streaks, personal stats, completions
 * or the shared global stats file.
 */
export function isNonDailySeed(seed: string) {
  return isPracticeSeed(seed) || isChallengeSeed(seed)
}

function createRandomId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  )
}

export function createPracticeSeed() {
  return `${PRACTICE_SEED_PREFIX}${createRandomId()}`
}

export function createChallengeSeed() {
  return `${CHALLENGE_SEED_PREFIX}${createRandomId()}`
}

export function matchesPracticeFilters(pokemon: PokemonEntry, filters: PracticeFilters) {
  if (filters.regions.length > 0 && !filters.regions.includes(getRegion(pokemon.name))) {
    return false
  }

  const isMega = isMegaFormName(pokemon.name)

  if (filters.megaFilter === 'exclude' && isMega) return false
  if (filters.megaFilter === 'only' && !isMega) return false

  return true
}

export function getFilteredPracticePool(filters: PracticeFilters) {
  return pokemonPool.filter((pokemon) => matchesPracticeFilters(pokemon, filters))
}

export function pickRandomPokemon(candidates: readonly PokemonEntry[]): PokemonEntry | null {
  if (candidates.length === 0) {
    return null
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

export const CHALLENGE_QUERY_PARAM = 'dle'

/**
 * Lightly obfuscated so the answer isn't sitting in plain text in a link
 * preview or browser history. This is spoiler protection, not security.
 */
export function encodeChallengeName(name: string) {
  try {
    return window.btoa(encodeURIComponent(name))
  } catch {
    return ''
  }
}

export function decodeChallengeName(encoded: string): string | null {
  try {
    return decodeURIComponent(window.atob(encoded))
  } catch {
    return null
  }
}

export function readChallengeCodeFromLocation(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return new URLSearchParams(window.location.search).get(CHALLENGE_QUERY_PARAM)
}

export function buildChallengeLink(name: string) {
  const origin = typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`
  return `${origin}?${CHALLENGE_QUERY_PARAM}=${encodeChallengeName(name)}`
}
