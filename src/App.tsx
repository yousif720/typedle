import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './App.css'
import {
  type InteractionClue,
  type PokemonEntry,
  getDailySeed,
  getPokemonBySeed,
  getTypeSummary,
  normalizePokemonName,
  pokemonLookup,
  pokemonPool,
} from './data/pokemon'
import { pokemonRegions } from './data/pokemon.regions.generated'

type StreakState = {
  current: number
  best: number
  lastSeed: string | null
}

type EvolutionStage = 'loading' | 'first' | 'middle' | 'final' | 'mega' | 'no-evolution-line'

type EvolutionChainNode = {
  species?: { name?: string }
  evolves_to?: EvolutionChainNode[]
}

const dailyAssignmentsStorageKeyPrefix = 'typedle-daily-pokemon-v1-'
const globalStatsStorageKey = 'typedle-global-stats-v1'
const configuredStatsApiBaseUrl = import.meta.env.VITE_STATS_API_BASE_URL?.trim() ?? 'https://typedle.onrender.com'
const globalStatsApiBaseUrl = configuredStatsApiBaseUrl.replace(/\/+$/g, '')
const globalStatsApiPath = `${globalStatsApiBaseUrl}/api/stats/global`
const authApiBasePath = `${globalStatsApiBaseUrl}/api/auth`
const guestClientIdStorageKey = 'typedle-guest-client-id-v1'
const dayStateCookiePrefix = 'typedle-daystate-'
const dayStateCookieLifetimeDays = 365
const currentUserStorageKey = 'typedle-current-user-v1'

type DailyAssignments = Record<string, string>

type DayState = {
  guessValue: string
  message: string
  wrongGuessCount: number
  solved: boolean
  failed: boolean
  lastSubmittedPokemon: string
  guessHistory: string[]
}

type UserProfile = {
  userKey: string
  username: string
}

type UserCompletion = {
  seed: string
  solved: boolean
  failed: boolean
  attemptsUsed: number
  guessedPokemon: string
  targetPokemon: string
  guessHistory: string[]
  completedAt: string
}

type UserCompletionsMap = Record<string, UserCompletion>

type GuessDistribution = {
  1: number
  2: number
  3: number
  4: number
  5: number
  6: number
}

type UserStats = {
  played: number
  wins: number
  losses: number
  guessDistribution: GuessDistribution
  totalWinningGuesses: number
  recordedSeeds: string[]
}

type GlobalStatsOutcome = {
  seed: string
  outcomeId: string
  solved: boolean
  attemptsUsed: number
}

type UserProgress = {
  streakState: StreakState
  stats: UserStats
}

const typeIconFiles = {
  normal: 'normal',
  fire: 'fire',
  water: 'water',
  electric: 'electric',
  grass: 'grass',
  ice: 'ice',
  fighting: 'fighting',
  poison: 'poison',
  ground: 'ground',
  flying: 'flying',
  psychic: 'psychic',
  bug: 'bug',
  rock: 'rock',
  ghost: 'ghost',
  dragon: 'dragon',
  dark: 'dark',
  steel: 'steel',
  fairy: 'fairy',
} as const

const typeIconUrls = Object.fromEntries(
  Object.entries({
    normal: 'Normal_icon_SV.png',
    fire: 'Fire_icon_SV.png',
    water: 'Water_icon_SV.png',
    electric: 'Electric_icon_SV.png',
    grass: 'Grass_icon_SV.png',
    ice: 'Ice_icon_SV.png',
    fighting: 'Fighting_icon_SV.png',
    poison: 'Poison_icon_SV.png',
    ground: 'Ground_icon_SV.png',
    flying: 'Flying_icon_SV.png',
    psychic: 'Psychic_icon_SV.png',
    bug: 'Bug_icon_SV.png',
    rock: 'Rock_icon_SV.png',
    ghost: 'Ghost_icon_SV.png',
    dragon: 'Dragon_icon_SV.png',
    dark: 'Dark_icon_SV.png',
    steel: 'Steel_icon_SV.png',
    fairy: 'Fairy_icon_SV.png',
  }).map(([type, fileName]) => [
    type,
    `/type-icons/${fileName}`,
  ]),
) as Record<keyof typeof typeIconFiles, string>

function renderStopSymbol(label: string) {
  return (
    <span className="tile tile-empty" title={label} aria-label={label}>
      <svg className="stop-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M7.8 7.8 16.2 16.2" />
      </svg>
    </span>
  )
}

function formatTypeMultiplier(multiplier: number) {
  if (multiplier >= 4) {
    return '4x'
  }

  if (multiplier >= 2) {
    return '2x'
  }

  if (multiplier <= 0.25) {
    return '1/4x'
  }

  if (multiplier <= 0.5) {
    return '1/2x'
  }

  return '1x'
}

function renderTypeTiles(
  values: readonly InteractionClue[],
  className: string,
  labelMode: 'none' | 'multiplier' | 'neutral' | 'immune' = 'none',
) {
  if (values.length === 0) {
    return renderStopSymbol('none')
  }

  return values.map((clue) => {
    const type = clue.attackType
    const multiplierLabel =
      labelMode === 'multiplier'
        ? formatTypeMultiplier(clue.multiplier)
        : labelMode === 'neutral'
          ? '1x'
          : labelMode === 'immune'
            ? '0x'
            : ''

    return (
      <span
        key={`${type}-${multiplierLabel}`}
        className={`tile ${className}${labelMode !== 'none' ? ' tile-with-multiplier' : ''}`}
        title={labelMode !== 'none' ? `${type} ${multiplierLabel}` : type}
        aria-label={labelMode !== 'none' ? `${type} ${multiplierLabel}` : type}
      >
        <img className="type-icon" src={typeIconUrls[type as keyof typeof typeIconUrls]} alt="" aria-hidden="true" />
        {labelMode !== 'none' ? <span className="tile-multiplier">{multiplierLabel}</span> : null}
      </span>
    )
  })
}

type ClueMagnitudeGroup = {
  key: string
  clues: readonly InteractionClue[]
  className: string
  labelMode: 'multiplier' | 'immune'
}

function renderClueMagnitudeRows(groups: readonly ClueMagnitudeGroup[]) {
  const nonEmptyGroups = groups.filter((group) => group.clues.length > 0)

  if (nonEmptyGroups.length === 0) {
    return <div className="tile-group">{renderStopSymbol('none')}</div>
  }

  return (
    <div className="tile-subrows">
      {nonEmptyGroups.map((group) => (
        <div className="tile-group" key={group.key}>
          {renderTypeTiles(group.clues, group.className, group.labelMode)}
        </div>
      ))}
    </div>
  )
}

function renderPlaceholderTile() {
  return (
    <span className="tile tile-placeholder" aria-label="unrevealed clue">
      ?
    </span>
  )
}

