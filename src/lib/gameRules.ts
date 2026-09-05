export const MAX_GUESSES = 6

export type ClueKey = 'weakness' | 'region' | 'evolution' | 'resistance' | 'ability'

export type ClueDefinition = {
  key: ClueKey
  label: string
  /** Number of wrong guesses required before this row is revealed. */
  revealAfter: number
  /** Message shown the moment this row unlocks. */
  revealMessage: string
}

/**
 * v1 spread these thresholds across a set of hardcoded `wrongGuessCount >= n`
 * booleans and a parallel chain of if-statements for the status message, which
 * had to be kept in sync by hand. Expressing the schedule once as data means
 * the board, the reveal messages and the how-to-play copy can never drift apart.
 */
export const CLUE_SCHEDULE: ClueDefinition[] = [
  {
    key: 'weakness',
    label: 'Weak to',
    revealAfter: 0,
    revealMessage: '',
  },
  {
    key: 'region',
    label: 'Region',
    revealAfter: 1,
    revealMessage: 'Wrong guess. The region row is now revealed.',
  },
  {
    key: 'evolution',
    label: 'Evolution stage',
    revealAfter: 2,
    revealMessage: 'Wrong guess. The evolution stage row is now revealed.',
  },
  {
    key: 'resistance',
    label: 'Resists',
    revealAfter: 3,
    revealMessage: 'Wrong guess. The resistance and immunity rows are now revealed.',
  },
  {
    key: 'ability',
    label: 'Ability',
    revealAfter: 4,
    revealMessage: 'Wrong guess. The ability is now revealed.',
  },
]

export function isClueVisible(key: ClueKey, wrongGuessCount: number) {
  const clue = CLUE_SCHEDULE.find((entry) => entry.key === key)
  return clue ? wrongGuessCount >= clue.revealAfter : false
}

export function getRevealMessage(wrongGuessCount: number) {
  const unlocked = CLUE_SCHEDULE.find((clue) => clue.revealAfter === wrongGuessCount)

  if (unlocked?.revealMessage) {
    return unlocked.revealMessage
  }

  return 'Wrong guess. No more clues left.'
}

export function getGuessesLeft(wrongGuessCount: number) {
  return Math.max(0, MAX_GUESSES - wrongGuessCount)
}

export function getScore(wrongGuessCount: number) {
  return Math.max(0, MAX_GUESSES - wrongGuessCount)
}

export const guessDistributionBuckets = Array.from({ length: MAX_GUESSES }, (_, index) => index + 1)
