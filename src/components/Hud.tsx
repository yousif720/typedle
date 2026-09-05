import { MAX_GUESSES } from '../lib/gameRules'
import type { GameMode, StreakState } from '../lib/types'

type HudProps = {
  mode: GameMode
  seed: string
  streakState: StreakState
  guessesLeft: number
  isAuthenticated: boolean
}

const modeLabels: Record<GameMode, string> = {
  daily: 'Day',
  practice: 'Mode',
  challenge: 'Mode',
}

const modeValues: Record<GameMode, string> = {
  daily: '',
  practice: 'Practice',
  challenge: 'Challenge',
}

export function Hud({ mode, seed, streakState, guessesLeft, isAuthenticated }: HudProps) {
  const guessesLow = guessesLeft <= 2

  return (
    <section className="hud" aria-label="Game status">
      <div className="hud-chip">
        <span className="hud-chip-label">{modeLabels[mode]}</span>
        <span className="hud-chip-value">{mode === 'daily' ? seed : modeValues[mode]}</span>
      </div>

      {isAuthenticated ? (
        <>
          <div className="hud-chip">
            <span className="hud-chip-label">Streak</span>
            <span className="hud-chip-value">{streakState.current}</span>
          </div>
          <div className="hud-chip">
            <span className="hud-chip-label">Best</span>
            <span className="hud-chip-value">{streakState.best}</span>
          </div>
        </>
      ) : null}

      <div className="hud-chip">
        <span className="hud-chip-label">Guesses</span>
        <span className={`hud-chip-value${guessesLow ? ' is-low' : ''}`}>
          {guessesLeft}
          <span className="hud-chip-total">/{MAX_GUESSES}</span>
        </span>
      </div>
    </section>
  )
}
