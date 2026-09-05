import { MAX_GUESSES } from './gameRules'
import type { GameMode, StreakState } from './types'

const siteUrl = 'https://www.typedle.net'

export type ShareOptions = {
  mode: GameMode
  seed: string
  solved: boolean
  guessHistory: string[]
  streakState: StreakState
}

/**
 * Wordle-style spoiler-free grid: one square per guess, green only on the
 * winning one. v1's share text literally included "Answer: {name}", which made
 * it unshareable without ruining the puzzle for whoever read it.
 */
export function buildShareGrid(guessHistory: string[], solved: boolean) {
  return guessHistory
    .map((_, index) => (solved && index === guessHistory.length - 1 ? '🟩' : '🟥'))
    .join('\n')
}

export function buildShareText({ mode, seed, solved, guessHistory, streakState }: ShareOptions) {
  const attempts = solved ? guessHistory.length : 'X'

  const header =
    mode === 'challenge'
      ? `TypeDle Challenge ${attempts}/${MAX_GUESSES}`
      : mode === 'practice'
        ? `TypeDle Practice ${attempts}/${MAX_GUESSES}`
        : `TypeDle ${seed} ${attempts}/${MAX_GUESSES}`

  const lines = [header, '', buildShareGrid(guessHistory, solved), '']

  if (mode === 'daily') {
    lines.push(`Streak: ${streakState.current} (best ${streakState.best})`)
  }

  lines.push(siteUrl)

  return lines.join('\n')
}

/**
 * Uses the native share sheet on mobile where available and falls back to the
 * clipboard everywhere else.
 */
export async function shareResult(text: string): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      // A user dismissing the share sheet is a cancel, not a failure worth
      // falling back on — anything else, try the clipboard instead.
      if (error instanceof Error && error.name === 'AbortError') {
        return 'failed'
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
