import { useMemo, useState } from 'react'

import { searchPokemon } from '../../data/pokemon'
import { buildChallengeLink } from '../../lib/practice'
import { Modal } from '../Modal'

type CreateADleModalProps = {
  open: boolean
  onClose: () => void
}

export function CreateADleModal({ open, onClose }: CreateADleModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const suggestions = useMemo(() => (selected ? [] : searchPokemon(search)), [search, selected])
  const link = selected ? buildChallengeLink(selected) : ''

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setStatus('Link copied to your clipboard.')
    } catch {
      setStatus('Could not copy automatically — select the link and copy it manually.')
    }
  }

  function reset() {
    setSearch('')
    setSelected(null)
    setStatus('')
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      className="modal-createadle"
      eyebrow="Create-a-dle"
      title="Challenge a friend"
      description="Pick any Pokémon and get a link that makes it the puzzle for whoever opens it."
      status={status}
      footer={
        selected ? (
          <>
            <button type="button" className="button button-primary" onClick={copyLink}>
              Copy link
            </button>
            <button type="button" className="button button-ghost" onClick={reset}>
              Pick another
            </button>
          </>
        ) : null
      }
    >
      <label className="field-label" htmlFor="createadle-search">
        Pokémon
      </label>

      <div className="guess-field">
        <input
          id="createadle-search"
          className="field-input"
          value={selected ?? search}
          onChange={(event) => {
            setSearch(event.target.value)
            setSelected(null)
            setStatus('')
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search for a Pokémon"
        />

        {suggestions.length > 0 ? (
          <ul className="guess-picker" role="listbox" aria-label="Pokémon suggestions">
            {suggestions.map((pokemon) => (
              <li key={pokemon.name} role="presentation">
                <button
                  type="button"
                  className="guess-option"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelected(pokemon.name)
                    setStatus('')
                  }}
                >
                  <span className="guess-option-name">{pokemon.name}</span>
                  <span className="guess-option-meta">{pokemon.types.join(' / ')}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selected ? (
        <div className="challenge-preview">
          <p>
            Ready to share a puzzle for <strong>{selected}</strong>.
          </p>
          {/* Readonly rather than hidden: some browsers block clipboard writes,
              and this gives a manual copy path when that happens. */}
          <input className="field-input challenge-link" value={link} readOnly onFocus={(e) => e.target.select()} />
          <p className="field-hint">The name is encoded in the link so it isn&apos;t spoiled at a glance.</p>
        </div>
      ) : null}
    </Modal>
  )
}
