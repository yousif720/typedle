import { useState } from 'react'

import { pokemonArtwork } from '../../data/pokemon.artwork.generated'
import type { PokemonEntry } from '../../data/pokemon'
import { MAX_GUESSES, getScore, guessDistributionBuckets } from '../../lib/gameRules'
import { getArtworkUrl } from '../../lib/slug'
import type { GameMode, UserStats } from '../../lib/types'
import { GuessHistory } from '../GuessHistory'
import { Modal } from '../Modal'

type ResultModalProps = {
  open: boolean
  onClose: () => void
  mode: GameMode
  target: PokemonEntry
  solved: boolean
  guessHistory: string[]
  wrongGuessCount: number
  globalStats: UserStats
  onShare: () => void
  onPractice: () => void
  onCustomize: () => void
  shareStatus: string
}

function ResultArtwork({ name }: { name: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="result-image-fallback" aria-hidden="true">
        {name.charAt(0)}
      </div>
    )
  }

  return (
    <img
      className="result-image"
      src={getArtworkUrl(name, pokemonArtwork)}
      alt={name}
      onError={() => setFailed(true)}
    />
  )
}

function DistributionChart({ stats, highlight }: { stats: UserStats; highlight: number | null }) {
  const max = Math.max(1, ...guessDistributionBuckets.map((bucket) => stats.guessDistribution[bucket] ?? 0))
  const averageWin = stats.wins > 0 ? stats.totalWinningGuesses / stats.wins : 0
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0

  return (
    <div className="distribution">
      <h3 className="section-heading">How everyone did today</h3>

      {guessDistributionBuckets.map((bucket) => {
        const count = stats.guessDistribution[bucket] ?? 0
        const width = Math.max(6, Math.round((count / max) * 100))

        return (
          <div className="distribution-row" key={bucket}>
            <span className="distribution-label">{bucket}</span>
            <div className="distribution-track">
              <div
                className={`distribution-fill${highlight === bucket ? ' is-you' : ''}`}
                style={{ width: `${width}%` }}
              >
                <span>{count}</span>
              </div>
            </div>
          </div>
        )
      })}

      <p className="distribution-summary">
        Average win: <strong>{stats.wins > 0 ? averageWin.toFixed(2) : '—'}</strong> guesses · Win rate:{' '}
        <strong>{winRate}%</strong>
      </p>
    </div>
  )
}

export function ResultModal({
  open,
  onClose,
  mode,
  target,
  solved,
  guessHistory,
  wrongGuessCount,
  globalStats,
  onShare,
  onPractice,
  onCustomize,
  shareStatus,
}: ResultModalProps) {
  const isNonDaily = mode !== 'daily'
  const attemptsUsed = solved ? guessHistory.length : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-result"
      eyebrow={solved ? 'Solved' : 'Out of guesses'}
      title={target.name}
      description={
        solved
          ? `You got it in ${attemptsUsed} ${attemptsUsed === 1 ? 'guess' : 'guesses'}.`
          : 'Better luck tomorrow — here was the answer.'
      }
      status={shareStatus}
      footer={
        <>
          <button type="button" className="button button-primary" onClick={onShare}>
            Share result
          </button>
          <button type="button" className="button button-secondary" onClick={onPractice}>
            {isNonDaily ? 'Another practice round' : 'Practice round'}
          </button>
          <button type="button" className="button button-ghost" onClick={onCustomize}>
            Customize
          </button>
          <button type="button" className="button button-ghost" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className="result-visual">
        {/* Keyed by name so a new answer gets a fresh <ResultArtwork>, which
            resets the failed-image state without needing an effect. */}
        <ResultArtwork key={target.name} name={target.name} />
      </div>

      <div className="result-score">
        <span className="result-score-label">Score</span>
        <span className="result-score-value">{getScore(wrongGuessCount)}</span>
        <span className="result-score-detail">
          {solved ? `${attemptsUsed}/${MAX_GUESSES} guesses` : `X/${MAX_GUESSES}`}
        </span>
      </div>

      <GuessHistory heading="Your guesses" guesses={guessHistory} targetTypes={target.types} />

      {isNonDaily ? (
        <p className="result-note">Practice and challenge rounds don&apos;t affect your streak or stats.</p>
      ) : (
        <DistributionChart stats={globalStats} highlight={solved ? guessHistory.length : null} />
      )}
    </Modal>
  )
}
