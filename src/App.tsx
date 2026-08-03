import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './App.css'
import {
  type InteractionClue,
  getDailySeed,
  getPokemonBySeed,
  getTypeSummary,
  normalizePokemonName,
  pokemonLookup,
  pokemonPool,
} from './data/pokemon'

type StreakState = {
  current: number
  best: number
  lastSeed: string | null
}

type EvolutionStage = 'loading' | 'first' | 'middle' | 'final' | 'mega' | 'no-evolution-line'

type EvolutionChainNode = {
  species?: { name?: string }
  evolves_to?: EvolutionChainNode[]
  evolves_from_species?: { name?: string } | null
}

const streakStorageKeyPrefix = 'typedle-streak-v1-'
const dailyAssignmentsStorageKeyPrefix = 'typedle-daily-pokemon-v1-'
const userStatsStorageKeyPrefix = 'typedle-stats-v1-'
const globalStatsStorageKey = 'typedle-global-stats-v1'
const configuredStatsApiBaseUrl = import.meta.env.VITE_STATS_API_BASE_URL?.trim() ?? 'https://typedle.onrender.com'
const globalStatsApiBaseUrl = configuredStatsApiBaseUrl.replace(/\/+$/g, '')
const globalStatsApiPath = `${globalStatsApiBaseUrl}/api/stats/global`
const guestClientIdStorageKey = 'typedle-guest-client-id-v1'
const dayStateCookiePrefix = 'typedle-daystate-'
const dayStateCookieLifetimeDays = 365
const usersStorageKey = 'typedle-users-v1'
const currentUserStorageKey = 'typedle-current-user-v1'

type DailyAssignments = Record<string, string>

type DayState = {
  guessValue: string
  message: string
  wrongGuessCount: number
  solved: boolean
  failed: boolean
}

type StoredUser = {
  username: string
  passwordHash: string
}

type StoredUsers = Record<string, StoredUser>

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
  outcomeId: string
  solved: boolean
  attemptsUsed: number
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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
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

function findSpeciesInChain(chain: EvolutionChainNode | undefined, speciesName: string): EvolutionChainNode | null {
  if (!chain) {
    return null
  }

  if (chain.species?.name === speciesName) {
    return chain
  }

  for (const nextChain of chain.evolves_to ?? []) {
    const found = findSpeciesInChain(nextChain, speciesName)

    if (found) {
      return found
    }
  }

  return null
}

function resolveEvolutionStage(chain: EvolutionChainNode | undefined, speciesName: string): EvolutionStage {
  const speciesNode = findSpeciesInChain(chain, speciesName)

  if (!speciesNode) {
    return 'no-evolution-line'
  }

  const hasPreEvolution = Boolean(speciesNode.evolves_from_species)
  const hasEvolutions = (speciesNode.evolves_to?.length ?? 0) > 0

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

function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

function getStreakStorageKey(userKey: string) {
  return `${streakStorageKeyPrefix}${userKey}`
}

function getDailyAssignmentsStorageKey(userKey: string) {
  return `${dailyAssignmentsStorageKeyPrefix}${userKey}`
}

function getDayStateCookieName(seed: string, userKey: string) {
  return `${dayStateCookiePrefix}${userKey}-${seed}`
}

function getUserStatsStorageKey(userKey: string) {
  return `${userStatsStorageKeyPrefix}${userKey}`
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

function loadUserStats(userKey: string): UserStats {
  if (typeof window === 'undefined') {
    return createEmptyUserStats()
  }

  try {
    const rawValue = window.localStorage.getItem(getUserStatsStorageKey(userKey))

    if (!rawValue) {
      return createEmptyUserStats()
    }

    const parsedValue = JSON.parse(rawValue) as Partial<UserStats>
    return coerceStats(parsedValue)
  } catch {
    return createEmptyUserStats()
  }
}

function saveUserStats(userKey: string, stats: UserStats) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getUserStatsStorageKey(userKey), JSON.stringify(stats))
}

function loadGlobalStats(): UserStats {
  if (typeof window === 'undefined') {
    return createEmptyUserStats()
  }

  try {
    const rawValue = window.localStorage.getItem(globalStatsStorageKey)

    if (!rawValue) {
      return createEmptyUserStats()
    }

    const parsedValue = JSON.parse(rawValue) as Partial<UserStats>
    return coerceStats(parsedValue)
  } catch {
    return createEmptyUserStats()
  }
}

function saveGlobalStats(stats: UserStats) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(globalStatsStorageKey, JSON.stringify(stats))
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

