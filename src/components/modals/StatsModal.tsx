import { useMemo } from 'react'

import { evaluateAchievements, countUnlocked } from '../../lib/achievements'
import { guessDistributionBuckets } from '../../lib/gameRules'
import type { StreakState, UserCompletionsMap, UserStats } from '../../lib/types'
import { Modal } from '../Modal'

type StatsModalProps = {
  open: boolean
  onClose: () => void
  stats: UserStats
  streakState: StreakState
  completions: UserCompletionsMap
  isAuthenticated: boolean
  onRequestSignIn: () => void
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-value">{value}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
  )
}

/**
 * A GitHub-style contribution grid over the last 12 weeks. Gives long-term
 * players something to look at beyond a single streak counter.
 */
function HistoryHeatmap({ completions }: { completions: UserCompletionsMap }) {
  const days = useMemo(() => {
    const result: Array<{ seed: string; state: 'none' | 'win' | 'loss' }> = []
    const today = new Date()

    for (let offset = 83; offset >= 0; offset -= 1) {
      const date = new Date(today)
      date.setUTCDate(date.getUTCDate() - offset)
      const seed = date.toISOString().slice(0, 10)
      const completion = completions[seed]

      result.push({
        seed,
        state: !completion ? 'none' : completion.solved ? 'win' : 'loss',
      })
    }

    return result
  }, [completions])

  return (
    <div className="heatmap" aria-label="Your last 12 weeks">
      {days.map((day) => (
        <span
          key={day.seed}
          className={`heatmap-cell is-${day.state}`}
          title={`${day.seed}: ${day.state === 'none' ? 'not played' : day.state === 'win' ? 'solved' : 'missed'}`}
        />
      ))}
    </div>
  )
}

export function StatsModal({
  open,
  onClose,
  stats,
  streakState,
  completions,
  isAuthenticated,
  onRequestSignIn,
}: StatsModalProps) {
  const achievements = useMemo(
    () => evaluateAchievements({ stats, streakState, completions }),
    [completions, stats, streakState],
  )

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0
  const averageWin = stats.wins > 0 ? (stats.totalWinningGuesses / stats.wins).toFixed(2) : '—'
  const maxBucket = Math.max(1, ...guessDistributionBuckets.map((bucket) => stats.guessDistribution[bucket] ?? 0))

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-stats"
      eyebrow="Your record"
      title="Statistics"
      description={isAuthenticated ? undefined : 'Sign in to keep stats across devices.'}
    >
      {!isAuthenticated ? (
        <div className="empty-state">
          <p>Your stats are tied to an account.</p>
          <button type="button" className="button button-primary" onClick={onRequestSignIn}>
            Sign in
          </button>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatTile label="Played" value={stats.played} />
            <StatTile label="Win rate" value={`${winRate}%`} />
            <StatTile label="Streak" value={streakState.current} />
            <StatTile label="Best" value={streakState.best} />
          </div>

          <h3 className="section-heading">Guess distribution</h3>
          <div className="distribution">
            {guessDistributionBuckets.map((bucket) => {
              const count = stats.guessDistribution[bucket] ?? 0

              return (
                <div className="distribution-row" key={bucket}>
                  <span className="distribution-label">{bucket}</span>
                  <div className="distribution-track">
                    <div
                      className="distribution-fill"
                      style={{ width: `${Math.max(6, Math.round((count / maxBucket) * 100))}%` }}
                    >
                      <span>{count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <p className="distribution-summary">
              Average win: <strong>{averageWin}</strong> guesses
            </p>
          </div>

          <h3 className="section-heading">Last 12 weeks</h3>
          <HistoryHeatmap completions={completions} />

          <h3 className="section-heading">
            Achievements <span className="section-count">{countUnlocked(achievements)}/{achievements.length}</span>
          </h3>
          <ul className="achievement-grid">
            {achievements.map((achievement) => (
              <li
                key={achievement.id}
                className={`achievement${achievement.unlocked ? ' is-unlocked' : ''}`}
                title={achievement.description}
              >
                <span className="achievement-icon" aria-hidden="true">
                  {achievement.icon}
                </span>
                <span className="achievement-body">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-description">{achievement.description}</span>
                  {!achievement.unlocked && achievement.progress > 0 ? (
                    <span className="achievement-progress">
                      <span style={{ width: `${Math.round(achievement.progress * 100)}%` }} />
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  )
}
