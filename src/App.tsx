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

const streakStorageKey = 'typedle-streak-v1'

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

function loadStreakState(seed: string): StreakState {
  if (typeof window === 'undefined') {
    return { current: 0, best: 0, lastSeed: null }
  }

  try {
    const rawValue = window.localStorage.getItem(streakStorageKey)

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

function saveStreakState(state: StreakState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(streakStorageKey, JSON.stringify(state))
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
  const [seed] = useState(() => getDailySeed())
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
  const [streakState, setStreakState] = useState<StreakState>(() => loadStreakState(getDailySeed()))
  const [copyStatus, setCopyStatus] = useState('')
  const [creditsOpen, setCreditsOpen] = useState(false)

  const target = useMemo(() => getPokemonBySeed(seed), [seed])
  const { weaknesses, neutral, resistances, immunities } = useMemo(
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

  const neutralVisible = wrongGuessCount >= 1
  const resistanceVisible = wrongGuessCount >= 2
  const immunityVisible = wrongGuessCount >= 3
  const evolutionVisible = wrongGuessCount >= 4
  const abilityVisible = wrongGuessCount >= 5
  const guessesLeft = Math.max(0, 6 - wrongGuessCount)

  useEffect(() => {
    let cancelled = false

    async function loadEvolutionStage() {
      if (isMegaFormName(target.name)) {
        if (!cancelled) {
          setEvolutionStage('mega')
        }

        return
      }

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
          setEvolutionStage('no-evolution-line')
        }
      }
    }

    setEvolutionStage('loading')
    void loadEvolutionStage()

    return () => {
      cancelled = true
    }
  }, [target.name])

  useEffect(() => {
    if (!solved && !failed) {
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

    if (streakState.lastSeed !== seed || streakState.current !== nextStreakState.current) {
      setStreakState(nextStreakState)
      saveStreakState(nextStreakState)
    }
  }, [failed, seed, solved, streakState.best, streakState.current, streakState.lastSeed])

  useEffect(() => {
    if (!solved && !failed) {
      setResultModalOpen(false)
      setResultImageUrl('')
      setCopyStatus('')
      return
    }

    let cancelled = false
    const slug = toPokemonSlug(target.name)

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
          setResultModalOpen(true)
        }
      } catch {
        if (!cancelled) {
          setResultImageUrl(`https://img.pokemondb.net/artwork/large/${slug}.jpg`)
          setResultModalOpen(true)
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
      setMessage('Wrong guess. The evolution stage is now revealed.')
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

    setMessage('Wrong guess. The neutral row is now revealed.')
  }

  const applySuggestion = (name: string) => {
    setGuessValue(name)
    setPickerOpen(false)
    setHighlightedSuggestionIndex(0)
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

  return (
    <main className="wordle-shell">
      <button type="button" className="credits-button" onClick={() => setCreditsOpen(true)}>
        Credits
      </button>

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
              <div className="tile-group">{renderTypeTiles(weaknesses, 'tile-weakness', 'multiplier')}</div>
            </div>

            <div className="row row-neutral">
              <span className="row-label">Neutral</span>
              <div className="tile-group">
                {neutralVisible ? renderTypeTiles(neutral, 'tile-neutral tile-revealed', 'neutral') : renderPlaceholderTile()}
              </div>
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

            <div className="row row-stage">
              <span className="row-label">Evolution stage</span>
              <div className="tile-group">{evolutionVisible ? renderEvolutionTile(evolutionStage) : renderPlaceholderTile()}</div>
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
          <button type="submit">Guess</button>
        </form>

        <p className="status" aria-live="polite">
          {message || (solved ? 'Solved.' : failed ? 'Failed.' : 'Guess to reveal the next row.')}
        </p>
      </div>

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
