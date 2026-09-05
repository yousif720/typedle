import { useState } from 'react'

import type { UserCompletionsMap } from '../../lib/types'
import { Modal } from '../Modal'

type RewindModalProps = {
  open: boolean
  onClose: () => void
  todaySeed: string
  currentSeed: string
  completions: UserCompletionsMap
  onLoadDay: (seed: string) => void
}

export function RewindModal({ open, onClose, todaySeed, currentSeed, completions, onLoadDay }: RewindModalProps) {
  const [date, setDate] = useState(currentSeed <= todaySeed ? currentSeed : todaySeed)
  const [status, setStatus] = useState('')

  const recent = Object.values(completions)
    .filter((completion) => completion.seed < todaySeed)
    .sort((left, right) => right.seed.localeCompare(left.seed))
    .slice(0, 20)

  function load(seed: string) {
    if (!seed) {
      setStatus('Pick a day to load.')
      return
    }

    if (seed > todaySeed) {
      setStatus('You can only replay today or an earlier day.')
      return
    }

    onLoadDay(seed)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-rewind"
      eyebrow="Rewind"
      title="Play a previous day"
      description="Replaying an old day doesn't change your streak."
      status={status}
      footer={
        <>
          <button type="button" className="button button-primary" onClick={() => load(date)}>
            Load day
          </button>
          <button type="button" className="button button-ghost" onClick={() => onLoadDay(todaySeed)}>
            Back to today
          </button>
        </>
      }
    >
      <label className="field-label" htmlFor="rewind-date">
        Date
      </label>
      <input
        id="rewind-date"
        className="field-input"
        type="date"
        value={date}
        max={todaySeed}
        onChange={(event) => {
          setDate(event.target.value)
          setStatus('')
        }}
      />

      {recent.length > 0 ? (
        <>
          <h3 className="section-heading">Days you&apos;ve finished</h3>
          <ul className="rewind-list">
            {recent.map((completion) => (
              <li key={completion.seed}>
                <button type="button" className="rewind-row" onClick={() => onLoadDay(completion.seed)}>
                  <span className="rewind-date">{completion.seed}</span>
                  <span className="rewind-answer">{completion.targetPokemon || 'Unknown'}</span>
                  <span className={`rewind-outcome is-${completion.solved ? 'win' : 'loss'}`}>
                    {completion.solved ? `${completion.attemptsUsed}/6` : 'X/6'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Modal>
  )
}
