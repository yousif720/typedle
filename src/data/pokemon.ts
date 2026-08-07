export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export type PokemonEntry = {
  name: string
  types: PokemonType[]
  ability: string
}

type AttackProfile = {
  weakness: PokemonType[]
  resistance: PokemonType[]
}

export type InteractionClue = {
  category: 'weakness' | 'resistance' | 'immunity' | 'neutral'
  attackType: PokemonType
  multiplier: number
}

import { pokemonPool as generatedPokemonPool } from './pokemon.generated'
import { pokemonVariants as generatedVariantPokemonPool } from './pokemon.variants.generated'

const attackProfiles: Record<PokemonType, AttackProfile> = {
  normal: {
    weakness: [],
    resistance: ['rock', 'steel'],
  },
  fire: {
    weakness: ['grass', 'ice', 'bug', 'steel'],
    resistance: ['fire', 'water', 'rock', 'dragon'],
  },
  water: {
    weakness: ['fire', 'ground', 'rock'],
    resistance: ['water', 'grass', 'dragon'],
  },
  electric: {
    weakness: ['water', 'flying'],
    resistance: ['electric', 'grass', 'dragon'],
  },
  grass: {
    weakness: ['water', 'ground', 'rock'],
    resistance: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
  },
  ice: {
    weakness: ['grass', 'ground', 'flying', 'dragon'],
    resistance: ['fire', 'water', 'ice', 'steel'],
  },
  fighting: {
    weakness: ['normal', 'ice', 'rock', 'dark', 'steel'],
    resistance: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
  },
  poison: {
    weakness: ['grass', 'fairy'],
    resistance: ['poison', 'ground', 'rock', 'ghost'],
  },
  ground: {
    weakness: ['fire', 'electric', 'poison', 'rock', 'steel'],
    resistance: ['grass', 'bug'],
  },
  flying: {
    weakness: ['grass', 'fighting', 'bug'],
    resistance: ['electric', 'rock', 'steel'],
  },
  psychic: {
    weakness: ['fighting', 'poison'],
    resistance: ['psychic', 'steel'],
  },
  bug: {
    weakness: ['grass', 'psychic', 'dark'],
    resistance: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
  },
  rock: {
    weakness: ['fire', 'ice', 'flying', 'bug'],
    resistance: ['fighting', 'ground', 'steel'],
  },
  ghost: {
    weakness: ['psychic', 'ghost'],
    resistance: ['dark'],
  },
  dragon: {
    weakness: ['dragon'],
    resistance: ['steel'],
  },
  dark: {
    weakness: ['psychic', 'ghost'],
    resistance: ['fighting', 'dark', 'fairy'],
  },
  steel: {
    weakness: ['ice', 'rock', 'fairy'],
    resistance: ['fire', 'water', 'electric', 'steel'],
  },
  fairy: {
    weakness: ['fighting', 'dragon', 'dark'],
    resistance: ['fire', 'poison', 'steel'],
  },
}

// Defender-side immunities: target type -> attack types that deal 0x damage.
const defensiveImmunities: Record<PokemonType, PokemonType[]> = {
  normal: ['ghost'],
  fire: [],
  water: [],
  electric: [],
  grass: [],
  ice: [],
  fighting: [],
  poison: [],
  ground: ['electric'],
  flying: ['ground'],
  psychic: [],
  bug: [],
  rock: [],
  ghost: ['normal', 'fighting'],
  dragon: [],
  dark: ['psychic'],
  steel: ['poison'],
  fairy: ['dragon'],
}

const basePokemonPool = generatedPokemonPool as unknown as PokemonEntry[]
const variantPokemonPool = generatedVariantPokemonPool as unknown as PokemonEntry[]

export const pokemonPool: PokemonEntry[] = [...basePokemonPool, ...variantPokemonPool]

function slugifyPokemonName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function normalizePokemonName(name: string) {
  return slugifyPokemonName(name.trim())
}

export const pokemonLookup = new Map(
  pokemonPool.map((pokemon) => [slugifyPokemonName(pokemon.name), pokemon]),
)

function hashSeed(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }

  return Math.abs(hash)
}

export function getDailySeed() {
  return new Date().toISOString().slice(0, 10)
}

export function getPokemonBySeed(seed: string) {
  return pokemonPool[hashSeed(seed) % pokemonPool.length]
}

function calculateMultiplier(attackType: PokemonType, targetType: PokemonType) {
  const profile = attackProfiles[attackType]

  if (defensiveImmunities[targetType].includes(attackType)) {
    return 0
  }

  if (profile.weakness.includes(targetType)) {
    return 2
  }

  if (profile.resistance.includes(targetType)) {
    return 0.5
  }

  return 1
}

const abilityImmunityProfiles: Record<string, PokemonType[]> = {
  levitate: ['ground'],
  eartheater: ['ground'],
  flashfire: ['fire'],
  waterabsorb: ['water'],
  stormdrain: ['water'],
  dryskin: ['water'],
  voltabsorb: ['electric'],
  motordrive: ['electric'],
  lightningrod: ['electric'],
  sapsipper: ['grass'],
  wellbakedbody: ['fire'],
}

function getAbilityImmunities(ability: string) {
  return abilityImmunityProfiles[normalizePokemonName(ability)] ?? []
}

function calculatePokemonMultiplier(
  attackType: PokemonType,
  targetTypes: PokemonType[],
  abilityImmunities: Set<PokemonType>,
) {
  if (abilityImmunities.has(attackType)) {
    return 0
  }

  let multiplier = 1

  for (const targetType of targetTypes) {
    const targetMultiplier = calculateMultiplier(attackType, targetType)

    if (targetMultiplier === 0) {
      return 0
    }

    multiplier *= targetMultiplier
  }

  return multiplier
}

export function buildInteractionQueue(target: PokemonEntry) {
  const queue: InteractionClue[] = []
  const abilityImmunities = new Set(getAbilityImmunities(target.ability))

  for (const attackType of Object.keys(attackProfiles) as PokemonType[]) {
    const multiplier = calculatePokemonMultiplier(attackType, target.types, abilityImmunities)

    const category =
      multiplier === 0
        ? 'immunity'
        : multiplier > 1
          ? 'weakness'
          : multiplier < 1
            ? 'resistance'
            : 'neutral'

    queue.push({
      attackType,
      category,
      multiplier,
    })
  }

  return queue
    .filter((clue) => clue.category !== 'neutral' || clue.multiplier === 1)
    .sort((left, right) => {
      const categoryRank = {
        weakness: 0,
        resistance: 1,
        immunity: 2,
        neutral: 3,
      } as const

      return categoryRank[left.category] - categoryRank[right.category] || left.attackType.localeCompare(right.attackType)
    })
}

export function getTypeSummary(target: PokemonEntry) {
  const queue = buildInteractionQueue(target)

  return {
    weaknesses: queue.filter((clue) => clue.category === 'weakness'),
    neutral: queue.filter((clue) => clue.category === 'neutral'),
    resistances: queue.filter((clue) => clue.category === 'resistance'),
    immunities: queue.filter((clue) => clue.category === 'immunity'),
  }
}

export type TypeMatch = {
  type: PokemonType
  isMatch: boolean
}

// Wordle-style partial credit: for each of the guessed Pokemon's types, was
// that type also one of the target's types? Order follows the guess's own
// types array so a guess always renders the same way regardless of target.
export function getTypeMatchFeedback(guessedTypes: PokemonType[], targetTypes: PokemonType[]): TypeMatch[] {
  return guessedTypes.map((type) => ({
    type,
    isMatch: targetTypes.includes(type),
  }))
}
