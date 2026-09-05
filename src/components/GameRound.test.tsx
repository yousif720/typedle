import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findPokemonByName, type PokemonEntry } from '../data/pokemon'
import { MAX_GUESSES } from '../lib/gameRules'
import { GameRound } from './GameRound'

const target = findPokemonByName('Chewtle') as PokemonEntry

function renderRound(overrides: Partial<React.ComponentProps<typeof GameRound>> = {}) {
  const props: React.ComponentProps<typeof GameRound> = {
    seed: '2026-09-05',
    mode: 'daily',
    target,
    storageKey: null,
    streakState: { current: 0, best: 0, lastSeed: null },
    isAuthenticated: false,
    hardMode: false,
    syncing: false,
    onComplete: vi.fn(),
    onOpenRewind: vi.fn(),
    onOpenResult: vi.fn(),
    ...overrides,
  }

  return { ...render(<GameRound {...props} />), props }
}

async function submitGuess(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = screen.getByRole('combobox')
  await user.clear(input)
  await user.type(input, name)

  // A single Enter submits, using the highlighted suggestion.
  await user.keyboard('{Enter}')
}

describe('GameRound', () => {
  // Day state is saved to localStorage, which jsdom shares across tests in a
  // file. Without this, a round saved by one test restores into the next.
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the weakness row immediately and hides the rest', () => {
    renderRound()

    // Chewtle is pure Water, so Grass and Electric are its 2x weaknesses.
    expect(screen.getByLabelText('grass, 2x')).toBeInTheDocument()
    expect(screen.getByText('Weak to')).toBeInTheDocument()

    // Every other row starts locked.
    expect(screen.getAllByText('?').length).toBeGreaterThan(0)
  })

  it('reveals the region row after one wrong guess', async () => {
    const user = userEvent.setup()
    renderRound()

    expect(screen.queryByText('Galar')).not.toBeInTheDocument()

    await submitGuess(user, 'Onix')

    expect(screen.getByText('Galar')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/region row is now revealed/i)
  })

  it('records a guess in the history with type-match feedback', async () => {
    const user = userEvent.setup()
    renderRound()

    await submitGuess(user, 'Squirtle')

    const historyItem = screen.getByText('Squirtle').closest('li')
    expect(historyItem).not.toBeNull()

    // Squirtle is Water, the same as Chewtle, so its chip should be a match.
    expect(within(historyItem as HTMLElement).getByLabelText(/1 of 1 types match/i)).toBeInTheDocument()
  })

  it('marks a guess with no shared types as a non-match', async () => {
    const user = userEvent.setup()
    renderRound()

    await submitGuess(user, 'Onix')

    const historyItem = screen.getByText('Onix').closest('li') as HTMLElement
    expect(within(historyItem).getByLabelText(/0 of 2 types match/i)).toBeInTheDocument()
  })

  it('calls onComplete exactly once when solved', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    renderRound({ onComplete })

    await submitGuess(user, 'Chewtle')

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ solved: true, attemptsUsed: 1, guessedPokemon: 'Chewtle' }),
    )
  })

  it('rejects a repeated guess without consuming an attempt', async () => {
    const user = userEvent.setup()
    renderRound()

    await submitGuess(user, 'Onix')
    expect(screen.getByText('5')).toBeInTheDocument() // guesses remaining

    await submitGuess(user, 'Onix')

    expect(screen.getByRole('status')).toHaveTextContent(/already guessed Onix/i)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('rejects an unknown Pokémon name', async () => {
    const user = userEvent.setup()
    renderRound()

    const input = screen.getByRole('combobox')
    await user.type(input, 'Notapokemon')
    await user.keyboard('{Enter}')

    expect(screen.getByRole('status')).toHaveTextContent(/not in the roster/i)
  })

  it('ends the round after the maximum number of wrong guesses', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    renderRound({ onComplete })

    const wrongGuesses = ['Onix', 'Pikachu', 'Bulbasaur', 'Charmander', 'Eevee', 'Ditto']

    for (const guess of wrongGuesses) {
      await submitGuess(user, guess)
    }

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ solved: false, failed: true, attemptsUsed: MAX_GUESSES }),
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('restores a finished round from a saved completion', () => {
    renderRound({
      completion: {
        seed: '2026-09-05',
        solved: true,
        failed: false,
        attemptsUsed: 2,
        guessedPokemon: 'Chewtle',
        targetPokemon: 'Chewtle',
        guessHistory: ['Squirtle', 'Chewtle'],
        completedAt: new Date().toISOString(),
      },
    })

    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByText('Squirtle')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Solved/i)
  })

  it('persists an in-progress round under the storage key and restores it on remount', async () => {
    const user = userEvent.setup()
    const { unmount } = renderRound({ storageKey: 'guest:abc' })

    await submitGuess(user, 'Onix')
    unmount()

    // A refresh is a fresh mount with the same storage key.
    renderRound({ storageKey: 'guest:abc' })

    expect(screen.getByText('Onix')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // guesses remaining
  })

  it('does not leak a saved round between storage keys', async () => {
    const user = userEvent.setup()
    const { unmount } = renderRound({ storageKey: 'guest:abc' })

    await submitGuess(user, 'Onix')
    unmount()

    renderRound({ storageKey: 'user:someone-else' })

    expect(screen.queryByText('Onix')).not.toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('saves nothing while the storage key is still being resolved', async () => {
    const user = userEvent.setup()
    const { unmount } = renderRound({ storageKey: null })

    await submitGuess(user, 'Onix')
    unmount()

    renderRound({ storageKey: null })

    expect(screen.queryByText('Onix')).not.toBeInTheDocument()
  })

  it('stops revealing clues past guess two in hard mode', async () => {
    const user = userEvent.setup()
    renderRound({ hardMode: true })

    await submitGuess(user, 'Onix')
    await submitGuess(user, 'Pikachu')
    expect(screen.getByText('First')).toBeInTheDocument() // evolution stage revealed

    await submitGuess(user, 'Bulbasaur')

    // The resist row would normally unlock here.
    expect(screen.getByText(/no more clues/i)).toBeInTheDocument()
  })
})
