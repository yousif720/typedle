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
    `https://archives.bulbagarden.net/wiki/Special:FilePath/${encodeURIComponent(fileName)}`,
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

function renderTypeTiles(values: readonly InteractionClue[], className: string, showMultiplier = false) {
  if (values.length === 0) {
    return renderStopSymbol('none')
  }

  return values.map((clue) => {
    const type = clue.attackType
    const multiplierLabel = showMultiplier ? formatTypeMultiplier(clue.multiplier) : ''

    return (
      <span
        key={type}
        className={`tile ${className}${showMultiplier ? ' tile-with-multiplier' : ''}`}
        title={showMultiplier ? `${type} ${multiplierLabel}` : type}
        aria-label={showMultiplier ? `${type} ${multiplierLabel}` : type}
      >
        <img className="type-icon" src={typeIconUrls[type as keyof typeof typeIconUrls]} alt="" aria-hidden="true" />
        {showMultiplier ? <span className="tile-multiplier">{multiplierLabel}</span> : null}
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
  const abilityVisible = wrongGuessCount >= 4

  useEffect(() => {
    if (!solved && !failed) {
      setResultModalOpen(false)
      setResultImageUrl('')
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

    if (nextWrongGuessCount >= 5) {
      setFailed(true)
      setMessage(`Fail. The answer was ${target.name}.`)
      return
    }

    if (nextWrongGuessCount === 4) {
      setMessage('Wrong guess. The ability is now revealed.')
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
        <header className="wordle-header">
          <p className="eyebrow">Pokémon Wordle</p>
          <h1>TypeDle</h1>
          <p className="subtitle">Guess the Pokémon one clue row at a time.</p>
        </header>

        <section className="board" aria-label="Type clue board">
          <div className="row row-weakness">
            <span className="row-label">Weak to</span>
            <div className="tile-group">{renderTypeTiles(weaknesses, 'tile-weakness', true)}</div>
          </div>

          <div className="row row-neutral">
            <span className="row-label">Neutral</span>
            <div className="tile-group">
              {neutralVisible ? renderTypeTiles(neutral, 'tile-neutral tile-revealed') : renderPlaceholderTile()}
            </div>
          </div>

          <div className="row row-resistance">
            <span className="row-label">Resists</span>
            <div className="tile-group">
              {resistanceVisible
                ? renderTypeTiles(resistances, 'tile-resistance tile-revealed', true)
                : renderPlaceholderTile()}
            </div>
          </div>

          <div className="row row-immunity">
            <span className="row-label">Immune to</span>
            <div className="tile-group">
              {immunityVisible ? renderTypeTiles(immunities, 'tile-immunity tile-revealed') : renderPlaceholderTile()}
            </div>
          </div>

          <div className="row row-ability">
            <span className="row-label">Ability</span>
            <div className="tile-group">
              {abilityVisible ? renderAbilityTile(target.ability) : renderPlaceholderTile()}
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
            <div className="result-visual">
              {resultImageUrl ? (
                <img className="result-image" src={resultImageUrl} alt={target.name} />
              ) : (
                <div className="result-image result-image-loading">Loading render...</div>
              )}
            </div>
            <button type="button" className="result-close" onClick={() => setResultModalOpen(false)}>
              Close
            </button>
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
