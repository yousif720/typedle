import { describe, expect, it } from 'vitest'

import { buildShareGrid, buildShareText } from './share'
import type { StreakState } from './types'

const streakState: StreakState = { current: 3, best: 7, lastSeed: '2026-09-05' }

describe('buildShareGrid', () => {
  it('marks only the winning guess green', () => {
    expect(buildShareGrid(['a', 'b', 'c'], true)).toBe('🟥\n🟥\n🟩')
  })

  it('uses all red squares on a loss', () => {
    expect(buildShareGrid(['a', 'b', 'c'], false)).toBe('🟥\n🟥\n🟥')
  })

  it('handles a first-guess win', () => {
    expect(buildShareGrid(['a'], true)).toBe('🟩')
  })
})

describe('buildShareText', () => {
  const base = {
    seed: '2026-09-05',
    guessHistory: ['Onix', 'Squirtle', 'Chewtle'],
    streakState,
  }

  it('never includes the answer', () => {
    // v1's share text literally appended "Answer: <name>", which spoiled the
    // puzzle for anyone who read a shared result.
    const text = buildShareText({ ...base, mode: 'daily', solved: true })

    expect(text).not.toContain('Chewtle')
    expect(text).not.toMatch(/answer/i)
  })

  it('shows attempts over the maximum on a win', () => {
    expect(buildShareText({ ...base, mode: 'daily', solved: true })).toContain('2026-09-05 3/6')
  })

  it('shows X on a loss', () => {
    expect(buildShareText({ ...base, mode: 'daily', solved: false })).toContain('2026-09-05 X/6')
  })

  it('labels practice and challenge rounds instead of dating them', () => {
    expect(buildShareText({ ...base, mode: 'practice', solved: true })).toContain('TypeDle Practice')
    expect(buildShareText({ ...base, mode: 'challenge', solved: true })).toContain('TypeDle Challenge')
    expect(buildShareText({ ...base, mode: 'practice', solved: true })).not.toContain('2026-09-05')
  })

  it('only advertises a streak for the daily puzzle', () => {
    expect(buildShareText({ ...base, mode: 'daily', solved: true })).toContain('Streak: 3')
    expect(buildShareText({ ...base, mode: 'practice', solved: true })).not.toContain('Streak')
  })

  it('includes the site link so shares are actionable', () => {
    expect(buildShareText({ ...base, mode: 'daily', solved: true })).toContain('typedle.net')
  })
})
