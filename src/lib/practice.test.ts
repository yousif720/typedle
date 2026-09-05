import { describe, expect, it } from 'vitest'

import { getRegion, isMegaFormName, pokemonPool } from '../data/pokemon'
import {
  createChallengeSeed,
  createPracticeSeed,
  decodeChallengeName,
  encodeChallengeName,
  getFilteredPracticePool,
  isChallengeSeed,
  isNonDailySeed,
  isPracticeSeed,
  matchesPracticeFilters,
  pickRandomPokemon,
} from './practice'

describe('seed classification', () => {
  it('recognises its own generated seeds', () => {
    expect(isPracticeSeed(createPracticeSeed())).toBe(true)
    expect(isChallengeSeed(createChallengeSeed())).toBe(true)
  })

  it('treats both practice and challenge as non-daily', () => {
    expect(isNonDailySeed(createPracticeSeed())).toBe(true)
    expect(isNonDailySeed(createChallengeSeed())).toBe(true)
  })

  it('never misclassifies a real date as non-daily', () => {
    // This is the guard that keeps practice rounds out of streaks and stats.
    expect(isNonDailySeed('2026-09-05')).toBe(false)
    expect(isPracticeSeed('2026-09-05')).toBe(false)
    expect(isChallengeSeed('2026-09-05')).toBe(false)
  })

  it('generates unique seeds', () => {
    const seeds = new Set(Array.from({ length: 50 }, () => createPracticeSeed()))
    expect(seeds.size).toBe(50)
  })
})

describe('practice filters', () => {
  it('allows everything when no filters are set', () => {
    expect(getFilteredPracticePool({ regions: [], megaFilter: 'all' })).toHaveLength(pokemonPool.length)
  })

  it('filters to the selected regions only', () => {
    const pool = getFilteredPracticePool({ regions: ['Kanto'], megaFilter: 'all' })

    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((pokemon) => getRegion(pokemon.name) === 'Kanto')).toBe(true)
  })

  it('supports selecting several regions', () => {
    const pool = getFilteredPracticePool({ regions: ['Kanto', 'Johto'], megaFilter: 'all' })
    const regionsFound = new Set(pool.map((pokemon) => getRegion(pokemon.name)))

    expect(regionsFound).toEqual(new Set(['Kanto', 'Johto']))
  })

  it('excludes and isolates Mega forms', () => {
    const without = getFilteredPracticePool({ regions: [], megaFilter: 'exclude' })
    const only = getFilteredPracticePool({ regions: [], megaFilter: 'only' })

    expect(without.every((pokemon) => !isMegaFormName(pokemon.name))).toBe(true)
    expect(only.every((pokemon) => isMegaFormName(pokemon.name))).toBe(true)
    expect(without.length + only.length).toBe(pokemonPool.length)
  })

  it('combines region and form filters', () => {
    const pool = getFilteredPracticePool({ regions: ['Hisui'], megaFilter: 'only' })

    // Hisui has no Mega forms, so this combination is legitimately empty and
    // the UI has to handle it rather than crashing on an empty pick.
    expect(pool).toHaveLength(0)
    expect(pickRandomPokemon(pool)).toBeNull()
  })

  it('matches individual Pokémon consistently with the pool filter', () => {
    const filters = { regions: ['Kanto'], megaFilter: 'exclude' as const }
    const pool = getFilteredPracticePool(filters)

    for (const pokemon of pool.slice(0, 25)) {
      expect(matchesPracticeFilters(pokemon, filters)).toBe(true)
    }
  })
})

describe('challenge link encoding', () => {
  it.each(['Pikachu', 'Farfetch’d', 'Nidoran♀', 'Mr. Mime', 'Charizard Mega X', 'Flabébé'])(
    'round-trips %s',
    (name) => {
      expect(decodeChallengeName(encodeChallengeName(name))).toBe(name)
    },
  )

  it('does not leave the name readable in the link', () => {
    expect(encodeChallengeName('Pikachu')).not.toContain('Pikachu')
  })

  it('returns null for a corrupted code rather than throwing', () => {
    expect(decodeChallengeName('!!!not-valid-base64!!!')).toBeNull()
  })
})

describe('pickRandomPokemon', () => {
  it('returns null for an empty pool instead of undefined', () => {
    expect(pickRandomPokemon([])).toBeNull()
  })

  it('always returns a member of the pool', () => {
    const pool = pokemonPool.slice(0, 10)

    for (let i = 0; i < 50; i += 1) {
      expect(pool).toContain(pickRandomPokemon(pool))
    }
  })
})
