import { pokemonPool as generatedPokemonPool } from './pokemon.generated'
import { pokemonVariants as generatedVariantPokemonPool } from './pokemon.variants.generated'
import { pokemonRegions } from './pokemon.regions.generated'
import { pokemonEvolutionStages } from './pokemon.evolution.generated'

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

export type EvolutionStage = 'first' | 'middle' | 'final' | 'mega' | 'no-evolution-line'

export type InteractionClue = {
  category: 'weakness' | 'resistance' | 'immunity' | 'neutral'
  attackType: PokemonType
  multiplier: number
}

type AttackProfile = {
  weakness: PokemonType[]
  resistance: PokemonType[]
}

export const pokemonTypes: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

// Attacker's perspective: which defending types this attack type hits hard or weakly.
const attackProfiles: Record<PokemonType, AttackProfile> = {
  normal: { weakness: [], resistance: ['rock', 'steel'] },
  fire: { weakness: ['grass', 'ice', 'bug', 'steel'], resistance: ['fire', 'water', 'rock', 'dragon'] },
  water: { weakness: ['fire', 'ground', 'rock'], resistance: ['water', 'grass', 'dragon'] },
  electric: { weakness: ['water', 'flying'], resistance: ['electric', 'grass', 'dragon'] },
  grass: {
    weakness: ['water', 'ground', 'rock'],
    resistance: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
  },
  ice: { weakness: ['grass', 'ground', 'flying', 'dragon'], resistance: ['fire', 'water', 'ice', 'steel'] },
  fighting: {
    weakness: ['normal', 'ice', 'rock', 'dark', 'steel'],
    resistance: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
  },
  poison: { weakness: ['grass', 'fairy'], resistance: ['poison', 'ground', 'rock', 'ghost'] },
  ground: { weakness: ['fire', 'electric', 'poison', 'rock', 'steel'], resistance: ['grass', 'bug'] },
  flying: { weakness: ['grass', 'fighting', 'bug'], resistance: ['electric', 'rock', 'steel'] },
  psychic: { weakness: ['fighting', 'poison'], resistance: ['psychic', 'steel'] },
  bug: {
    weakness: ['grass', 'psychic', 'dark'],
    resistance: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
  },
  rock: { weakness: ['fire', 'ice', 'flying', 'bug'], resistance: ['fighting', 'ground', 'steel'] },
  ghost: { weakness: ['psychic', 'ghost'], resistance: ['dark'] },
  dragon: { weakness: ['dragon'], resistance: ['steel'] },
  dark: { weakness: ['psychic', 'ghost'], resistance: ['fighting', 'dark', 'fairy'] },
  steel: { weakness: ['ice', 'rock', 'fairy'], resistance: ['fire', 'water', 'electric', 'steel'] },
  fairy: { weakness: ['fighting', 'dragon', 'dark'], resistance: ['fire', 'poison', 'steel'] },
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

const basePokemonPool = generatedPokemonPool as unknown as PokemonEntry[]
const variantPokemonPool = generatedVariantPokemonPool as unknown as PokemonEntry[]

function slugifyPokemonName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function normalizePokemonName(name: string) {
  return slugifyPokemonName(name.trim())
}

/**
 * The two source lists contain a handful of duplicate entries (e.g. "Meowth
 * Alola" appears twice). Deduping here keeps the pool, the lookup map and the
 * daily seed selection consistent with each other — previously the pool had
 * entries that could be selected as an answer but were unreachable by name,
 * because the lookup map had already overwritten them.
 */
export const pokemonPool: PokemonEntry[] = (() => {
  const seen = new Set<string>()
  const pool: PokemonEntry[] = []

  for (const pokemon of [...basePokemonPool, ...variantPokemonPool]) {
    const key = slugifyPokemonName(pokemon.name)

    if (!seen.has(key)) {
      seen.add(key)
      pool.push(pokemon)
    }
  }

  return pool
})()

export const pokemonLookup = new Map(pokemonPool.map((pokemon) => [slugifyPokemonName(pokemon.name), pokemon]))

export function findPokemonByName(name: string): PokemonEntry | undefined {
  return pokemonLookup.get(normalizePokemonName(name))
}

function hashSeed(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }

  return Math.abs(hash)
}

