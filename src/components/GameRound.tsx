import { useMemo } from 'react'

import { getEvolutionStage, getRegion, getTypeSummary, type PokemonEntry } from '../data/pokemon'
import { useGameSession, type GameOutcome } from '../hooks/useGameSession'
import { MAX_GUESSES, getGuessesLeft } from '../lib/gameRules'
import type { GameMode, StreakState, UserCompletion } from '../lib/types'
import { Board } from './Board'
import { GuessBar } from './GuessBar'
import { GuessHistory } from './GuessHistory'
import { Hud } from './Hud'

type GameRoundProps = {
  seed: string
  mode: GameMode
  target: PokemonEntry
  storageKey: string | null
  completion?: UserCompletion
  streakState: StreakState
  isAuthenticated: boolean
  hardMode: boolean
  syncing: boolean
  onComplete: (outcome: GameOutcome) => void
  onOpenRewind: () => void
  onOpenResult: () => void
}

/**
 * One round of the game. The parent gives this a `key` built from the seed, the
 * storage identity and the saved completion, so changing day or mode — or
 * finishing the restore of a signed-in session — gives a genuinely fresh
 * component rather than relying on an effect to reset a pile of individual
 * state variables.
 */
export function GameRound({
  seed,
  mode,
  target,
  storageKey,
  completion,
  streakState,
  isAuthenticated,
  hardMode,
  syncing,
  onComplete,
  onOpenRewind,
  onOpenResult,
}: GameRoundProps) {
  const { state, isComplete, submitGuess, setGuessValue } = useGameSession({
    seed,
    target,
    storageKey,
    completion,
    onComplete,
  })

  const summary = useMemo(() => getTypeSummary(target), [target])
  const region = useMemo(() => getRegion(target.name), [target.name])
  const evolutionStage = useMemo(() => getEvolutionStage(target.name), [target.name])

  // Hard mode freezes the clue board after the second wrong guess.
  const effectiveWrongCount = hardMode ? Math.min(state.wrongGuessCount, 2) : state.wrongGuessCount
  const disabled = isComplete || syncing

  const statusMessage =
    state.message ||
    (syncing
      ? 'Syncing your account…'
      : isComplete
        ? state.solved
          ? 'Solved.'
          : 'Out of guesses.'
        : 'Guess to reveal the next clue.')

  return (
    <div className="game">
      <Hud
        mode={mode}
        seed={seed}
        streakState={streakState}
        guessesLeft={getGuessesLeft(state.wrongGuessCount)}
        isAuthenticated={isAuthenticated}
      />

      <Board
        target={target}
        summary={summary}
        region={region}
        evolutionStage={evolutionStage}
        wrongGuessCount={effectiveWrongCount}
      />

      <GuessBar
        value={state.guessValue}
        onChange={setGuessValue}
        onSubmit={submitGuess}
        disabled={disabled}
        guessedNames={state.guessHistory}
        onOpenRewind={onOpenRewind}
      />

      <p className="status" role="status" aria-live="polite">
        {hardMode && state.wrongGuessCount > 2 ? 'Hard mode: no more clues. ' : ''}{statusMessage}
        {isComplete ? (
          <button type="button" className="status-link" onClick={onOpenResult}>
            View result
          </button>
        ) : null}
      </p>

      <GuessHistory
        heading={`Guesses (${state.guessHistory.length}/${MAX_GUESSES})`}
        emptyLabel="No guesses yet. Try a Pokémon to unlock your next clue."
        guesses={state.guessHistory}
        targetTypes={target.types}
      />
    </div>
  )
}
