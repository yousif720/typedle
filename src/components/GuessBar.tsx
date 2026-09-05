import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { searchPokemon, type PokemonEntry } from '../data/pokemon'

type GuessBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled: boolean
  guessedNames: string[]
  onOpenRewind: () => void
}

export function GuessBar({ value, onChange, onSubmit, disabled, guessedNames, onOpenRewind }: GuessBarProps) {
  const [open, setOpen] = useState(false)
  const [rawHighlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const inputId = useId()

  const suggestions = useMemo(() => (open ? searchPokemon(value) : []), [open, value])
  const showSuggestions = open && suggestions.length > 0 && !disabled

  // Clamp during render rather than resetting from an effect. The highlight is
  // derived from the current suggestion list, so it should never need a second
  // render pass to become valid.
  const highlighted = Math.min(rawHighlighted, Math.max(0, suggestions.length - 1))

  function commit(name: string) {
    onChange(name)
    setOpen(false)
    inputRef.current?.focus()
  }

  /**
   * One submit path shared by the Enter key and the Guess button. When the
   * dropdown is open the highlighted suggestion wins, so typing "squirt" and
   * pressing Enter once guesses Squirtle.
   *
   * An earlier version committed the suggestion on a first Enter and submitted
   * on a second, which raced React's state updates when both key presses landed
   * in the same batch.
   */
  function performSubmit() {
    const chosen = showSuggestions && suggestions[highlighted] ? suggestions[highlighted].name : value

    setOpen(false)
    onSubmit(chosen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    performSubmit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }

    // Enter is handled explicitly rather than leaning on the form's implicit
    // submission, which is inconsistent across mobile keyboards and can fire
    // mid-composition on IME input.
    if (event.key === 'Enter') {
      if (event.nativeEvent.isComposing) {
        return
      }

      event.preventDefault()
      performSubmit()
      return
    }

    if (!showSuggestions) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((index) => Math.min(index + 1, suggestions.length - 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((index) => Math.max(index - 1, 0))
    }
  }

  function renderSuggestion(pokemon: PokemonEntry, index: number) {
    const alreadyGuessed = guessedNames.includes(pokemon.name)

    return (
      <li key={pokemon.name} role="presentation">
        <button
          type="button"
          id={`${listboxId}-option-${index}`}
          className={`guess-option${index === highlighted ? ' is-active' : ''}${alreadyGuessed ? ' is-used' : ''}`}
          role="option"
          aria-selected={index === highlighted}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commit(pokemon.name)}
          onMouseEnter={() => setHighlighted(index)}
        >
          <span className="guess-option-name">{pokemon.name}</span>
          <span className="guess-option-meta">
            {pokemon.types.join(' / ')}
            {alreadyGuessed ? ' · already guessed' : ''}
          </span>
        </button>
      </li>
    )
  }

  return (
    <form className="guess-bar" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={inputId}>
        Guess a Pokémon
      </label>

      <div className="guess-field">
        <input
          id={inputId}
          ref={inputRef}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={disabled}
          value={value}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-activedescendant={showSuggestions ? `${listboxId}-option-${highlighted}` : undefined}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
            setHighlighted(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter a Pokémon"
        />

        {showSuggestions ? (
          <ul className="guess-picker" id={listboxId} role="listbox" aria-label="Pokémon suggestions">
            {suggestions.map(renderSuggestion)}
          </ul>
        ) : null}
      </div>

      <button type="button" className="icon-button" onClick={onOpenRewind} aria-label="Play a previous day">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3.5" y="5.5" width="17" height="15" rx="2.8" />
          <path d="M7.5 3.8v3.4M16.5 3.8v3.4M3.8 9.2h16.4" />
        </svg>
      </button>

      <button type="submit" className="button button-primary guess-submit" disabled={disabled}>
        Guess
      </button>
    </form>
  )
}
