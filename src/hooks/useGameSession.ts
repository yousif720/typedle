import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { findPokemonByName, type PokemonEntry } from '../data/pokemon'
import { MAX_GUESSES, getRevealMessage } from '../lib/gameRules'
import { isNonDailySeed } from '../lib/practice'
import { dayStateStorage } from '../lib/storage'
import type { DayState, UserCompletion } from '../lib/types'

export type GameState = DayState

export type GameOutcome = {
  solved: boolean
  failed: boolean
  attemptsUsed: number
  guessHistory: string[]
  guessedPokemon: string
}

type Action =
  | { type: 'setGuessValue'; value: string }
  | { type: 'setMessage'; message: string }
  | { type: 'submit'; pokemon: PokemonEntry; target: PokemonEntry }
  | { type: 'restore'; state: GameState }

const emptyState: GameState = {
  guessValue: '',
  message: '',
  wrongGuessCount: 0,
  lastSubmittedPokemon: '',
  guessHistory: [],
  solved: false,
  failed: false,
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'setGuessValue':
      return { ...state, guessValue: action.value }

    case 'setMessage':
      return { ...state, message: action.message }

    case 'restore':
      return action.state

    case 'submit': {
      if (state.solved || state.failed) {
        return state
      }

      const guessHistory = [...state.guessHistory, action.pokemon.name]

      if (action.pokemon.name === action.target.name) {
        return {
          ...state,
          guessValue: '',
          guessHistory,
          lastSubmittedPokemon: action.pokemon.name,
          solved: true,
          message: `Solved. ${action.pokemon.name} is correct.`,
        }
      }

      const wrongGuessCount = state.wrongGuessCount + 1
      const failed = wrongGuessCount >= MAX_GUESSES

      return {
        ...state,
        guessValue: '',
        guessHistory,
        lastSubmittedPokemon: action.pokemon.name,
        wrongGuessCount,
        failed,
        message: failed ? `Out of guesses. The answer was ${action.target.name}.` : getRevealMessage(wrongGuessCount),
      }
    }

    default:
      return state
  }
}

function stateFromCompletion(completion: UserCompletion, fallbackTargetName: string): GameState {
  const targetName = completion.targetPokemon || fallbackTargetName

  return {
    guessValue: '',
    message: completion.solved ? `Solved. ${targetName} is correct.` : `Out of guesses. The answer was ${targetName}.`,
    wrongGuessCount: Math.max(
      0,
      Math.min(MAX_GUESSES, completion.solved ? completion.attemptsUsed - 1 : completion.attemptsUsed),
    ),
    lastSubmittedPokemon: completion.guessedPokemon || '',
    guessHistory: completion.guessHistory,
    solved: completion.solved,
    failed: completion.failed || !completion.solved,
  }
}

type UseGameSessionOptions = {
  seed: string
  target: PokemonEntry
  /**
   * Namespace for the saved day state: the account key when signed in, a
   * per-device guest id otherwise, and `null` while an existing session is
   * still being restored (so a guest's saved round is never shown to someone
   * who is about to be identified as a signed-in user).
   */
  storageKey: string | null
  completion?: UserCompletion
  onComplete?: (outcome: GameOutcome) => void
}

/**
 * Owns everything about a single round. The two structural changes from v1:
 *
 *   1. State lives in a reducer whose initial value is computed synchronously
 *      from storage / an existing completion, instead of being reset by an
 *      effect after the first render. That removes the whole class of
 *      "cascading render" warnings and the flash of a blank board.
 *   2. Finishing a round fires a callback from the event handler, rather than a
 *      pile of effects each watching `solved`/`failed` and racing to persist.
 */
export function useGameSession({ seed, target, storageKey, completion, onComplete }: UseGameSessionOptions) {
  const initialState = useMemo(() => {
    if (completion) {
      return stateFromCompletion(completion, target.name)
    }

    if (storageKey && !isNonDailySeed(seed)) {
      return dayStateStorage.read(seed, storageKey) ?? emptyState
    }

    return emptyState
    // Deliberately only computed for the initial mount of a given seed; the
    // caller remounts this hook's owner via `key` when the seed changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [state, dispatch] = useReducer(reducer, initialState)
  const completedRef = useRef(state.solved || state.failed)

  // Persist in-progress state. This is a pure write to an external system with
  // no setState, which is exactly what effects are for.
  useEffect(() => {
    if (!storageKey || isNonDailySeed(seed) || completion) {
      return
    }

    dayStateStorage.write(seed, storageKey, state)
  }, [completion, seed, state, storageKey])

  const submitGuess = useCallback(
    (rawValue: string) => {
      if (state.solved || state.failed) {
        return
      }

      const trimmed = rawValue.trim()

      if (!trimmed) {
        dispatch({ type: 'setMessage', message: 'Enter a Pokémon name.' })
        return
      }

      const pokemon = findPokemonByName(trimmed)

      if (!pokemon) {
        dispatch({ type: 'setMessage', message: 'That Pokémon is not in the roster yet.' })
        return
      }

      if (state.guessHistory.includes(pokemon.name)) {
        dispatch({ type: 'setMessage', message: `You already guessed ${pokemon.name}.` })
        return
      }

      dispatch({ type: 'submit', pokemon, target })

      const solved = pokemon.name === target.name
      const wrongGuessCount = solved ? state.wrongGuessCount : state.wrongGuessCount + 1
      const failed = !solved && wrongGuessCount >= MAX_GUESSES

      if ((solved || failed) && !completedRef.current) {
        completedRef.current = true

        onComplete?.({
          solved,
          failed,
          attemptsUsed: solved ? state.guessHistory.length + 1 : wrongGuessCount,
          guessHistory: [...state.guessHistory, pokemon.name],
          guessedPokemon: pokemon.name,
        })
      }
    },
    [onComplete, state.failed, state.guessHistory, state.solved, state.wrongGuessCount, target],
  )

  const setGuessValue = useCallback((value: string) => {
    dispatch({ type: 'setGuessValue', value })
  }, [])

  const isComplete = state.solved || state.failed

  return {
    state,
    isComplete,
    submitGuess,
    setGuessValue,
    attemptsUsed: state.solved ? state.guessHistory.length : state.wrongGuessCount,
  }
}
