import { describe, expect, it } from 'vitest'

import {
  buildInteractionQueue,
  calculatePokemonMultiplier,
  findPokemonByName,
  formatTypeMultiplier,
  getDailySeed,
  getEvolutionStage,
  getPokemonBySeed,
  getRegion,
  getTypeMatchFeedback,
  getTypeSummary,
  normalizePokemonName,
  pokemonLookup,
  pokemonPool,
  searchPokemon,
  type PokemonEntry,
} from './pokemon'

describe('roster integrity', () => {
  it('has a lookup entry for every pooled Pokémon', () => {
    // v1 had duplicate entries whose lookup key collided, so a Pokémon could be
    // chosen as the daily answer while being unreachable by name.
    for (const pokemon of pokemonPool) {
      expect(pokemonLookup.get(normalizePokemonName(pokemon.name))).toBeDefined()
    }

    expect(pokemonLookup.size).toBe(pokemonPool.length)
  })

  it('has no duplicate names', () => {
    const names = pokemonPool.map((pokemon) => normalizePokemonName(pokemon.name))
    expect(new Set(names).size).toBe(names.length)
  })

  it('gives every entry at least one type and an ability', () => {
    for (const pokemon of pokemonPool) {
      expect(pokemon.types.length).toBeGreaterThan(0)
      expect(pokemon.types.length).toBeLessThanOrEqual(2)
      expect(pokemon.ability.length).toBeGreaterThan(0)
    }
  })

  it('has region and evolution data for every entry', () => {
    for (const pokemon of pokemonPool) {
      expect(getRegion(pokemon.name)).not.toBe('Unknown')
      expect(getEvolutionStage(pokemon.name)).toBeTruthy()
    }
  })
})

describe('type effectiveness', () => {
  const water: PokemonEntry = { name: 'Test Water', types: ['water'], ability: 'None' }
  const groundFlying: PokemonEntry = { name: 'Test Gligar', types: ['ground', 'flying'], ability: 'None' }
  const steelFlying: PokemonEntry = { name: 'Test Skarmory', types: ['steel', 'flying'], ability: 'None' }

  it('doubles damage on a single weakness', () => {
    expect(calculatePokemonMultiplier('grass', water.types)).toBe(2)
    expect(calculatePokemonMultiplier('electric', water.types)).toBe(2)
  })

  it('stacks weaknesses across both types for 4x', () => {
    // Ice hits both Ground and Flying for 2x each.
    expect(calculatePokemonMultiplier('ice', groundFlying.types)).toBe(4)
  })

  it('stacks resistances for 1/4x', () => {
    // Steel and Flying each resist Bug.
    expect(calculatePokemonMultiplier('bug', steelFlying.types)).toBe(0.25)
  })

  it('treats a type immunity as absolute, even against a weakness', () => {
    // Ground is immune to Electric despite Flying being weak to it.
    expect(calculatePokemonMultiplier('electric', groundFlying.types)).toBe(0)
  })

  it('applies ability-granted immunities', () => {
    expect(calculatePokemonMultiplier('ground', ['fire'], new Set(['ground']))).toBe(0)
  })

  it('sorts the clue queue weaknesses first', () => {
    const queue = buildInteractionQueue(groundFlying)
    const categories = queue.map((clue) => clue.category)
    const firstResistance = categories.indexOf('resistance')
    const lastWeakness = categories.lastIndexOf('weakness')

    expect(lastWeakness).toBeLessThan(firstResistance)
  })

  it('splits a summary into the right magnitude buckets', () => {
    const summary = getTypeSummary(groundFlying)

    expect(summary.weaknesses4x.map((clue) => clue.attackType)).toContain('ice')
    expect(summary.immunities.map((clue) => clue.attackType)).toContain('electric')

    for (const clue of summary.weaknesses2x) {
      expect(clue.multiplier).toBe(2)
    }

    for (const clue of summary.resistancesQuarter) {
      expect(clue.multiplier).toBe(0.25)
    }
  })
})

describe('formatTypeMultiplier', () => {
  it.each([
    [4, '4x'],
    [2, '2x'],
    [1, '1x'],
    [0.5, '1/2x'],
    [0.25, '1/4x'],
    [0, '0x'],
  ])('formats %s as %s', (multiplier, expected) => {
    expect(formatTypeMultiplier(multiplier)).toBe(expected)
  })

  it('never labels an immunity as a resistance', () => {
    // A naive threshold check reports 0 as "1/4x" because 0 <= 0.25.
    expect(formatTypeMultiplier(0)).not.toBe('1/4x')
  })
})

describe('getTypeMatchFeedback', () => {
  it('marks shared types as matches', () => {
    expect(getTypeMatchFeedback(['rock', 'ground'], ['ground'])).toEqual([
      { type: 'rock', isMatch: false },
      { type: 'ground', isMatch: true },
    ])
  })

  it('returns one entry per guessed type, not per target type', () => {
    expect(getTypeMatchFeedback(['water'], ['water', 'ground'])).toHaveLength(1)
  })

  it('reports no matches for a completely unrelated guess', () => {
    const feedback = getTypeMatchFeedback(['fire', 'flying'], ['water'])
    expect(feedback.every((entry) => !entry.isMatch)).toBe(true)
  })
})

describe('daily seed selection', () => {
  it('formats the seed as YYYY-MM-DD', () => {
    expect(getDailySeed(new Date('2026-09-05T12:00:00Z'))).toBe('2026-09-05')
  })

  it('is deterministic for a given seed', () => {
    expect(getPokemonBySeed('2026-09-05')).toBe(getPokemonBySeed('2026-09-05'))
  })

  it('produces different answers across nearby days', () => {
    const seeds = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05']
    const names = new Set(seeds.map((seed) => getPokemonBySeed(seed).name))

    expect(names.size).toBeGreaterThan(1)
  })

  it('always returns a real roster entry', () => {
    for (let day = 1; day <= 28; day += 1) {
      const seed = `2026-02-${String(day).padStart(2, '0')}`
      expect(getPokemonBySeed(seed)).toBeDefined()
      expect(findPokemonByName(getPokemonBySeed(seed).name)).toBeDefined()
    }
  })
})

describe('name normalisation and search', () => {
  it.each([
    ['Farfetch’d', 'farfetchd'],
    ['Mr. Mime', 'mrmime'],
    ['Nidoran♀', 'nidoran'],
    ['Type: Null', 'typenull'],
    ['  Pikachu  ', 'pikachu'],
  ])('normalises %s', (input, expected) => {
    expect(normalizePokemonName(input)).toBe(expected)
  })

  it('finds Pokémon regardless of punctuation or case', () => {
    expect(findPokemonByName('mr mime')?.name).toBe('Mr. Mime')
    expect(findPokemonByName('FARFETCHD')?.name).toBe('Farfetch’d')
  })

  it('ranks prefix matches ahead of substring matches', () => {
    const results = searchPokemon('char')
    expect(results[0].name.toLowerCase().startsWith('char')).toBe(true)
  })

  it('returns nothing for an empty query', () => {
    expect(searchPokemon('')).toEqual([])
  })
})
