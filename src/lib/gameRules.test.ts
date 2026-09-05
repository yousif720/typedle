import { describe, expect, it } from 'vitest'

import {
  CLUE_SCHEDULE,
  MAX_GUESSES,
  getGuessesLeft,
  getRevealMessage,
  getScore,
  guessDistributionBuckets,
  isClueVisible,
} from './gameRules'

describe('clue schedule', () => {
  it('reveals the weakness row immediately', () => {
    expect(isClueVisible('weakness', 0)).toBe(true)
  })

  it('keeps later clues hidden until enough wrong guesses', () => {
    expect(isClueVisible('region', 0)).toBe(false)
    expect(isClueVisible('region', 1)).toBe(true)

    expect(isClueVisible('ability', 3)).toBe(false)
    expect(isClueVisible('ability', 4)).toBe(true)
  })

  it('reveals clues in ascending order with no gaps or ties', () => {
    const thresholds = CLUE_SCHEDULE.map((clue) => clue.revealAfter)

    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b))
    expect(new Set(thresholds).size).toBe(thresholds.length)
  })

  it('never schedules a clue beyond the last guess', () => {
    for (const clue of CLUE_SCHEDULE) {
      expect(clue.revealAfter).toBeLessThan(MAX_GUESSES)
    }
  })

  it('has all clues revealed by the final guess', () => {
    for (const clue of CLUE_SCHEDULE) {
      expect(isClueVisible(clue.key, MAX_GUESSES - 1)).toBe(true)
    }
  })
})

describe('reveal messages', () => {
  it('matches the message to the clue that just unlocked', () => {
    expect(getRevealMessage(1)).toContain('region')
    expect(getRevealMessage(2)).toContain('evolution')
    expect(getRevealMessage(3)).toContain('resistance')
    expect(getRevealMessage(4)).toContain('ability')
  })

  it('falls back once every clue is out', () => {
    expect(getRevealMessage(5)).toBe('Wrong guess. No more clues left.')
  })
})

describe('scoring', () => {
  it('counts down remaining guesses', () => {
    expect(getGuessesLeft(0)).toBe(MAX_GUESSES)
    expect(getGuessesLeft(MAX_GUESSES)).toBe(0)
  })

  it('never goes negative', () => {
    expect(getGuessesLeft(MAX_GUESSES + 5)).toBe(0)
    expect(getScore(MAX_GUESSES + 5)).toBe(0)
  })

  it('exposes one distribution bucket per possible guess', () => {
    expect(guessDistributionBuckets).toEqual([1, 2, 3, 4, 5, 6])
    expect(guessDistributionBuckets).toHaveLength(MAX_GUESSES)
  })
})