async function fetchGlobalStatsFromApi() {
  const response = await fetch(globalStatsApiPath)

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

function loadUsers(): StoredUsers {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(usersStorageKey)

    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as unknown

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }

    const users: StoredUsers = {}

    for (const [key, value] of Object.entries(parsedValue as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') {
        continue
      }

      const candidate = value as Partial<StoredUser>

      if (typeof candidate.username === 'string' && typeof candidate.passwordHash === 'string') {
        users[key] = {
          username: candidate.username,
          passwordHash: candidate.passwordHash,
        }
      }
    }

    return users
  } catch {
    return {}
  }
}

function saveUsers(users: StoredUsers) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(usersStorageKey, JSON.stringify(users))
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

function loadStreakState(seed: string, userKey: string): StreakState {
  if (typeof window === 'undefined') {
    return { current: 0, best: 0, lastSeed: null }
  }

  try {
    const rawValue = window.localStorage.getItem(getStreakStorageKey(userKey))

    if (!rawValue) {
      return { current: 0, best: 0, lastSeed: null }
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StreakState>
    const current = typeof parsedValue.current === 'number' ? parsedValue.current : 0
    const best = typeof parsedValue.best === 'number' ? parsedValue.best : 0
    const lastSeed = typeof parsedValue.lastSeed === 'string' ? parsedValue.lastSeed : null

    if (!lastSeed) {
      return { current, best, lastSeed: null }
    }

    if (lastSeed === seed || lastSeed === getPreviousSeed(seed)) {
      return { current, best, lastSeed }
    }

    return { current: 0, best, lastSeed }
  } catch {
    return { current: 0, best: 0, lastSeed: null }
  }
}

function saveStreakState(state: StreakState, userKey: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStreakStorageKey(userKey), JSON.stringify(state))
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

function formatGuessCount(count: number) {
  return `${count} guess${count === 1 ? '' : 'es'}`
}

function TypeDleLogo() {
  return (
    <svg className="typedle-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 110" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="stellarRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4FA3" />
          <stop offset="20%" stopColor="#FF7A61" />
          <stop offset="40%" stopColor="#FFD84A" />
          <stop offset="62%" stopColor="#2BDAC1" />
          <stop offset="80%" stopColor="#5E66FF" />
          <stop offset="100%" stopColor="#9E4DFF" />
        </linearGradient>
        <filter id="logoTextGlow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="#FFFFFF" floodOpacity="0.78" />
          <feDropShadow dx="0" dy="1.3" stdDeviation="0.9" floodColor="#0B1020" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect
        x="6"
        y="6"
        width="368"
        height="98"
        rx="22"
        fill="url(#stellarRainbow)"
      />

      <text
        x="50%"
        y="51.5%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Segoe UI Variable Display, SF Pro Display, Avenir Next, Inter, sans-serif"
        fontSize="48"
        fontWeight="800"
        letterSpacing="2.1"
        fill="#0B1020"
        stroke="#FFFFFF"
        strokeWidth="1.25"
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
  const [seed, setSeed] = useState(todaySeed)
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
  const [globalStats, setGlobalStats] = useState<UserStats>(() => loadGlobalStats())
  const [guestClientId] = useState(() => getOrCreateGuestClientId())
  const [copyStatus, setCopyStatus] = useState('')
  const [creditsOpen, setCreditsOpen] = useState(false)
  const [rewindOpen, setRewindOpen] = useState(false)
  const [rewindDate, setRewindDate] = useState(seed)
  const [rewindStatus, setRewindStatus] = useState('')
  const [dayStateHydrated, setDayStateHydrated] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authStatus, setAuthStatus] = useState('')
  const [authOpen, setAuthOpen] = useState(false)

  const target = useMemo(() => resolvePokemonForSeed(seed, dailyAssignments), [dailyAssignments, seed])
  const { weaknesses, resistances, immunities } = useMemo(
    () => getTypeSummary(target),
    [target],
  )
  const filteredSuggestions = useMemo(() => {
    const normalizedGuess = normalizePokemonName(guessValue)

    if (!normalizedGuess) {
      return pokemonPool.slice(0, 8)
    }

    return pokemonPool
      .filter((pokemon) => normalizePokemonName(pokemon.name).includes(normalizedGuess))
      .slice(0, 8)
  }, [guessValue])
  const showPicker = pickerOpen && filteredSuggestions.length > 0 && !solved && !failed

  const evolutionVisible = wrongGuessCount >= 1
  const resistanceVisible = wrongGuessCount >= 2
  const immunityVisible = wrongGuessCount >= 3
  const regionVisible = wrongGuessCount >= 4
  const abilityVisible = wrongGuessCount >= 5
  const guessesLeft = Math.max(0, 6 - wrongGuessCount)
  const isTodayChallenge = seed === todaySeed
  const isAuthenticated = Boolean(currentUserKey)
  const averageWinAttempts = globalStats.wins > 0 ? globalStats.totalWinningGuesses / globalStats.wins : 0
  const winRate = globalStats.played > 0 ? Math.round((globalStats.wins / globalStats.played) * 100) : 0
  const guessDistributionOrder: Array<keyof GuessDistribution> = [1, 2, 3, 4, 5, 6]
  const maxDistributionCount = Math.max(1, ...guessDistributionOrder.map((guess) => globalStats.guessDistribution[guess]))
  const rewindOptions = useMemo(
    () =>
      Object.entries(dailyAssignments)
        .filter(([entrySeed]) => entrySeed < todaySeed)
        .map(([entrySeed, pokemonName]) => ({
          seed: entrySeed,
          pokemonName,
          solved: currentUserKey ? (loadDayState(entrySeed, currentUserKey)?.solved ?? false) : false,
        }))
        .sort((left, right) => right.seed.localeCompare(left.seed))
        .slice(0, 28),
    [currentUserKey, dailyAssignments, todaySeed],
  )

  useEffect(() => {
    if (!currentUserKey) {
      setCurrentUsername('')
      return
    }

    const users = loadUsers()
    const user = users[currentUserKey]

    if (!user) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(currentUserStorageKey)
      }

      setCurrentUserKey(null)
      setCurrentUsername('')
      return
    }

    setCurrentUsername(user.username)
  }, [currentUserKey])

  useEffect(() => {
    if (!currentUserKey) {
      setDailyAssignments({})
      setStreakState({ current: 0, best: 0, lastSeed: null })
      setUserStats(createEmptyUserStats())
      return
    }

    setDailyAssignments(loadDailyAssignments(currentUserKey))
    setStreakState(loadStreakState(todaySeed, currentUserKey))
    setUserStats(loadUserStats(currentUserKey))
    setSeed(todaySeed)
  }, [currentUserKey, todaySeed])

  useEffect(() => {
    if (!currentUserKey) {
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
      setSolved(false)
      setFailed(false)
      setPickerOpen(false)
      setHighlightedSuggestionIndex(0)
      setResultModalOpen(false)
      setResultImageUrl('')
      setCopyStatus('')
      setRewindStatus('')
      setDayStateHydrated(false)
      return
    }

    setDayStateHydrated(false)

    const savedDayState = loadDayState(seed, currentUserKey)

    if (savedDayState) {
      setGuessValue(savedDayState.guessValue)
      setMessage(savedDayState.message)
      setWrongGuessCount(savedDayState.wrongGuessCount)
      setSolved(savedDayState.solved)
      setFailed(savedDayState.failed)
    } else {
      setGuessValue('')
      setMessage('')
      setWrongGuessCount(0)
      setSolved(false)
      setFailed(false)
    }

    setPickerOpen(false)
    setHighlightedSuggestionIndex(0)
    setResultModalOpen(false)
    setResultImageUrl('')
    setCopyStatus('')
    setRewindStatus('')
    setDayStateHydrated(true)
  }, [currentUserKey, seed])

  useEffect(() => {
    if (!currentUserKey || !dayStateHydrated) {
      return
    }

    saveDayState(seed, currentUserKey, {
      guessValue,
      message,
      wrongGuessCount,
      solved,
      failed,
    })
  }, [currentUserKey, dayStateHydrated, failed, guessValue, message, seed, solved, wrongGuessCount])

  useEffect(() => {
    let cancelled = false

    async function loadPokemonClueMetadata() {
      try {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${toPokemonSlug(target.name)}`)

        if (!pokemonResponse.ok) {
          throw new Error('Unable to load Pokémon species')
        }

        const pokemonData = await pokemonResponse.json()
        const speciesUrl = pokemonData?.species?.url

        if (!speciesUrl) {
          throw new Error('Missing species URL')
        }

        const speciesResponse = await fetch(speciesUrl)

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
      saveStreakState(nextStreakState, currentUserKey)
    }
  }, [currentUserKey, failed, isTodayChallenge, seed, solved, streakState.best, streakState.current, streakState.lastSeed])

  useEffect(() => {
    if (!currentUserKey || (!solved && !failed)) {
      return
    }

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
    saveUserStats(currentUserKey, nextStats)
  }, [currentUserKey, failed, seed, solved, userStats, wrongGuessCount])

  useEffect(() => {
    let cancelled = false

    async function hydrateGlobalStats() {
      try {
        const remoteStats = await fetchGlobalStatsFromApi()

        if (cancelled) {
          return
        }

        setGlobalStats(remoteStats)
        saveGlobalStats(remoteStats)
      } catch {
        // Local storage snapshot remains the fallback when API is unavailable.
      }
    }

    void hydrateGlobalStats()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!solved && !failed) {
      return
    }

    const attemptsUsed = solved ? wrongGuessCount + 1 : wrongGuessCount
    const safeAttemptsUsed = Math.max(1, Math.min(6, attemptsUsed))
    const outcomeScope = currentUserKey ? `user:${currentUserKey}` : `guest:${guestClientId}`
    const outcomeKey = `${outcomeScope}:${seed}`
    const outcomePayload: GlobalStatsOutcome = {
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
        saveGlobalStats(remoteStats)
      } catch {
        if (cancelled) {
          return
        }

        setGlobalStats((currentStats) => {
          const nextStats = applyOutcomeToStats(currentStats, outcomePayload)
          saveGlobalStats(nextStats)
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
  const shareText = [
    `TypeDle ${seed}`,
    solved ? `Solved in ${formatGuessCount(guessCount)}.` : `Failed after ${formatGuessCount(guessCount)}.`,
    `Streak: ${streakState.current}`,
    `Best streak: ${streakState.best}`,
    `Answer: ${target.name}`,
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
      setMessage('Wrong guess. The ability is now revealed.')
      return
    }

    if (nextWrongGuessCount === 4) {
      setMessage('Wrong guess. The region row is now revealed.')
      return
    }

    if (nextWrongGuessCount === 3) {
      setMessage('Wrong guess. The immunity row is now revealed.')
      return
    }

    if (nextWrongGuessCount === 2) {
      setMessage('Wrong guess. The resistance row is now revealed.')
      return
    }

    setMessage('Wrong guess. The evolution stage row is now revealed.')
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
    const users = loadUsers()

    try {
      const passwordHash = await hashPassword(password)

      if (authMode === 'register') {
        if (users[userKey]) {
          setAuthStatus('Username already exists.')
          return
        }

        users[userKey] = {
          username,
          passwordHash,
        }

        saveUsers(users)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(currentUserStorageKey, userKey)
        }

        setCurrentUserKey(userKey)
        setAuthPassword('')
        setAuthStatus('')
        setAuthOpen(false)
        return
      }

      const existingUser = users[userKey]

      if (!existingUser || existingUser.passwordHash !== passwordHash) {
        setAuthStatus('Invalid username or password.')
        return
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(currentUserStorageKey, userKey)
      }

      setCurrentUserKey(userKey)
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
        <button
          type="button"
          className="login-button"
          onClick={() => {
            setAuthMode('login')
            setAuthStatus('')
            setAuthOpen(true)
          }}
        >
          Login
        </button>
      )}

      <div className="game-shell">
        <div className="game-topbar">
          <header className="wordle-header">
            <div className="title-badge">Daily challenge</div>
            <h1 className="sr-only">TypeDle</h1>
            <TypeDleLogo />
            <p className="subtitle">Guess the Pokémon one clue row at a time.</p>
          </header>

          <section className="game-hud" aria-label="Puzzle status">
            <div className="hud-chip">
              <span className="hud-chip-label">Day</span>
              <span className="hud-chip-value">{seed}</span>
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
              <div className="tile-group">{renderTypeTiles(weaknesses, 'tile-weakness tile-revealed', 'multiplier')}</div>
            </div>

            <div className="row row-stage">
              <span className="row-label">Evolution stage</span>
              <div className="tile-group">{evolutionVisible ? renderEvolutionTile(evolutionStage) : renderPlaceholderTile()}</div>
            </div>

            <div className="row row-resistance">
              <span className="row-label">Resists</span>
              <div className="tile-group">
                {resistanceVisible
                  ? renderTypeTiles(resistances, 'tile-resistance tile-revealed', 'multiplier')
                  : renderPlaceholderTile()}
              </div>
            </div>

            <div className="row row-immunity">
              <span className="row-label">Immune to</span>
              <div className="tile-group">
                {immunityVisible ? renderTypeTiles(immunities, 'tile-immunity tile-revealed', 'immune') : renderPlaceholderTile()}
              </div>
            </div>

            <div className="row row-region">
              <span className="row-label">Region</span>
              <div className="tile-group">
                {regionVisible ? (originRegion === 'loading' ? renderPlaceholderTile() : renderRegionTile(originRegion)) : renderPlaceholderTile()}
              </div>
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
              disabled={solved || failed}
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
          <button type="submit" className="guess-submit">
            Guess
          </button>
        </form>

        <p className="status" aria-live="polite">
          {message || (solved ? 'Solved.' : failed ? 'Failed.' : 'Guess to reveal the next row.')}
        </p>
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
                    <span>{entry.solved ? entry.pokemonName : 'Hidden'}</span>
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
              <div className="result-stat">
                <span className="result-stat-label">Score</span>
                <span className="result-stat-value">
                  {solved ? `${formatGuessCount(guessCount)} solved` : `Lost after ${formatGuessCount(guessCount)}`}
                </span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Streak</span>
                <span className="result-stat-value">{streakState.current}</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Best</span>
                <span className="result-stat-value">{streakState.best}</span>
              </div>
            </div>
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