function renderAbilityTile(ability: string) {
  const words = ability.split(/\s+/).filter(Boolean)

  return (
    <span className="tile tile-ability tile-revealed" aria-label={ability}>
      <span className="ability-stack">
        {words.map((word) => (
          <span key={word} className="ability-word">
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}

function toPokemonSlug(name: string) {
  return name
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/['’]/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents, e.g. Flabébé -> Flabebe
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Roster entries append these words to a base species name to describe a form
// (e.g. "Charizard Mega X", "Raticate Totem Alola"). PokeAPI's species/evolution
// data only exists under the base species slug, so guessing a form-qualified
// slug (especially for the roster's non-canonical "Mega X/Y/Z" entries) is
// unreliable. Stripping these words first gives a slug that always resolves.
const formModifierWords = new Set([
  'mega',
  'x',
  'y',
  'z',
  'primal',
  'alola',
  'cap',
  'galar',
  'hisui',
  'paldea',
  'totem',
  'original',
  'color',
  'curly',
  'droopy',
  'stretchy',
  'form',
  'blaze',
  'aqua',
  'combat',
  'three',
  'segment',
])

function getBaseSpeciesName(name: string) {
  const words = name.trim().split(/\s+/)

  while (words.length > 1 && formModifierWords.has(words[words.length - 1].toLowerCase())) {
    words.pop()
  }

  return words.join(' ')
}

function getBaseSpeciesSlug(name: string) {
  return toPokemonSlug(getBaseSpeciesName(name))
}

function isMegaFormName(name: string) {
  return /\bmega\b/i.test(name)
}

function renderEvolutionTile(stage: EvolutionStage) {
  if (stage === 'loading') {
    return renderPlaceholderTile()
  }

  const words = stage === 'no-evolution-line' ? ['No', 'Evolution', 'Line'] : [stage === 'mega' ? 'Mega' : stage.charAt(0).toUpperCase() + stage.slice(1)]

  return (
    <span className="tile tile-stage tile-revealed" aria-label={stage.replace(/-/g, ' ')}>
      <span className="stage-stack">
        {words.map((word) => (
          <span key={word} className="stage-word">
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}

const generationRegionMap: Record<string, string> = {
  'generation-i': 'Kanto',
  'generation-ii': 'Johto',
  'generation-iii': 'Hoenn',
  'generation-iv': 'Sinnoh',
  'generation-v': 'Unova',
  'generation-vi': 'Kalos',
  'generation-vii': 'Alola',
  'generation-viii': 'Galar',
  'generation-ix': 'Paldea',
}

function getRegionalFormOverride(name: string) {
  const normalizedName = normalizePokemonName(name)

  if (normalizedName.includes('hisui')) {
    return 'Hisui'
  }

  if (normalizedName.includes('alola')) {
    return 'Alola'
  }

  if (normalizedName.includes('galar')) {
    return 'Galar'
  }

  if (normalizedName.includes('paldea')) {
    return 'Paldea'
  }

  return null
}

function resolveOriginRegion(name: string, generationName?: string) {
  const regionalOverride = getRegionalFormOverride(name)

  if (regionalOverride) {
    return regionalOverride
  }

  if (generationName && generationRegionMap[generationName]) {
    return generationRegionMap[generationName]
  }

  return 'Unknown'
}

function renderRegionTile(region: string) {
  const words = region.split(/\s+/).filter(Boolean)

  return (
    <span className="tile tile-region tile-revealed" aria-label={region}>
      <span className="stage-stack">
        {words.map((word) => (
          <span key={word} className="stage-word">
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}

type EvolutionChainMatch = {
  node: EvolutionChainNode
  // Number of evolution steps below the chain root. The evolution-chain API
  // doesn't mark a node with its pre-evolution (that field only exists on the
  // species resource), so depth from the root is what tells first/middle/final apart.
  depth: number
}

function findSpeciesInChain(
  chain: EvolutionChainNode | undefined,
  speciesName: string,
  depth = 0,
): EvolutionChainMatch | null {
  if (!chain) {
    return null
  }

  if (chain.species?.name === speciesName) {
    return { node: chain, depth }
  }

  for (const nextChain of chain.evolves_to ?? []) {
    const found = findSpeciesInChain(nextChain, speciesName, depth + 1)

    if (found) {
      return found
    }
  }

  return null
}

function resolveEvolutionStage(chain: EvolutionChainNode | undefined, speciesName: string): EvolutionStage {
  const match = findSpeciesInChain(chain, speciesName)

  if (!match) {
    return 'no-evolution-line'
  }

  const hasPreEvolution = match.depth > 0
  const hasEvolutions = (match.node.evolves_to?.length ?? 0) > 0

  if (!hasPreEvolution && !hasEvolutions) {
    return 'no-evolution-line'
  }

  if (!hasPreEvolution && hasEvolutions) {
    return 'first'
  }

  if (hasPreEvolution && hasEvolutions) {
    return 'middle'
  }

  return 'final'
}

function getPreviousSeed(seed: string) {
  const date = new Date(`${seed}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

const practiceSeedPrefix = 'practice-'
const challengeSeedPrefix = 'challenge-'

function isPracticeSeed(seed: string) {
  return seed.startsWith(practiceSeedPrefix)
}

function isChallengeSeed(seed: string) {
  return seed.startsWith(challengeSeedPrefix)
}

// Practice rounds and create-a-dle challenge rounds are both one-off, not tied
// to a calendar day, and must never touch streaks, per-user stats, completions,
// or the shared global stats file.
function isNonDailySeed(seed: string) {
  return isPracticeSeed(seed) || isChallengeSeed(seed)
}

function createRandomId() {
  return typeof window !== 'undefined' && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createPracticeSeed() {
  return `${practiceSeedPrefix}${createRandomId()}`
}

function createChallengeSeed() {
  return `${challengeSeedPrefix}${createRandomId()}`
}

const challengeQueryParam = 'dle'

function encodeChallengePokemonName(name: string) {
  return typeof window === 'undefined' ? '' : window.btoa(encodeURIComponent(name))
}

function decodeChallengePokemonName(encoded: string) {
  try {
    return decodeURIComponent(window.atob(encoded))
  } catch {
    return null
  }
}

function readChallengeCodeFromLocation() {
  if (typeof window === 'undefined') {
    return null
  }

  const params = new URLSearchParams(window.location.search)
  return params.get(challengeQueryParam)
}

function resolveInitialChallengePokemon(): PokemonEntry | null {
  const code = readChallengeCodeFromLocation()

  if (!code) {
    return null
  }

  const decodedName = decodeChallengePokemonName(code)
  return (decodedName && pokemonLookup.get(normalizePokemonName(decodedName))) || null
}

const practiceRegionOrder = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Hisui',
  'Paldea',
]

type MegaFilter = 'all' | 'exclude' | 'only'

type PracticeFilters = {
  // Empty set means "no region filter" (every region allowed).
  regions: Set<string>
  megaFilter: MegaFilter
}

function createDefaultPracticeFilters(): PracticeFilters {
  return { regions: new Set(), megaFilter: 'all' }
}

function matchesPracticeFilters(pokemon: PokemonEntry, filters: PracticeFilters) {
  if (filters.regions.size > 0) {
    const region = pokemonRegions[pokemon.name] ?? 'Unknown'

    if (!filters.regions.has(region)) {
      return false
    }
  }

  if (filters.megaFilter === 'exclude' && isMegaFormName(pokemon.name)) {
    return false
  }

  if (filters.megaFilter === 'only' && !isMegaFormName(pokemon.name)) {
    return false
  }

  return true
}

function getFilteredPracticePool(filters: PracticeFilters) {
  return pokemonPool.filter((pokemon) => matchesPracticeFilters(pokemon, filters))
}

function pickRandomPokemon(candidates: readonly PokemonEntry[]) {
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

function getDailyAssignmentsStorageKey(userKey: string) {
  return `${dailyAssignmentsStorageKeyPrefix}${userKey}`
}

function getDayStateCookieName(seed: string, userKey: string) {
  return `${dayStateCookiePrefix}${userKey}-${seed}`
}

function coerceStats(rawStats: Partial<UserStats> | null | undefined): UserStats {
  const baseStats = createEmptyUserStats()
  const stats = rawStats ?? {}

  return {
    played: typeof stats.played === 'number' ? stats.played : baseStats.played,
    wins: typeof stats.wins === 'number' ? stats.wins : baseStats.wins,
    losses: typeof stats.losses === 'number' ? stats.losses : baseStats.losses,
    guessDistribution: {
      1: typeof stats.guessDistribution?.[1] === 'number' ? stats.guessDistribution[1] : 0,
      2: typeof stats.guessDistribution?.[2] === 'number' ? stats.guessDistribution[2] : 0,
      3: typeof stats.guessDistribution?.[3] === 'number' ? stats.guessDistribution[3] : 0,
      4: typeof stats.guessDistribution?.[4] === 'number' ? stats.guessDistribution[4] : 0,
      5: typeof stats.guessDistribution?.[5] === 'number' ? stats.guessDistribution[5] : 0,
      6: typeof stats.guessDistribution?.[6] === 'number' ? stats.guessDistribution[6] : 0,
    },
    totalWinningGuesses:
      typeof stats.totalWinningGuesses === 'number'
        ? stats.totalWinningGuesses
        : baseStats.totalWinningGuesses,
    recordedSeeds: Array.isArray(stats.recordedSeeds)
      ? stats.recordedSeeds.filter((seed) => typeof seed === 'string')
      : [],
  }
}

function createEmptyUserStats(): UserStats {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    guessDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    totalWinningGuesses: 0,
    recordedSeeds: [],
  }
}

function loadGlobalStatsCache(): Record<string, UserStats> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(globalStatsStorageKey)

    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as unknown

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }

    const cache: Record<string, UserStats> = {}

    for (const [entrySeed, rawStats] of Object.entries(parsedValue as Record<string, Partial<UserStats>>)) {
      if (typeof entrySeed === 'string' && entrySeed.length > 0) {
        cache[entrySeed] = coerceStats(rawStats)
      }
    }

    return cache
  } catch {
    return {}
  }
}

function loadGlobalStatsForSeed(seed: string): UserStats {
  const cache = loadGlobalStatsCache()
  return cache[seed] ? coerceStats(cache[seed]) : createEmptyUserStats()
}

function saveGlobalStatsForSeed(seed: string, stats: UserStats) {
  if (typeof window === 'undefined') {
    return
  }

  const cache = loadGlobalStatsCache()
  cache[seed] = coerceStats(stats)
  window.localStorage.setItem(globalStatsStorageKey, JSON.stringify(cache))
}

function getOrCreateGuestClientId() {
  if (typeof window === 'undefined') {
    return 'guest-server'
  }

  const existingValue = window.localStorage.getItem(guestClientIdStorageKey)

  if (existingValue) {
    return existingValue
  }

  const generatedValue = window.crypto?.randomUUID?.() ?? `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  window.localStorage.setItem(guestClientIdStorageKey, generatedValue)
  return generatedValue
}

function applyOutcomeToStats(stats: UserStats, outcome: GlobalStatsOutcome) {
  const safeStats = coerceStats(stats)

  if (safeStats.recordedSeeds.includes(outcome.outcomeId)) {
    return safeStats
  }

  return {
    ...safeStats,
    played: safeStats.played + 1,
    wins: safeStats.wins + (outcome.solved ? 1 : 0),
    losses: safeStats.losses + (outcome.solved ? 0 : 1),
    totalWinningGuesses: safeStats.totalWinningGuesses + (outcome.solved ? outcome.attemptsUsed : 0),
    recordedSeeds: [...safeStats.recordedSeeds, outcome.outcomeId],
    guessDistribution: {
      ...safeStats.guessDistribution,
      [outcome.attemptsUsed]: outcome.solved
        ? safeStats.guessDistribution[outcome.attemptsUsed as keyof GuessDistribution] + 1
        : safeStats.guessDistribution[outcome.attemptsUsed as keyof GuessDistribution],
    },
  }
}

async function fetchGlobalStatsFromApi(seed: string) {
  const response = await fetch(`${globalStatsApiPath}?seed=${encodeURIComponent(seed)}`)

  if (!response.ok) {
    throw new Error('Unable to load global stats.')
  }

  const payload = (await response.json()) as { stats?: Partial<UserStats> }
  return coerceStats(payload.stats)
}

async function submitGlobalOutcomeToApi(outcome: GlobalStatsOutcome) {
  const response = await fetch(globalStatsApiPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(outcome),
  })

  if (!response.ok) {
    throw new Error('Unable to update global stats.')
  }

  const payload = (await response.json()) as { stats?: Partial<UserStats> }
  return coerceStats(payload.stats)
}

async function fetchUserProfileFromApi(userKey: string): Promise<UserProfile> {
  const response = await fetch(`${authApiBasePath}/users/${encodeURIComponent(userKey)}`)

  if (!response.ok) {
    throw new Error('Unable to load account profile.')
  }

  const payload = (await response.json()) as { user?: Partial<UserProfile> }

  if (!payload.user || typeof payload.user.userKey !== 'string' || typeof payload.user.username !== 'string') {
    throw new Error('Invalid account profile response.')
  }

  return {
    userKey: payload.user.userKey,
    username: payload.user.username,
  }
}

async function registerUserWithApi(userKey: string, username: string, passwordHash: string): Promise<UserProfile> {
  const response = await fetch(`${authApiBasePath}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userKey, username, passwordHash }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? 'Unable to create account.')
  }

  const payload = (await response.json()) as { user?: Partial<UserProfile> }

  if (!payload.user || typeof payload.user.userKey !== 'string' || typeof payload.user.username !== 'string') {
    throw new Error('Invalid registration response.')
  }

  return {
    userKey: payload.user.userKey,
    username: payload.user.username,
  }
}

async function loginUserWithApi(userKey: string, passwordHash: string): Promise<UserProfile> {
  const response = await fetch(`${authApiBasePath}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userKey, passwordHash }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? 'Invalid username or password.')
  }

  const payload = (await response.json()) as { user?: Partial<UserProfile> }

  if (!payload.user || typeof payload.user.userKey !== 'string' || typeof payload.user.username !== 'string') {
    throw new Error('Invalid login response.')
  }

  return {
    userKey: payload.user.userKey,
    username: payload.user.username,
  }
}

async function fetchUserCompletionsFromApi(userKey: string): Promise<UserCompletionsMap> {
  const response = await fetch(`${authApiBasePath}/users/${encodeURIComponent(userKey)}/completions`)

  if (!response.ok) {
    throw new Error('Unable to load completion history.')
  }

  const payload = (await response.json()) as { completions?: Record<string, Partial<UserCompletion>> }
  const completions: UserCompletionsMap = {}

  if (!payload.completions || typeof payload.completions !== 'object') {
    return completions
  }

  for (const [entrySeed, entryValue] of Object.entries(payload.completions)) {
    if (!entryValue || typeof entryValue !== 'object') {
      continue
    }

    const solved = Boolean(entryValue.solved)
    const failed = Boolean(entryValue.failed)
    const attemptsUsed = typeof entryValue.attemptsUsed === 'number' ? Math.max(1, Math.min(6, entryValue.attemptsUsed)) : 1
    const guessedPokemon = typeof entryValue.guessedPokemon === 'string' ? entryValue.guessedPokemon : ''
    const targetPokemon = typeof entryValue.targetPokemon === 'string' ? entryValue.targetPokemon : ''
    const guessHistory = Array.isArray(entryValue.guessHistory)
      ? entryValue.guessHistory.filter((value): value is string => typeof value === 'string')
      : []
    const completedAt = typeof entryValue.completedAt === 'string' ? entryValue.completedAt : new Date(0).toISOString()

    completions[entrySeed] = {
      seed: entrySeed,
      solved,
      failed,
      attemptsUsed,
      guessedPokemon,
      targetPokemon,
      guessHistory,
      completedAt,
    }
  }

  return completions
}

async function submitUserCompletionToApi(userKey: string, completion: UserCompletion): Promise<{ completion: UserCompletion, deduped: boolean }> {
  const response = await fetch(`${authApiBasePath}/users/${encodeURIComponent(userKey)}/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(completion),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? 'Unable to save completion.')
  }

  const payload = (await response.json()) as { completion?: Partial<UserCompletion>, deduped?: boolean }

  if (!payload.completion || typeof payload.completion.seed !== 'string') {
    throw new Error('Invalid completion response.')
  }

  const safeCompletion: UserCompletion = {
    seed: payload.completion.seed,
    solved: Boolean(payload.completion.solved),
    failed: Boolean(payload.completion.failed),
    attemptsUsed:
      typeof payload.completion.attemptsUsed === 'number'
        ? Math.max(1, Math.min(6, payload.completion.attemptsUsed))
        : 1,
    guessedPokemon: typeof payload.completion.guessedPokemon === 'string' ? payload.completion.guessedPokemon : '',
    targetPokemon: typeof payload.completion.targetPokemon === 'string' ? payload.completion.targetPokemon : '',
    guessHistory: Array.isArray(payload.completion.guessHistory)
      ? payload.completion.guessHistory.filter((value): value is string => typeof value === 'string')
      : [],
    completedAt: typeof payload.completion.completedAt === 'string' ? payload.completion.completedAt : new Date(0).toISOString(),
  }

  return {
    completion: safeCompletion,
    deduped: Boolean(payload.deduped),
  }
}

function coerceStreakState(rawState: Partial<StreakState> | null | undefined): StreakState {
  const state = rawState ?? {}

  return {
    current: typeof state.current === 'number' ? Math.max(0, state.current) : 0,
    best: typeof state.best === 'number' ? Math.max(0, state.best) : 0,
    lastSeed: typeof state.lastSeed === 'string' ? state.lastSeed : null,
  }
}

async function fetchUserProgressFromApi(userKey: string): Promise<UserProgress> {
  const response = await fetch(`${authApiBasePath}/users/${encodeURIComponent(userKey)}/progress`)

  if (!response.ok) {
    throw new Error('Unable to load user progress.')
  }

  const payload = (await response.json()) as {
    progress?: {
      streakState?: Partial<StreakState>
      stats?: Partial<UserStats>
    }
  }

  return {
    streakState: coerceStreakState(payload.progress?.streakState),
    stats: coerceStats(payload.progress?.stats),
  }
}

async function saveUserProgressToApi(userKey: string, progress: Partial<UserProgress>): Promise<UserProgress> {
  const response = await fetch(`${authApiBasePath}/users/${encodeURIComponent(userKey)}/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(progress),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? 'Unable to save user progress.')
  }

  const payload = (await response.json()) as {
    progress?: {
      streakState?: Partial<StreakState>
      stats?: Partial<UserStats>
    }
  }

  return {
    streakState: coerceStreakState(payload.progress?.streakState),
    stats: coerceStats(payload.progress?.stats),
  }
}

async function hashPassword(password: string) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Secure hashing is not available in this browser.')
  }

  const encoded = new TextEncoder().encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', encoded)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function loadDailyAssignments(userKey: string): DailyAssignments {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getDailyAssignmentsStorageKey(userKey))

    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as unknown

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }

    const assignments: DailyAssignments = {}

    for (const [seed, pokemonName] of Object.entries(parsedValue as Record<string, unknown>)) {
      if (typeof seed === 'string' && typeof pokemonName === 'string' && seed.length > 0 && pokemonName.length > 0) {
        assignments[seed] = pokemonName
      }
    }

    return assignments
  } catch {
    return {}
  }
}

function saveDailyAssignments(assignments: DailyAssignments, userKey: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getDailyAssignmentsStorageKey(userKey), JSON.stringify(assignments))
}

function setCookieValue(name: string, value: string, lifetimeDays: number) {
  if (typeof document === 'undefined') {
    return
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + lifetimeDays)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`
}

function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const entries = document.cookie.split(';')

  for (const entry of entries) {
    const trimmedEntry = entry.trim()

    if (trimmedEntry.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmedEntry.slice(name.length + 1))
    }
  }

  return null
}

function loadDayState(seed: string, userKey: string): DayState | null {
  const rawValue = getCookieValue(getDayStateCookieName(seed, userKey))

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<DayState>

    if (
      typeof parsedValue.guessValue !== 'string' ||
      typeof parsedValue.message !== 'string' ||
      typeof parsedValue.wrongGuessCount !== 'number' ||
      typeof parsedValue.solved !== 'boolean' ||
      typeof parsedValue.failed !== 'boolean'
    ) {
      return null
    }

    return {
      guessValue: parsedValue.guessValue,
      message: parsedValue.message,
      wrongGuessCount: Math.max(0, Math.min(6, parsedValue.wrongGuessCount)),
      lastSubmittedPokemon: typeof parsedValue.lastSubmittedPokemon === 'string' ? parsedValue.lastSubmittedPokemon : '',
      guessHistory: Array.isArray(parsedValue.guessHistory)
        ? parsedValue.guessHistory.filter((value): value is string => typeof value === 'string')
        : [],
      solved: parsedValue.solved,
      failed: parsedValue.failed,
    }
  } catch {
    return null
  }
}

function saveDayState(seed: string, userKey: string, dayState: DayState) {
  setCookieValue(getDayStateCookieName(seed, userKey), JSON.stringify(dayState), dayStateCookieLifetimeDays)
}

function resolvePokemonForSeed(seed: string, assignments: DailyAssignments) {
  const assignedName = assignments[seed]

  if (assignedName) {
    const assignedPokemon = pokemonLookup.get(normalizePokemonName(assignedName))

    if (assignedPokemon) {
      return assignedPokemon
    }
  }

  return getPokemonBySeed(seed)
}

function TypeDleLogo() {
  return (
    <svg className="typedle-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 118" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logoBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9EF" />
          <stop offset="100%" stopColor="#F5F0E2" />
        </linearGradient>
        <linearGradient id="logoBridge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4B4B" />
          <stop offset="18%" stopColor="#E13A4F" />
          <stop offset="28%" stopColor="#FF8A3D" />
          <stop offset="40%" stopColor="#FFD84A" />
          <stop offset="52%" stopColor="#3EDB73" />
          <stop offset="64%" stopColor="#2CC7FF" />
          <stop offset="76%" stopColor="#4F63FF" />
          <stop offset="78.5%" stopColor="#5462FC" />
          <stop offset="81%" stopColor="#5960F8" />
          <stop offset="83%" stopColor="#605CF2" />
          <stop offset="85%" stopColor="#6859EC" />
          <stop offset="87%" stopColor="#7256E8" />
          <stop offset="89%" stopColor="#7E52EE" />
          <stop offset="90%" stopColor="#8B50F5" />
          <stop offset="91%" stopColor="#9A4DFF" />
          <stop offset="100%" stopColor="#9A4DFF" />
        </linearGradient>
        <radialGradient id="logoLeftHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(54 59) rotate(90) scale(42)">
          <stop offset="0%" stopColor="#FFD2CD" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FFD2CD" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="logoRightHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(366 59) rotate(90) scale(32)">
          <stop offset="0%" stopColor="#E3D3FF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E3D3FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pokeTopBlend" x1="34" y1="39" x2="74" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5A4A" />
          <stop offset="100%" stopColor="#E74653" />
        </linearGradient>
        <linearGradient id="masterTopBlend" x1="346" y1="39" x2="386" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5D66FF" />
          <stop offset="100%" stopColor="#8F4FFF" />
        </linearGradient>
        <clipPath id="pokeBallClip" clipPathUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="20" />
        </clipPath>
        <linearGradient id="logoTextFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F8FF" />
        </linearGradient>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="170%">
          <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#1A2235" floodOpacity="0.28" />
        </filter>
        <filter id="logoTextGlow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.9" floodColor="#FFFFFF" floodOpacity="0.8" />
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.2" floodColor="#0B1020" floodOpacity="0.5" />
        </filter>
      </defs>

      <rect x="8" y="10" width="404" height="98" rx="30" fill="url(#logoBase)" filter="url(#logoShadow)" />

      <rect
        x="12"
        y="14"
        width="396"
        height="90"
        rx="26"
        fill="url(#logoBridge)"
      />
      <circle cx="54" cy="59" r="30" fill="url(#logoLeftHalo)" />
      <circle cx="366" cy="59" r="30" fill="url(#logoRightHalo)" />
      <rect x="12" y="14" width="396" height="90" rx="26" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />

      <g transform="translate(54 59)">
        <circle r="20" fill="#F9FBFF" stroke="#1B2436" strokeWidth="2.6" />
        <rect x="-20" y="-20" width="40" height="20" fill="#E83F4D" clipPath="url(#pokeBallClip)" />
        <path d="M-20 0H20" stroke="#1B2436" strokeWidth="2.6" />
        <circle r="6.6" fill="#F9FBFF" stroke="#1B2436" strokeWidth="2.2" />
      </g>

      <g transform="translate(366 59)">
        <circle cx="-9.8" cy="-18.4" r="3.7" fill="#F6B2CF" stroke="#1B2436" strokeWidth="1.8" />
        <circle cx="9.8" cy="-18.4" r="3.7" fill="#F6B2CF" stroke="#1B2436" strokeWidth="1.8" />
        <circle r="20" fill="#F7F5FF" stroke="#1B2436" strokeWidth="2.6" />
        <rect x="-20" y="-20" width="40" height="20" fill="#8F4FFF" clipPath="url(#pokeBallClip)" />
        <path d="M-20 0H20" stroke="#1B2436" strokeWidth="2.6" />
        <circle r="6.6" fill="#F7F5FF" stroke="#1B2436" strokeWidth="2.2" />
        <rect x="-5.4" y="-15.6" width="10.8" height="5.2" rx="2.1" fill="#F6B2CF" stroke="#1B2436" strokeWidth="1.2" />
        <text
          x="0"
          y="-13"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Segoe UI Variable Display, SF Pro Display, Avenir Next, Inter, sans-serif"
          fontSize="6.9"
          fontWeight="900"
          fill="#FFFFFF"
          stroke="#1B2436"
          strokeWidth="0.95"
          paintOrder="stroke fill"
        >
          M
        </text>
      </g>

      <text
        x="50%"
        y="53%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Segoe UI Variable Display, SF Pro Display, Avenir Next, Inter, sans-serif"
        fontSize="45"
        fontWeight="900"
        letterSpacing="2"
        fill="url(#logoTextFill)"
        stroke="#0F1627"
        strokeWidth="1.1"
        paintOrder="stroke fill"
        filter="url(#logoTextGlow)"
      >
        TYPEDLE
      </text>
    </svg>
  )
}

function App() {
  const [todaySeed] = useState(() => getDailySeed())
  const [seed, setSeed] = useState(() => (resolveInitialChallengePokemon() ? createChallengeSeed() : todaySeed))
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    return window.localStorage.getItem(currentUserStorageKey)
  })
  const [currentUsername, setCurrentUsername] = useState('')
  const [dailyAssignments, setDailyAssignments] = useState<DailyAssignments>({})
  const [guessValue, setGuessValue] = useState('')
  const [message, setMessage] = useState('')
  const [wrongGuessCount, setWrongGuessCount] = useState(0)
  const [lastSubmittedPokemon, setLastSubmittedPokemon] = useState('')
  const [guessHistory, setGuessHistory] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(0)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [resultImageUrl, setResultImageUrl] = useState('')
  const [evolutionStage, setEvolutionStage] = useState<EvolutionStage>('loading')
  const [originRegion, setOriginRegion] = useState('loading')
  const [streakState, setStreakState] = useState<StreakState>({ current: 0, best: 0, lastSeed: null })
  const [userStats, setUserStats] = useState<UserStats>(() => createEmptyUserStats())
  const [userCompletions, setUserCompletions] = useState<UserCompletionsMap>({})
  const [globalStats, setGlobalStats] = useState<UserStats>(() => loadGlobalStatsForSeed(todaySeed))
  const [guestClientId] = useState(() => getOrCreateGuestClientId())
  const [copyStatus, setCopyStatus] = useState('')
  const [creditsOpen, setCreditsOpen] = useState(false)
  const [rewindOpen, setRewindOpen] = useState(false)
  const [rewindDate, setRewindDate] = useState(seed)
  const [rewindStatus, setRewindStatus] = useState('')
  const [dayStateHydrated, setDayStateHydrated] = useState(false)
  const [userCompletionsHydrated, setUserCompletionsHydrated] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authStatus, setAuthStatus] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [practiceOverridePokemon, setPracticeOverridePokemon] = useState<PokemonEntry | null>(() =>
    resolveInitialChallengePokemon(),
  )
  const [practiceFilters, setPracticeFilters] = useState<PracticeFilters>(() => createDefaultPracticeFilters())
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [customizerStatus, setCustomizerStatus] = useState('')
  const [createADleOpen, setCreateADleOpen] = useState(false)
  const [createADleSearch, setCreateADleSearch] = useState('')
  const [createADleLink, setCreateADleLink] = useState('')
  const [createADleCopyStatus, setCreateADleCopyStatus] = useState('')

  // A create-a-dle link (?dle=<encoded name>) is already folded into the seed/
  // practiceOverridePokemon initial state above. Here we just strip the query
  // param from the address bar once, so refreshing or re-sharing the URL from
  // the bar doesn't carry the answer along.
  useEffect(() => {
    if (typeof window === 'undefined' || !readChallengeCodeFromLocation()) {
      return
    }

    const cleanUrl = new URL(window.location.href)
    cleanUrl.searchParams.delete(challengeQueryParam)
    window.history.replaceState(null, '', cleanUrl.toString())
  }, [])

  const target = useMemo(() => {
    if (isNonDailySeed(seed) && practiceOverridePokemon) {
      return practiceOverridePokemon
    }

    return resolvePokemonForSeed(seed, dailyAssignments)
  }, [dailyAssignments, practiceOverridePokemon, seed])
  const { weaknesses, resistances, immunities } = useMemo(
    () => getTypeSummary(target),
    [target],
  )
  const weaknesses4x = useMemo(() => weaknesses.filter((clue) => clue.multiplier >= 4), [weaknesses])
  const weaknesses2x = useMemo(() => weaknesses.filter((clue) => clue.multiplier < 4), [weaknesses])
  const resistancesQuarter = useMemo(() => resistances.filter((clue) => clue.multiplier <= 0.25), [resistances])
  const resistancesHalf = useMemo(() => resistances.filter((clue) => clue.multiplier > 0.25), [resistances])
  const customizerCandidateCount = useMemo(() => getFilteredPracticePool(practiceFilters).length, [practiceFilters])
  const filteredSuggestions = useMemo(() => {
    const normalizedGuess = normalizePokemonName(guessValue)

    if (!normalizedGuess) {
      return pokemonPool.slice(0, 8)
    }

    return pokemonPool
      .filter((pokemon) => normalizePokemonName(pokemon.name).includes(normalizedGuess))
      .slice(0, 8)
  }, [guessValue])
  const createADleSuggestions = useMemo(() => {
    const normalizedSearch = normalizePokemonName(createADleSearch)

    if (!normalizedSearch) {
      return []
    }

    return pokemonPool
      .filter((pokemon) => normalizePokemonName(pokemon.name).includes(normalizedSearch))
      .slice(0, 8)
  }, [createADleSearch])
  const isAccountSyncing = Boolean(currentUserKey) && !userCompletionsHydrated
  const hasCompletionForSeed = Boolean(currentUserKey && userCompletions[seed])
  const showPicker = pickerOpen && filteredSuggestions.length > 0 && !solved && !failed && !isAccountSyncing && !hasCompletionForSeed

  const regionVisible = wrongGuessCount >= 1
  const evolutionVisible = wrongGuessCount >= 2
  const resistanceVisible = wrongGuessCount >= 3
  const abilityVisible = wrongGuessCount >= 4
  const guessesLeft = Math.max(0, 6 - wrongGuessCount)
  const isTodayChallenge = seed === todaySeed
  const isAuthenticated = Boolean(currentUserKey)
  const averageWinAttempts = globalStats.wins > 0 ? globalStats.totalWinningGuesses / globalStats.wins : 0
  const winRate = globalStats.played > 0 ? Math.round((globalStats.wins / globalStats.played) * 100) : 0
  const guessDistributionOrder: Array<keyof GuessDistribution> = [1, 2, 3, 4, 5, 6]
  const maxDistributionCount = Math.max(1, ...guessDistributionOrder.map((guess) => globalStats.guessDistribution[guess]))
  const rewindOptions = useMemo(
    () => {
      const allSeeds = new Set<string>([
        ...Object.keys(dailyAssignments),
        ...Object.keys(userCompletions),
      ])

      return Array.from(allSeeds)
        .filter((entrySeed) => entrySeed < todaySeed)
        .map((entrySeed) => {
          const completion = userCompletions[entrySeed]
          const fallbackPokemon = dailyAssignments[entrySeed] ?? resolvePokemonForSeed(entrySeed, dailyAssignments).name
          const completionPokemon = completion?.targetPokemon?.trim() || fallbackPokemon
          const completionKnown = Boolean(completion)

          return {
            seed: entrySeed,
            pokemonName: completionPokemon,
            solved: currentUserKey
              ? (completion?.solved ?? loadDayState(entrySeed, currentUserKey)?.solved ?? false)
              : false,
            revealedByCompletion: completionKnown,
          }
        })
        .sort((left, right) => right.seed.localeCompare(left.seed))
        .slice(0, 28)
    },
    [currentUserKey, dailyAssignments, todaySeed, userCompletions],
  )

  useEffect(() => {
    if (!currentUserKey) {
      setCurrentUsername('')
      return
    }

    const userKey = currentUserKey

    let cancelled = false

    async function hydrateCurrentUserProfile() {
      try {
        const userProfile = await fetchUserProfileFromApi(userKey)

        if (cancelled) {
          return
        }

        setCurrentUsername(userProfile.username)
      } catch {
        if (cancelled) {
          return
        }

        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(currentUserStorageKey)
        }

        setCurrentUserKey(null)
        setCurrentUsername('')
      }
    }

    void hydrateCurrentUserProfile()

    return () => {
      cancelled = true
    }
  }, [currentUserKey])

  useEffect(() => {
    if (!currentUserKey) {
      setDailyAssignments({})
      setStreakState({ current: 0, best: 0, lastSeed: null })
      setUserStats(createEmptyUserStats())
      setUserCompletions({})
      setUserCompletionsHydrated(true)
      return
    }

    setDailyAssignments(loadDailyAssignments(currentUserKey))
    // Logged-in streak and stats are sourced from API progress.
    setStreakState({ current: 0, best: 0, lastSeed: null })
    setUserStats(createEmptyUserStats())
    setUserCompletions({})
    setUserCompletionsHydrated(false)
    setSeed(todaySeed)
  }, [currentUserKey, todaySeed])

  useEffect(() => {
    if (!currentUserKey) {
      setUserCompletionsHydrated(true)
      return
    }

    const userKey = currentUserKey
    let cancelled = false

    async function hydrateUserProgress() {
      try {
        const progress = await fetchUserProgressFromApi(userKey)

        if (cancelled) {
          return
        }

        setStreakState(progress.streakState)
        setUserStats(progress.stats)
      } catch {
        if (!cancelled) {
          setStreakState({ current: 0, best: 0, lastSeed: null })
          setUserStats(createEmptyUserStats())
        }
      }
    }

    void hydrateUserProgress()

    return () => {
      cancelled = true
    }
  }, [currentUserKey])

  useEffect(() => {
    if (!currentUserKey) {
      return
    }

    const userKey = currentUserKey

    let cancelled = false

    async function hydrateCompletions() {
      try {
        const completions = await fetchUserCompletionsFromApi(userKey)

        if (!cancelled) {
          setUserCompletions(completions)
          setUserCompletionsHydrated(true)
        }
      } catch {
        if (!cancelled) {
          setUserCompletions({})
          setUserCompletionsHydrated(true)
        }
      }
    }

    void hydrateCompletions()

    return () => {
      cancelled = true
    }
  }, [currentUserKey])

  useEffect(() => {
    if (!currentUserKey || isNonDailySeed(seed)) {
      return
    }

    const resolvedPokemon = resolvePokemonForSeed(seed, dailyAssignments)

    if (dailyAssignments[seed] === resolvedPokemon.name) {
      return
    }

    const nextAssignments = {
      ...dailyAssignments,
      [seed]: resolvedPokemon.name,
    }

    setDailyAssignments(nextAssignments)
    saveDailyAssignments(nextAssignments, currentUserKey)
  }, [currentUserKey, dailyAssignments, seed])

  useEffect(() => {
    if (!currentUserKey) {
      setGuessValue('')
      setMessage('')
      setWrongGuessCount(0)
      setLastSubmittedPokemon('')
      setGuessHistory([])
      setSolved(false)
      setFailed(false)
      setPickerOpen(false)
      setHighlightedSuggestionIndex(0)
      setResultImageUrl('')
      setCopyStatus('')
      setRewindStatus('')
      setDayStateHydrated(false)
      return
    }

    if (!userCompletionsHydrated) {
      setDayStateHydrated(false)
      return
    }

    setDayStateHydrated(false)

    const savedDayState = loadDayState(seed, currentUserKey)
    const completion = userCompletions[seed]

    if (completion) {
      const resolvedTargetPokemon = completion.targetPokemon || target.name
      const resolvedWrongGuessCount = Math.max(
        0,
        Math.min(6, completion.solved ? completion.attemptsUsed - 1 : completion.attemptsUsed),
      )

      setGuessValue('')
      setMessage(
        completion.solved
          ? `Solved. ${resolvedTargetPokemon} is correct.`
          : `Fail. The answer was ${resolvedTargetPokemon}.`,
      )
      setWrongGuessCount(resolvedWrongGuessCount)
      setLastSubmittedPokemon(completion.guessedPokemon || '')
      setGuessHistory(completion.guessHistory)
      setSolved(completion.solved)
      setFailed(completion.failed || !completion.solved)
    } else if (savedDayState) {
      setGuessValue(savedDayState.guessValue)
      setMessage(savedDayState.message)
      setWrongGuessCount(savedDayState.wrongGuessCount)
      setLastSubmittedPokemon(savedDayState.lastSubmittedPokemon)
      setGuessHistory(savedDayState.guessHistory)
      setSolved(savedDayState.solved)
      setFailed(savedDayState.failed)
    } else {
      setGuessValue('')
      setMessage('')
      setWrongGuessCount(0)
      setLastSubmittedPokemon('')
      setGuessHistory([])
      setSolved(false)
      setFailed(false)
    }

    setPickerOpen(false)
    setHighlightedSuggestionIndex(0)
    setCopyStatus('')
    setRewindStatus('')
    setDayStateHydrated(true)
  }, [currentUserKey, seed, target.name, userCompletions, userCompletionsHydrated])

  useEffect(() => {
    if (!currentUserKey || !dayStateHydrated || isNonDailySeed(seed)) {
      return
    }

    saveDayState(seed, currentUserKey, {
      guessValue,
      message,
      wrongGuessCount,
      lastSubmittedPokemon,
      guessHistory,
      solved,
      failed,
    })
  }, [currentUserKey, dayStateHydrated, failed, guessHistory, guessValue, lastSubmittedPokemon, message, seed, solved, wrongGuessCount])

  useEffect(() => {
    let cancelled = false

    async function loadPokemonClueMetadata() {
      try {
        const speciesSlug = getBaseSpeciesSlug(target.name)
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesSlug}`)

        if (!speciesResponse.ok) {
          throw new Error('Unable to load species data')
        }

        const speciesData = await speciesResponse.json()
        const resolvedRegion = resolveOriginRegion(target.name, speciesData?.generation?.name)

        if (!cancelled) {
          setOriginRegion(resolvedRegion)
        }

        if (isMegaFormName(target.name)) {
          if (!cancelled) {
            setEvolutionStage('mega')
          }

          return
        }

        const evolutionChainUrl = speciesData?.evolution_chain?.url

        if (!evolutionChainUrl) {
          throw new Error('Missing evolution chain URL')
        }

        const evolutionResponse = await fetch(evolutionChainUrl)

        if (!evolutionResponse.ok) {
          throw new Error('Unable to load evolution chain')
        }

        const evolutionData = await evolutionResponse.json()
        const resolvedStage = resolveEvolutionStage(evolutionData?.chain, speciesData.name)

        if (!cancelled) {
          setEvolutionStage(resolvedStage)
        }
      } catch {
        if (!cancelled) {
          setEvolutionStage(isMegaFormName(target.name) ? 'mega' : 'no-evolution-line')
          setOriginRegion(resolveOriginRegion(target.name))
        }
      }
    }

    setEvolutionStage('loading')
    setOriginRegion('loading')
    void loadPokemonClueMetadata()

    return () => {
      cancelled = true
    }
  }, [target.name])

  useEffect(() => {
    if (!currentUserKey || !isTodayChallenge || (!solved && !failed)) {
      return
    }

    const userKey = currentUserKey

    // If today's outcome was already recorded, do not mutate streak again on refresh.
    if (streakState.lastSeed === seed) {
      return
    }

    const nextStreakState = solved
      ? (() => {
          const previousSeed = getPreviousSeed(seed)
          const nextCurrent = streakState.lastSeed === previousSeed ? streakState.current + 1 : 1
          return {
            current: nextCurrent,
            best: Math.max(streakState.best, nextCurrent),
            lastSeed: seed,
          }
        })()
      : {
          current: 0,
          best: streakState.best,
          lastSeed: seed,
        }

    if (
      streakState.current !== nextStreakState.current ||
      streakState.best !== nextStreakState.best ||
      streakState.lastSeed !== nextStreakState.lastSeed
    ) {
      setStreakState(nextStreakState)
      void saveUserProgressToApi(userKey, { streakState: nextStreakState }).catch(() => undefined)
    }
  }, [currentUserKey, failed, isTodayChallenge, seed, solved, streakState.best, streakState.current, streakState.lastSeed])

  useEffect(() => {
    if (!currentUserKey || (!solved && !failed) || isNonDailySeed(seed)) {
      return
    }

    const userKey = currentUserKey

    if (userStats.recordedSeeds.includes(seed)) {
      return
    }

    const attemptsUsed = solved ? wrongGuessCount + 1 : wrongGuessCount

    const nextStats: UserStats = {
      ...userStats,
      played: userStats.played + 1,
      wins: userStats.wins + (solved ? 1 : 0),
      losses: userStats.losses + (failed ? 1 : 0),
      totalWinningGuesses: userStats.totalWinningGuesses + (solved ? attemptsUsed : 0),
      recordedSeeds: [...userStats.recordedSeeds, seed],
      guessDistribution: {
        ...userStats.guessDistribution,
        [attemptsUsed]:
          solved && attemptsUsed >= 1 && attemptsUsed <= 6
            ? userStats.guessDistribution[attemptsUsed as keyof GuessDistribution] + 1
            : userStats.guessDistribution[attemptsUsed as keyof GuessDistribution],
      },
    }

    setUserStats(nextStats)
    void saveUserProgressToApi(userKey, { stats: nextStats }).catch(() => undefined)
  }, [currentUserKey, failed, seed, solved, userStats, wrongGuessCount])

  useEffect(() => {
    if (!currentUserKey || (!solved && !failed) || isNonDailySeed(seed)) {
      return
    }

    const userKey = currentUserKey

    if (userCompletions[seed]) {
      return
    }

    const attemptsUsed = Math.max(1, Math.min(6, solved ? wrongGuessCount + 1 : wrongGuessCount))
    const completionPayload: UserCompletion = {
      seed,
      solved,
      failed,
      attemptsUsed,
      guessedPokemon: lastSubmittedPokemon,
      targetPokemon: target.name,
      guessHistory,
      completedAt: new Date().toISOString(),
    }

    let cancelled = false

    async function persistCompletion() {
      try {
        const result = await submitUserCompletionToApi(userKey, completionPayload)

        if (cancelled) {
          return
        }

        setUserCompletions((currentCompletions) => {
          if (currentCompletions[result.completion.seed]) {
            return currentCompletions
          }

          return {
            ...currentCompletions,
            [result.completion.seed]: result.completion,
          }
        })
      } catch {
        if (cancelled) {
          return
        }

        setUserCompletions((currentCompletions) => ({
          ...currentCompletions,
          [completionPayload.seed]: completionPayload,
        }))
      }
    }

    void persistCompletion()

    return () => {
      cancelled = true
    }
  }, [currentUserKey, failed, guessHistory, lastSubmittedPokemon, seed, solved, target.name, userCompletions, wrongGuessCount])

  useEffect(() => {
    if (isNonDailySeed(seed)) {
      setGlobalStats(createEmptyUserStats())
      return
    }

    let cancelled = false

    setGlobalStats(loadGlobalStatsForSeed(seed))

    async function hydrateGlobalStats() {
      try {
        const remoteStats = await fetchGlobalStatsFromApi(seed)

        if (cancelled) {
          return
        }

        setGlobalStats(remoteStats)
        saveGlobalStatsForSeed(seed, remoteStats)
      } catch {
        if (!cancelled) {
          setGlobalStats(loadGlobalStatsForSeed(seed))
        }
      }
    }

    void hydrateGlobalStats()

    return () => {
      cancelled = true
    }
  }, [seed])

  useEffect(() => {
    if ((!solved && !failed) || isNonDailySeed(seed)) {
      return
    }

    const attemptsUsed = solved ? wrongGuessCount + 1 : wrongGuessCount
    const safeAttemptsUsed = Math.max(1, Math.min(6, attemptsUsed))
    const outcomeScope = currentUserKey ? `user:${currentUserKey}` : `guest:${guestClientId}`
    const outcomeKey = `${outcomeScope}:${seed}`
    const outcomePayload: GlobalStatsOutcome = {
      seed,
      outcomeId: outcomeKey,
      solved,
      attemptsUsed: safeAttemptsUsed,
    }

    if (globalStats.recordedSeeds.includes(outcomeKey)) {
      return
    }

    let cancelled = false

    async function persistGlobalOutcome() {
      try {
        const remoteStats = await submitGlobalOutcomeToApi(outcomePayload)

        if (cancelled) {
          return
        }

        setGlobalStats(remoteStats)
        saveGlobalStatsForSeed(seed, remoteStats)
      } catch {
        if (cancelled) {
          return
        }

        setGlobalStats((currentStats) => {
          const nextStats = applyOutcomeToStats(currentStats, outcomePayload)
          saveGlobalStatsForSeed(seed, nextStats)
          return nextStats
        })
      }
    }

    void persistGlobalOutcome()

    return () => {
      cancelled = true
    }
  }, [currentUserKey, failed, globalStats.recordedSeeds, guestClientId, seed, solved, wrongGuessCount])

  useEffect(() => {
    if (!solved && !failed) {
      setResultModalOpen(false)
      setResultImageUrl('')
      setCopyStatus('')
      return
    }

    let cancelled = false
    const slug = toPokemonSlug(target.name)
    setResultModalOpen(true)
    setResultImageUrl('')

    async function loadRender() {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`)

        if (!response.ok) {
          throw new Error('Unable to load Pokémon render')
        }

        const pokemonData = await response.json()
        const imageUrl =
          pokemonData?.sprites?.other?.home?.front_default ??
          pokemonData?.sprites?.other?.['official-artwork']?.front_default ??
          pokemonData?.sprites?.front_default ??
          ''

        if (!cancelled) {
          setResultImageUrl(imageUrl)
        }
      } catch {
        if (!cancelled) {
          setResultImageUrl(`https://img.pokemondb.net/artwork/large/${slug}.jpg`)
        }
      }
    }

    void loadRender()

    return () => {
      cancelled = true
    }
  }, [failed, solved, target.name])

  const guessCount = solved ? wrongGuessCount + 1 : wrongGuessCount
  const scoreValue = Math.max(0, 6 - wrongGuessCount)
  const isPracticeRound = isNonDailySeed(seed)
  const isChallengeRound = isChallengeSeed(seed)
  const shareGrid = guessHistory
    .map((_, index) => (solved && index === guessHistory.length - 1 ? '🟩' : '🟥'))
    .join('\n')
  const shareHeader = isChallengeRound
    ? `TypeDle Challenge ${solved ? guessCount : 'X'}/6`
    : isPracticeRound
      ? `TypeDle Practice ${solved ? guessCount : 'X'}/6`
      : `TypeDle ${seed} ${solved ? guessCount : 'X'}/6`
  const shareText = [
    shareHeader,
    '',
    shareGrid,
    '',
    isPracticeRound ? 'https://www.typedle.net' : `Streak: ${streakState.current} (best ${streakState.best})\nhttps://www.typedle.net`,
  ].join('\n')

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopyStatus('Copied results.')
    } catch {
      setCopyStatus('Copy failed.')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isAccountSyncing) {
      setMessage('Syncing your account history...')
      return
    }

    if (currentUserKey && userCompletions[seed]) {
      const completion = userCompletions[seed]
      const resolvedTargetPokemon = completion.targetPokemon || target.name
      setMessage(completion.solved ? `Solved. ${resolvedTargetPokemon} is correct.` : `Fail. The answer was ${resolvedTargetPokemon}.`)
      setSolved(completion.solved)
      setFailed(completion.failed || !completion.solved)
      setWrongGuessCount(Math.max(0, Math.min(6, completion.solved ? completion.attemptsUsed - 1 : completion.attemptsUsed)))
      setLastSubmittedPokemon(completion.guessedPokemon || '')
      setGuessHistory(completion.guessHistory)
      return
    }

    if (solved || failed) {
      return
    }

    const normalizedGuess = normalizePokemonName(guessValue)

    if (!normalizedGuess) {
      setMessage('Enter a Pokémon name.')
      return
    }

    const pokemon = pokemonLookup.get(normalizedGuess)

    if (!pokemon) {
      setMessage('That Pokémon is not in the roster yet.')
      return
    }

    setLastSubmittedPokemon(pokemon.name)
    setGuessHistory((currentHistory) => [...currentHistory, pokemon.name])

    if (pokemon.name === target.name) {
      setSolved(true)
      setMessage(`Solved. ${pokemon.name} is correct.`)
      setGuessValue('')
      return
    }

    const nextWrongGuessCount = wrongGuessCount + 1
    setWrongGuessCount(nextWrongGuessCount)
    setGuessValue('')

    if (nextWrongGuessCount >= 6) {
      setFailed(true)
      setMessage(`Fail. The answer was ${target.name}.`)
      return
    }

    if (nextWrongGuessCount === 5) {
      setMessage('Wrong guess. No more clues left.')
      return
    }

    if (nextWrongGuessCount === 4) {
      setMessage('Wrong guess. The ability is now revealed.')
      return
    }

    if (nextWrongGuessCount === 3) {
      setMessage('Wrong guess. The resistance and immunity rows are now revealed.')
      return
    }

    if (nextWrongGuessCount === 2) {
      setMessage('Wrong guess. The evolution stage row is now revealed.')
      return
    }

    setMessage('Wrong guess. The region row is now revealed.')
  }

  const applySuggestion = (name: string) => {
    setGuessValue(name)
    setPickerOpen(false)
    setHighlightedSuggestionIndex(0)
  }

  const openRewindModal = () => {
    setRewindDate(seed)
    setRewindStatus('')
    setRewindOpen(true)
  }

  const loadRewindDay = () => {
    if (!rewindDate) {
      setRewindStatus('Select a day to load.')
      return
    }

    if (rewindDate > todaySeed) {
      setRewindStatus('Choose today or a previous day.')
      return
    }

    setSeed(rewindDate)
    setRewindOpen(false)
  }

  const jumpToDay = (selectedSeed: string) => {
    setSeed(selectedSeed)
    setRewindOpen(false)
  }

  const startPracticeRound = (filtersOverride?: PracticeFilters) => {
    const activeFilters = filtersOverride ?? practiceFilters
    const candidates = getFilteredPracticePool(activeFilters)

    if (candidates.length === 0) {
      setCustomizerStatus('No Pokémon match these filters. Try widening your selection.')
      setCustomizerOpen(true)
      return
    }

    setPracticeOverridePokemon(pickRandomPokemon(candidates))
    setSeed(createPracticeSeed())
    setRewindOpen(false)
    setResultModalOpen(false)
    setCustomizerOpen(false)
    setCustomizerStatus('')
  }

  const exitPracticeRound = () => {
    setSeed(todaySeed)
    setPracticeOverridePokemon(null)
  }

  const openCustomizer = () => {
    setCustomizerStatus('')
    setCustomizerOpen(true)
  }

  const toggleCustomizerRegion = (region: string) => {
    setCustomizerStatus('')
    setPracticeFilters((current) => {
      const nextRegions = new Set(current.regions)

      if (nextRegions.has(region)) {
        nextRegions.delete(region)
      } else {
        nextRegions.add(region)
      }

      return { ...current, regions: nextRegions }
    })
  }

  const setCustomizerMegaFilter = (megaFilter: MegaFilter) => {
    setCustomizerStatus('')
    setPracticeFilters((current) => ({ ...current, megaFilter }))
  }

  const resetCustomizerFilters = () => {
    setPracticeFilters(createDefaultPracticeFilters())
    setCustomizerStatus('')
  }

  const openCreateADle = () => {
    setCreateADleSearch('')
    setCreateADleLink('')
    setCreateADleCopyStatus('')
    setCreateADleOpen(true)
  }

  const selectCreateADlePokemon = (name: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
    const link = `${origin}?${challengeQueryParam}=${encodeChallengePokemonName(name)}`
    setCreateADleSearch(name)
    setCreateADleLink(link)
    setCreateADleCopyStatus('')
  }

  const copyCreateADleLink = async () => {
    try {
      await navigator.clipboard.writeText(createADleLink)
      setCreateADleCopyStatus('Link copied.')
    } catch {
      setCreateADleCopyStatus('Copy failed.')
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showPicker) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedSuggestionIndex((currentIndex) =>
        Math.min(currentIndex + 1, filteredSuggestions.length - 1),
      )
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedSuggestionIndex((currentIndex) => Math.max(currentIndex - 1, 0))
    }

    if (event.key === 'Enter') {
      const suggestion = filteredSuggestions[highlightedSuggestionIndex]

      if (suggestion) {
        event.preventDefault()
        applySuggestion(suggestion.name)
      }
    }

    if (event.key === 'Escape') {
      setPickerOpen(false)
    }
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const username = authUsername.trim()
    const password = authPassword

    if (!username || !password) {
      setAuthStatus('Enter a username and password.')
      return
    }

    const userKey = normalizeUsername(username)

    try {
      const passwordHash = await hashPassword(password)

      if (authMode === 'register') {
        const createdUser = await registerUserWithApi(userKey, username, passwordHash)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(currentUserStorageKey, createdUser.userKey)
        }

        setCurrentUserKey(createdUser.userKey)
        setCurrentUsername(createdUser.username)
        setAuthUsername('')
        setAuthPassword('')
        setAuthStatus('')
        setAuthOpen(false)
        return
      }

      const loggedInUser = await loginUserWithApi(userKey, passwordHash)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(currentUserStorageKey, loggedInUser.userKey)
      }

      setCurrentUserKey(loggedInUser.userKey)
      setCurrentUsername(loggedInUser.username)
      setAuthUsername('')
      setAuthPassword('')
      setAuthStatus('')
      setAuthOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to sign in right now.'
      setAuthStatus(errorMessage)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(currentUserStorageKey)
    }

    setCurrentUserKey(null)
    setAuthPassword('')
    setAuthStatus('')
    setCreditsOpen(false)
    setRewindOpen(false)
    setResultModalOpen(false)
  }

  const openAuthModal = () => {
    setAuthMode('login')
    setAuthStatus('')
    setAuthOpen(true)
  }

  return (
    <main className="wordle-shell">
      <button type="button" className="credits-button" onClick={() => setCreditsOpen(true)}>
        Credits
      </button>
      {isAuthenticated ? (
        <button type="button" className="logout-button" onClick={handleLogout}>
          {`Logout ${currentUsername}`}
        </button>
      ) : (
        <button type="button" className="login-button" onClick={openAuthModal}>
          Login
        </button>
      )}

      <div className="game-shell">
        <div className="game-topbar">
          <header className="wordle-header">
            <div className="mobile-header-actions" aria-label="Quick actions">
              {isAuthenticated ? (
                <button type="button" className="mobile-top-button" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <button type="button" className="mobile-top-button" onClick={openAuthModal}>
                  Login
                </button>
              )}
              <div className="title-badge">{isChallengeRound ? 'Friend challenge' : isPracticeRound ? 'Practice mode' : 'Daily challenge'}</div>
              <button type="button" className="mobile-top-button" onClick={() => setCreditsOpen(true)}>
                Credits
              </button>
            </div>
            <div className="desktop-title-badge title-badge">{isChallengeRound ? 'Friend challenge' : isPracticeRound ? 'Practice mode' : 'Daily challenge'}</div>
            <h1 className="sr-only">TypeDle</h1>
            <TypeDleLogo />
            <p className="subtitle">Guess the Pokémon one clue row at a time.</p>
          </header>

          <section className="game-hud" aria-label="Puzzle status">
            <div className="hud-chip">
              <span className="hud-chip-label">{isPracticeRound ? 'Mode' : 'Day'}</span>
              <span className="hud-chip-value">{isChallengeRound ? 'Challenge' : isPracticeRound ? 'Practice' : seed}</span>
            </div>
            <div className="hud-chip">
              <span className="hud-chip-label">Streak</span>
              <span className="hud-chip-value">{streakState.current}</span>
            </div>
            <div className="hud-chip">
              <span className="hud-chip-label">Best</span>
              <span className="hud-chip-value">{streakState.best}</span>
            </div>
            <div className="hud-chip hud-chip-wide">
              <span className="hud-chip-label">Guesses left</span>
              <span className="hud-chip-value">{guessesLeft}</span>
            </div>
          </section>
        </div>

        <section className="board-frame">
          <div className="board" aria-label="Type clue board">
            <div className="row row-weakness">
              <span className="row-label">Weak to</span>
              {renderClueMagnitudeRows([
                { key: 'weakness-4x', clues: weaknesses4x, className: 'tile-weakness tile-revealed', labelMode: 'multiplier' },
                { key: 'weakness-2x', clues: weaknesses2x, className: 'tile-weakness tile-revealed', labelMode: 'multiplier' },
              ])}
            </div>

            <div className="row row-region">
              <span className="row-label">Region</span>
              <div className="tile-group">
                {regionVisible ? (originRegion === 'loading' ? renderPlaceholderTile() : renderRegionTile(originRegion)) : renderPlaceholderTile()}
              </div>
            </div>

            <div className="row row-stage">
              <span className="row-label">Evolution stage</span>
              <div className="tile-group">{evolutionVisible ? renderEvolutionTile(evolutionStage) : renderPlaceholderTile()}</div>
            </div>

            <div className="row row-resistance">
              <span className="row-label">Resists</span>
              {resistanceVisible
                ? renderClueMagnitudeRows([
                    { key: 'resistance-half', clues: resistancesHalf, className: 'tile-resistance tile-revealed', labelMode: 'multiplier' },
                    { key: 'resistance-quarter', clues: resistancesQuarter, className: 'tile-resistance tile-revealed', labelMode: 'multiplier' },
                    { key: 'immunity', clues: immunities, className: 'tile-immunity tile-revealed', labelMode: 'immune' },
                  ])
                : <div className="tile-group">{renderPlaceholderTile()}</div>}
            </div>

            <div className="row row-ability">
              <span className="row-label">Ability</span>
              <div className="tile-group">
                {abilityVisible ? renderAbilityTile(target.ability) : renderPlaceholderTile()}
              </div>
            </div>
          </div>
        </section>

        <form className="guess-bar" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="pokemon-guess">
            Guess a Pokémon
          </label>
          <div className="guess-field">
            <input
              id="pokemon-guess"
              autoComplete="off"
              spellCheck={false}
              disabled={solved || failed || isAccountSyncing || hasCompletionForSeed}
              value={guessValue}
              onFocus={() => setPickerOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setPickerOpen(false), 120)
              }}
              onChange={(event) => {
                setGuessValue(event.target.value)
                setPickerOpen(true)
                setHighlightedSuggestionIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter a Pokémon"
            />

            {showPicker && (
              <div className="guess-picker" role="listbox" aria-label="Pokémon suggestions">
                {filteredSuggestions.map((pokemon, index) => (
                  <button
                    key={pokemon.name}
                    type="button"
                    className={index === highlightedSuggestionIndex ? 'guess-option is-active' : 'guess-option'}
                    role="option"
                    aria-selected={index === highlightedSuggestionIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applySuggestion(pokemon.name)}
                    onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                  >
                    <span className="guess-option-name">{pokemon.name}</span>
                    <span className="guess-option-meta">{pokemon.types.join(' / ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="rewind-button"
            onClick={openRewindModal}
            aria-label="Open rewind day picker"
          >
            <svg className="rewind-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3.5" y="5.5" width="17" height="15" rx="2.8" />
              <path d="M7.5 3.8v3.4M16.5 3.8v3.4M3.8 9.2h16.4" />
            </svg>
          </button>
          <button type="submit" className="guess-submit" disabled={solved || failed || isAccountSyncing || hasCompletionForSeed}>
            Guess
          </button>
        </form>

        <p className="status" aria-live="polite">
          {message || (isAccountSyncing ? 'Syncing your account history...' : hasCompletionForSeed ? 'This day is already completed on your account.' : solved ? 'Solved.' : failed ? 'Failed.' : 'Guess to reveal the next row.')}
        </p>

        <footer className="site-footer">
          {isPracticeRound ? (
            <button type="button" className="footer-action" onClick={exitPracticeRound}>
              Back to today&apos;s puzzle
            </button>
          ) : (
            <>
              <button type="button" className="footer-action" onClick={() => startPracticeRound()}>
                Practice mode
              </button>
              <span aria-hidden="true">·</span>
              <button type="button" className="footer-action" onClick={openCustomizer}>
                Customize
              </button>
            </>
          )}
          <span aria-hidden="true">·</span>
          <button type="button" className="footer-action" onClick={openCreateADle}>
            Create-a-dle
          </button>
          <span aria-hidden="true">·</span>
          <a href="/how-to-play.html">How to Play</a>
          <span aria-hidden="true">·</span>
          <a href="/about.html">About</a>
          <span aria-hidden="true">·</span>
          <a href="/privacy.html">Privacy Policy</a>
        </footer>
      </div>

      {rewindOpen && (
        <div className="result-modal rewind-modal" role="dialog" aria-modal="true" aria-labelledby="rewind-title">
          <div className="result-backdrop" onClick={() => setRewindOpen(false)} />
          <div className="result-card rewind-card">
            <p className="result-eyebrow">Rewind</p>
            <h2 id="rewind-title">Load a previous day</h2>
            <p className="result-copy">Pick a past date to replay that day&apos;s challenge.</p>

            <label className="rewind-date-label" htmlFor="rewind-date">
              Day
            </label>
            <input
              id="rewind-date"
              className="rewind-date-input"
              type="date"
              value={rewindDate}
              max={todaySeed}
              onChange={(event) => setRewindDate(event.target.value)}
            />

            {rewindOptions.length > 0 && (
              <div className="rewind-history" aria-label="Previously assigned days">
                {rewindOptions.map((entry) => (
                  <button
                    key={entry.seed}
                    type="button"
                    className="rewind-history-button"
                    onClick={() => jumpToDay(entry.seed)}
                  >
                    <span>{entry.seed}</span>
                    <span>{entry.revealedByCompletion || entry.solved ? entry.pokemonName : 'Hidden'}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="result-actions">
              <button type="button" className="result-share-button" onClick={loadRewindDay}>
                Load day
              </button>
              <button type="button" className="result-close" onClick={() => setRewindOpen(false)}>
                Close
              </button>
            </div>

            <p className="result-copy-status" aria-live="polite">
              {rewindStatus}
            </p>
          </div>
        </div>
      )}

      {customizerOpen && (
        <div className="result-modal customizer-modal" role="dialog" aria-modal="true" aria-labelledby="customizer-title">
          <div className="result-backdrop" onClick={() => setCustomizerOpen(false)} />
          <div className="result-card customizer-card">
            <p className="result-eyebrow">Practice customizer</p>
            <h2 id="customizer-title">Choose your pool</h2>
            <p className="result-copy">Filter which Pokémon can show up in practice rounds.</p>

            <p className="rewind-date-label">Region</p>
            <div className="customizer-chip-grid" role="group" aria-label="Region filter">
              {practiceRegionOrder.map((region) => (
                <button
                  key={region}
                  type="button"
                  className={practiceFilters.regions.has(region) ? 'customizer-chip is-active' : 'customizer-chip'}
                  aria-pressed={practiceFilters.regions.has(region)}
                  onClick={() => toggleCustomizerRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>

            <p className="rewind-date-label">Mega / Primal forms</p>
            <div className="customizer-chip-grid" role="group" aria-label="Mega and Primal form filter">
              {(
                [
                  { value: 'all', label: 'Include all' },
                  { value: 'exclude', label: 'No Mega/Primal' },
                  { value: 'only', label: 'Only Mega/Primal' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={practiceFilters.megaFilter === option.value ? 'customizer-chip is-active' : 'customizer-chip'}
                  aria-pressed={practiceFilters.megaFilter === option.value}
                  onClick={() => setCustomizerMegaFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="customizer-count">
              {customizerCandidateCount} Pokémon match these filters.
            </p>

            <div className="result-actions">
              <button type="button" className="result-share-button" onClick={() => startPracticeRound()}>
                Start practice round
              </button>
              <button type="button" className="result-close" onClick={resetCustomizerFilters}>
                Reset filters
              </button>
              <button type="button" className="result-close" onClick={() => setCustomizerOpen(false)}>
                Close
              </button>
            </div>

            <p className="result-copy-status" aria-live="polite">
              {customizerStatus}
            </p>
          </div>
        </div>
      )}

      {createADleOpen && (
        <div className="result-modal create-a-dle-modal" role="dialog" aria-modal="true" aria-labelledby="create-a-dle-title">
          <div className="result-backdrop" onClick={() => setCreateADleOpen(false)} />
          <div className="result-card create-a-dle-card">
            <p className="result-eyebrow">Create-a-dle</p>
            <h2 id="create-a-dle-title">Challenge a friend</h2>
            <p className="result-copy">
              Pick any Pokémon and we&apos;ll generate a link that makes it the puzzle for whoever opens it.
            </p>

            <label className="rewind-date-label" htmlFor="create-a-dle-search">
              Pokémon
            </label>
            <div className="guess-field">
              <input
                id="create-a-dle-search"
                className="rewind-date-input"
                autoComplete="off"
                spellCheck={false}
                value={createADleSearch}
                onChange={(event) => {
                  setCreateADleSearch(event.target.value)
                  setCreateADleLink('')
                  setCreateADleCopyStatus('')
                }}
                placeholder="Search for a Pokémon"
              />

              {createADleSuggestions.length > 0 && !createADleLink && (
                <div className="guess-picker" role="listbox" aria-label="Pokémon suggestions">
                  {createADleSuggestions.map((pokemon) => (
                    <button
                      key={pokemon.name}
                      type="button"
                      className="guess-option"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectCreateADlePokemon(pokemon.name)}
                    >
                      <span className="guess-option-name">{pokemon.name}</span>
                      <span className="guess-option-meta">{pokemon.types.join(' / ')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {createADleLink && (
              <p className="result-copy">
                Link ready for <strong>{createADleSearch}</strong>. Share it and your friend&apos;s puzzle will be exactly
                this Pokémon.
              </p>
            )}

            <div className="result-actions">
              <button type="button" className="result-share-button" onClick={copyCreateADleLink} disabled={!createADleLink}>
                Copy link
              </button>
              <button type="button" className="result-close" onClick={() => setCreateADleOpen(false)}>
                Close
              </button>
            </div>

            <p className="result-copy-status" aria-live="polite">
              {createADleCopyStatus}
            </p>
          </div>
        </div>
      )}

      {authOpen && !isAuthenticated && (
        <div className="result-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <div className="result-backdrop" onClick={() => setAuthOpen(false)} />
          <div className="result-card auth-card">
            <p className="result-eyebrow">Account</p>
            <h2 id="auth-title">Sign in to TypeDle</h2>
            <p className="result-copy">Progress, streak, and completed days are saved per account.</p>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label className="rewind-date-label" htmlFor="auth-username">
                Username
              </label>
              <input
                id="auth-username"
                className="rewind-date-input"
                value={authUsername}
                onChange={(event) => setAuthUsername(event.target.value)}
                autoComplete="username"
                placeholder="Enter username"
              />

              <label className="rewind-date-label" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                className="rewind-date-input"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Enter password"
              />

              <div className="result-actions">
                <button type="submit" className="result-share-button">
                  {authMode === 'login' ? 'Login' : 'Create account'}
                </button>
                <button
                  type="button"
                  className="result-close"
                  onClick={() => {
                    setAuthMode((mode) => (mode === 'login' ? 'register' : 'login'))
                    setAuthStatus('')
                  }}
                >
                  {authMode === 'login' ? 'Need account' : 'Have account'}
                </button>
              </div>
            </form>

            <p className="result-copy-status" aria-live="polite">
              {authStatus}
            </p>
          </div>
        </div>
      )}

      {resultModalOpen && (
        <div className="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
          <div className="result-backdrop" onClick={() => setResultModalOpen(false)} />
          <div className="result-card">
            <p className="result-eyebrow">{solved ? 'Congratulations' : 'Better luck next time'}</p>
            <h2 id="result-title">{target.name}</h2>
            <p className="result-copy">
              {solved ? 'You solved the puzzle.' : 'The round is over, but the answer is right there.'}
            </p>
            <div className="result-share" aria-label="Result summary">
              <div className="result-stat result-stat-score">
                <span className="result-stat-label">Score</span>
                <span className="result-stat-value">{scoreValue}</span>
              </div>
              <div className="result-stat result-stat-guesses">
                <span className="result-stat-label">Your guesses</span>
                <ol className="result-guess-list" aria-label="Your guesses list">
                  {guessHistory.length > 0
                    ? guessHistory.map((guessName, guessIndex) => (
                        <li key={`${guessName}-${guessIndex}`} className="result-guess-item">
                          <span className="result-guess-index">#{guessIndex + 1}</span>
                          <strong className="result-guess-name">{guessName}</strong>
                        </li>
                      ))
                    : <li className="result-guess-item"><strong className="result-guess-name">N/A</strong></li>}
                </ol>
              </div>
            </div>
            {isPracticeRound ? (
              <div className="result-distribution" aria-label="Guess distribution">
                <p className="result-stat-label">Guess distribution</p>
                <p className="distribution-signin-note">Practice and challenge rounds aren&apos;t included in global stats.</p>
              </div>
            ) : (
              <div className="result-distribution" aria-label="Guess distribution">
                <p className="result-stat-label">Guess distribution</p>
                {guessDistributionOrder.map((guess) => {
                  const count = globalStats.guessDistribution[guess]
                  const fillPercent = Math.max(8, Math.round((count / maxDistributionCount) * 100))

                  return (
                    <div key={guess} className="distribution-row">
                      <span className="distribution-guess">{guess}</span>
                      <div className="distribution-bar-track">
                        <div className="distribution-bar-fill" style={{ width: `${fillPercent}%` }}>
                          {count}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <p className="distribution-average">
                  Average attempts to win: <strong>{globalStats.wins > 0 ? averageWinAttempts.toFixed(2) : 'N/A'}</strong>
                  {' '}| Win rate: <strong>{winRate}%</strong>
                </p>
              </div>
            )}
            <div className="result-visual">
              {resultImageUrl ? (
                <img className="result-image" src={resultImageUrl} alt={target.name} />
              ) : (
                <div className="result-image result-image-loading">Loading render...</div>
              )}
            </div>
            <div className="result-actions">
              <button type="button" className="result-share-button" onClick={copyResults}>
                Copy results
              </button>
              <button type="button" className="result-share-button" onClick={() => startPracticeRound()}>
                {isPracticeRound ? 'Another practice round' : 'Practice round'}
              </button>
              <button
                type="button"
                className="result-close"
                onClick={() => {
                  setResultModalOpen(false)
                  openCustomizer()
                }}
              >
                Customize
              </button>
              <button type="button" className="result-close" onClick={() => setResultModalOpen(false)}>
                Close
              </button>
            </div>
            <p className="result-copy-status" aria-live="polite">
              {copyStatus}
            </p>
          </div>
        </div>
      )}

      {creditsOpen && (
        <div className="result-modal credits-modal" role="dialog" aria-modal="true" aria-labelledby="credits-title">
          <div className="result-backdrop" onClick={() => setCreditsOpen(false)} />
          <div className="result-card credits-card">
            <p className="result-eyebrow">Credits</p>
            <h2 id="credits-title">Sources used</h2>
            <p className="result-copy credits-copy">
              These are the main sources behind the icons, roster data, and render fallbacks used in TypeDle.
            </p>
            <div className="credits-grid">
              <a className="credits-link-card" href="https://archives.bulbagarden.net" target="_blank" rel="noreferrer">
                <span className="credits-link-title">Bulbagarden</span>
                <span className="credits-link-note">Type icon archive</span>
              </a>
              <a className="credits-link-card" href="https://pokeapi.co" target="_blank" rel="noreferrer">
                <span className="credits-link-title">PokeAPI</span>
                <span className="credits-link-note">Roster data and renders</span>
              </a>
              <a
                className="credits-link-card"
                href="https://www.serebii.net/legendsz-a/megaevolutions.shtml"
                target="_blank"
                rel="noreferrer"
              >
                <span className="credits-link-title">Serebii</span>
                <span className="credits-link-note">Legends: Z-A mega roster</span>
              </a>
              <a className="credits-link-card" href="https://pokemondb.net" target="_blank" rel="noreferrer">
                <span className="credits-link-title">Pokémon DB</span>
                <span className="credits-link-note">Fallback artwork</span>
              </a>
            </div>
            <button type="button" className="result-close" onClick={() => setCreditsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