export function getDailySeed(now: Date = new Date()) {
  return now.toISOString().slice(0, 10)
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

function getAbilityImmunities(ability: string) {
  return abilityImmunityProfiles[normalizePokemonName(ability)] ?? []
}

export function calculatePokemonMultiplier(
  attackType: PokemonType,
  targetTypes: PokemonType[],
  abilityImmunities: Set<PokemonType> = new Set(),
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

export function buildInteractionQueue(target: PokemonEntry): InteractionClue[] {
  const abilityImmunities = new Set(getAbilityImmunities(target.ability))

  return pokemonTypes
    .map((attackType) => {
      const multiplier = calculatePokemonMultiplier(attackType, target.types, abilityImmunities)

      const category: InteractionClue['category'] =
        multiplier === 0 ? 'immunity' : multiplier > 1 ? 'weakness' : multiplier < 1 ? 'resistance' : 'neutral'

      return { attackType, category, multiplier }
    })
    .sort((left, right) => {
      const categoryRank = { weakness: 0, resistance: 1, immunity: 2, neutral: 3 } as const
      return categoryRank[left.category] - categoryRank[right.category] || left.attackType.localeCompare(right.attackType)
    })
}

export type TypeSummary = {
  weaknesses4x: InteractionClue[]
  weaknesses2x: InteractionClue[]
  resistancesHalf: InteractionClue[]
  resistancesQuarter: InteractionClue[]
  immunities: InteractionClue[]
}

export function getTypeSummary(target: PokemonEntry): TypeSummary {
  const queue = buildInteractionQueue(target)
  const weaknesses = queue.filter((clue) => clue.category === 'weakness')
  const resistances = queue.filter((clue) => clue.category === 'resistance')

  return {
    weaknesses4x: weaknesses.filter((clue) => clue.multiplier >= 4),
    weaknesses2x: weaknesses.filter((clue) => clue.multiplier < 4),
    resistancesHalf: resistances.filter((clue) => clue.multiplier > 0.25),
    resistancesQuarter: resistances.filter((clue) => clue.multiplier <= 0.25),
    immunities: queue.filter((clue) => clue.category === 'immunity'),
  }
}

export type TypeMatch = {
  type: PokemonType
  isMatch: boolean
}

/**
 * Wordle-style partial credit: for each of the guessed Pokemon's types, was it
 * also one of the target's types?
 */
export function getTypeMatchFeedback(guessedTypes: PokemonType[], targetTypes: PokemonType[]): TypeMatch[] {
  return guessedTypes.map((type) => ({ type, isMatch: targetTypes.includes(type) }))
}

export function formatTypeMultiplier(multiplier: number) {
  if (multiplier >= 4) return '4x'
  if (multiplier >= 2) return '2x'
  if (multiplier === 0) return '0x'
  if (multiplier <= 0.25) return '1/4x'
  if (multiplier <= 0.5) return '1/2x'
  return '1x'
}

export const unknownRegion = 'Unknown'

export function getRegion(name: string): string {
  return pokemonRegions[name] ?? unknownRegion
}

export function getEvolutionStage(name: string): EvolutionStage {
  return pokemonEvolutionStages[name] ?? 'no-evolution-line'
}

export function isMegaFormName(name: string) {
  return /\bmega\b/i.test(name)
}

export const regions = [
  'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova',
  'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea',
]

export function searchPokemon(query: string, limit = 8): PokemonEntry[] {
  const normalized = normalizePokemonName(query)

  if (!normalized) {
    return []
  }

  // Prefix matches first so typing "char" surfaces Charmander before Kangaskhan.
  const prefixed: PokemonEntry[] = []
  const contained: PokemonEntry[] = []

  for (const pokemon of pokemonPool) {
    const candidate = normalizePokemonName(pokemon.name)

    if (candidate.startsWith(normalized)) {
      prefixed.push(pokemon)
    } else if (candidate.includes(normalized)) {
      contained.push(pokemon)
    }

    if (prefixed.length >= limit) {
      break
    }
  }

  return [...prefixed, ...contained].slice(0, limit)
}
