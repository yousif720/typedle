import { useCallback, useEffect, useMemo, useState } from 'react'

import './App.css'
import { GameRound } from './components/GameRound'
import { SiteFooter } from './components/SiteFooter'
import { TopBar } from './components/TopBar'
import { TypeDleLogo } from './components/TypeDleLogo'
import { AuthModal } from './components/modals/AuthModal'
import { CreateADleModal } from './components/modals/CreateADleModal'
import { CreditsModal } from './components/modals/CreditsModal'
import { CustomizerModal } from './components/modals/CustomizerModal'
import { HelpModal } from './components/modals/HelpModal'
import { LeaderboardModal } from './components/modals/LeaderboardModal'
import { ResultModal } from './components/modals/ResultModal'
import { RewindModal } from './components/modals/RewindModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { StatsModal } from './components/modals/StatsModal'
import { findPokemonByName, getDailySeed, getPokemonBySeed, type PokemonEntry } from './data/pokemon'
import { useAuth } from './hooks/useAuth'
import { useGlobalStats } from './hooks/useGlobalStats'
import { useSettings } from './hooks/useSettings'
import type { GameOutcome } from './hooks/useGameSession'
import { api } from './lib/api'
import { MAX_GUESSES } from './lib/gameRules'
import {
  CHALLENGE_QUERY_PARAM,
  createChallengeSeed,
  createDefaultPracticeFilters,
  createPracticeSeed,
  decodeChallengeName,
  getFilteredPracticePool,
  isChallengeSeed,
  isNonDailySeed,
  isPracticeSeed,
  pickRandomPokemon,
  readChallengeCodeFromLocation,
} from './lib/practice'
import { buildShareText, shareResult } from './lib/share'
import { getOrCreateGuestClientId, practiceFiltersStorage } from './lib/storage'
import { sound } from './lib/sound'
import type { GameMode, PracticeFilters, StreakState, UserStats } from './lib/types'

type ModalName =
  | 'auth'
  | 'credits'
  | 'createadle'
  | 'customizer'
  | 'help'
  | 'leaderboard'
  | 'result'
  | 'rewind'
  | 'settings'
  | 'stats'

type Session = {
  seed: string
  /** Set for practice and challenge rounds, which aren't derived from the seed. */
  overrideTarget: PokemonEntry | null
}

function getPreviousSeed(seed: string) {
  const date = new Date(`${seed}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

/**
 * A create-a-dle link is folded into the very first render rather than applied
 * by an effect afterwards, so a shared puzzle never flashes today's board first.
 */
function resolveInitialSession(todaySeed: string): Session {
  const code = readChallengeCodeFromLocation()

  if (code) {
    const name = decodeChallengeName(code)
    const pokemon = name ? findPokemonByName(name) : undefined

    if (pokemon) {
      return { seed: createChallengeSeed(), overrideTarget: pokemon }
    }
  }

  return { seed: todaySeed, overrideTarget: null }
}

export default function App() {
  const { settings, updateSettings } = useSettings()
  const auth = useAuth()

  const [todaySeed] = useState(() => getDailySeed())
  const [session, setSession] = useState<Session>(() => resolveInitialSession(todaySeed))
  const [modal, setModal] = useState<ModalName | null>(null)
  const [practiceFilters, setPracticeFilters] = useState<PracticeFilters>(() =>
    practiceFiltersStorage.read(createDefaultPracticeFilters()),
  )
  const [customizerStatus, setCustomizerStatus] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [guestClientId] = useState(() => getOrCreateGuestClientId())
  const [lastOutcome, setLastOutcome] = useState<GameOutcome | null>(null)

  const mode: GameMode = isChallengeSeed(session.seed)
    ? 'challenge'
    : isPracticeSeed(session.seed)
      ? 'practice'
      : 'daily'

  const target = useMemo(
    () => session.overrideTarget ?? getPokemonBySeed(session.seed),
    [session.overrideTarget, session.seed],
  )

  const { globalStats, submitOutcome } = useGlobalStats(session.seed)
  const completion = mode === 'daily' ? auth.completions[session.seed] : undefined

  // Who the saved day state belongs to. `null` while a stored session is being
  // restored, so the round does not briefly initialise from the guest's saved
  // progress before the account's own progress arrives.
  const storageKey = auth.loading ? null : (auth.profile ? auth.profile.userKey : `guest:${guestClientId}`)

  // Remounting on any of these is what makes restore work: on first paint the
  // account's completions have not arrived yet, so a round keyed only by seed
  // would initialise empty and never pick up the finished game.
  const roundKey = `${session.seed}|${storageKey ?? 'restoring'}|${completion?.completedAt ?? ''}`

  // Strip the challenge parameter once so refreshing or re-sharing the URL from
  // the address bar doesn't carry the answer along with it.
  useEffect(() => {
    if (!readChallengeCodeFromLocation()) {
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.delete(CHALLENGE_QUERY_PARAM)
    window.history.replaceState(null, '', url.toString())
  }, [])

  useEffect(() => {
    practiceFiltersStorage.write(practiceFilters)
  }, [practiceFilters])

  // "?" opens help, matching the convention in other daily puzzle games.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'

      if (!typing && event.key === '?') {
        setModal('help')
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  const startPracticeRound = useCallback(
    (filters?: PracticeFilters) => {
      const active = filters ?? practiceFilters
      const candidates = getFilteredPracticePool(active)
      const chosen = pickRandomPokemon(candidates)

      if (!chosen) {
        setCustomizerStatus('No Pokémon match those filters. Widen the selection to start a round.')
        setModal('customizer')
        return
      }

      setCustomizerStatus('')
      setLastOutcome(null)
      setSession({ seed: createPracticeSeed(), overrideTarget: chosen })
      setModal(null)
    },
    [practiceFilters],
  )

  const goToDay = useCallback((seed: string) => {
    setLastOutcome(null)
    setSession({ seed, overrideTarget: null })
    setModal(null)
  }, [])

  /**
   * Everything that has to happen when a round ends, in one place. v1 spread
   * this across four separate effects that each watched `solved`/`failed` and
   * raced each other to write.
   */
  const handleComplete = useCallback(
    async (outcome: GameOutcome) => {
      setLastOutcome(outcome)
      setShareStatus('')
      setModal('result')

      if (settings.soundEnabled) {
        if (outcome.solved) {
          sound.correct()
        } else {
          sound.lose()
        }
      }

      // Practice and challenge rounds are deliberately invisible to every
      // persistence path: no streak, no stats, no completions, no global stats.
      if (isNonDailySeed(session.seed)) {
        return
      }

      const outcomeScope = auth.profile ? `user:${auth.profile.userKey}` : `guest:${guestClientId}`

      void submitOutcome({
        seed: session.seed,
        outcomeId: `${outcomeScope}:${session.seed}`,
        solved: outcome.solved,
        attemptsUsed: Math.max(1, Math.min(MAX_GUESSES, outcome.attemptsUsed)),
      })

      if (!auth.profile) {
        return
      }

      const userKey = auth.profile.userKey
      const isToday = session.seed === todaySeed

      const nextStreak: StreakState = !isToday
        ? auth.progress.streakState
        : outcome.solved
          ? (() => {
              const previous = getPreviousSeed(session.seed)
              const current =
                auth.progress.streakState.lastSeed === previous ? auth.progress.streakState.current + 1 : 1

              return {
                current,
                best: Math.max(auth.progress.streakState.best, current),
                lastSeed: session.seed,
              }
            })()
          : { current: 0, best: auth.progress.streakState.best, lastSeed: session.seed }

      const alreadyRecorded = auth.progress.stats.recordedSeeds.includes(session.seed)
      const attempts = Math.max(1, Math.min(MAX_GUESSES, outcome.attemptsUsed))

      const nextStats: UserStats = alreadyRecorded
        ? auth.progress.stats
        : {
            ...auth.progress.stats,
            played: auth.progress.stats.played + 1,
            wins: auth.progress.stats.wins + (outcome.solved ? 1 : 0),
            losses: auth.progress.stats.losses + (outcome.solved ? 0 : 1),
            totalWinningGuesses: auth.progress.stats.totalWinningGuesses + (outcome.solved ? attempts : 0),
            recordedSeeds: [...auth.progress.stats.recordedSeeds, session.seed],
            guessDistribution: {
              ...auth.progress.stats.guessDistribution,
              [attempts]: (auth.progress.stats.guessDistribution[attempts] ?? 0) + (outcome.solved ? 1 : 0),
            },
          }

      auth.applyProgress({ streakState: nextStreak, stats: nextStats })

      try {
        await api.saveProgress(userKey, { streakState: nextStreak, stats: nextStats })

        const saved = await api.saveCompletion(userKey, {
          seed: session.seed,
          solved: outcome.solved,
          failed: outcome.failed,
          attemptsUsed: attempts,
          guessedPokemon: outcome.guessedPokemon,
          targetPokemon: target.name,
          guessHistory: outcome.guessHistory,
          completedAt: new Date().toISOString(),
        })

        auth.applyCompletion(session.seed, saved)
      } catch {
        // The round is already over and shown locally; a failed sync shouldn't
        // interrupt the player. It reconciles on next load.
      }
    },
    [auth, guestClientId, session.seed, settings.soundEnabled, submitOutcome, target.name, todaySeed],
  )

  const handleShare = useCallback(async () => {
    if (!lastOutcome && !completion) {
      return
    }

    const solved = lastOutcome?.solved ?? completion?.solved ?? false
    const history = lastOutcome?.guessHistory ?? completion?.guessHistory ?? []

    const result = await shareResult(
      buildShareText({
        mode,
        seed: session.seed,
        solved,
        guessHistory: history,
        streakState: auth.progress.streakState,
      }),
    )

    setShareStatus(
      result === 'shared' ? 'Shared.' : result === 'copied' ? 'Copied to your clipboard.' : 'Could not share.',
    )
  }, [auth.progress.streakState, completion, lastOutcome, mode, session.seed])

  const resultSolved = lastOutcome?.solved ?? completion?.solved ?? false
  const resultHistory = lastOutcome?.guessHistory ?? completion?.guessHistory ?? []
  const resultWrongCount = resultSolved ? Math.max(0, resultHistory.length - 1) : resultHistory.length

  return (
    <div className="app-shell">
      <TopBar
        profile={auth.profile}
        loading={auth.loading}
        onOpenHelp={() => setModal('help')}
        onOpenStats={() => setModal('stats')}
        onOpenLeaderboard={() => setModal('leaderboard')}
        onOpenSettings={() => setModal('settings')}
        onOpenAuth={() => setModal('auth')}
        onSignOut={() => void auth.signOut()}
      />

      <main className="app-main">
        <div className="brand">
          <span className="edition-label">The daily Pokémon puzzle</span>
          <h1 className="sr-only">TypeDle</h1>
          <TypeDleLogo />
          <p className="tagline">
            {mode === 'challenge'
              ? 'A friend picked this one for you.'
              : mode === 'practice'
                ? 'Practice round — nothing counts towards your streak.'
                : 'Guess the Pokémon one clue at a time.'}
          </p>
        </div>

        <GameRound
          key={roundKey}
          seed={session.seed}
          mode={mode}
          target={target}
          storageKey={storageKey}
          completion={completion}
          streakState={auth.progress.streakState}
          isAuthenticated={Boolean(auth.profile)}
          hardMode={settings.hardMode}
          syncing={auth.loading}
          onComplete={handleComplete}
          onOpenRewind={() => setModal('rewind')}
          onOpenResult={() => setModal('result')}
        />

        <SiteFooter
          mode={mode}
          onPractice={() => startPracticeRound()}
          onCustomize={() => setModal('customizer')}
          onCreateChallenge={() => setModal('createadle')}
          onBackToToday={() => goToDay(todaySeed)}
          onOpenCredits={() => setModal('credits')}
        />
      </main>

      <ResultModal
        open={modal === 'result'}
        onClose={closeModal}
        mode={mode}
        target={target}
        solved={resultSolved}
        guessHistory={resultHistory}
        wrongGuessCount={resultWrongCount}
        globalStats={globalStats}
        onShare={() => void handleShare()}
        onPractice={() => startPracticeRound()}
        onCustomize={() => setModal('customizer')}
        shareStatus={shareStatus}
      />

      <HelpModal open={modal === 'help'} onClose={closeModal} />
      <CreditsModal open={modal === 'credits'} onClose={closeModal} />

      <SettingsModal open={modal === 'settings'} onClose={closeModal} settings={settings} onChange={updateSettings} />

      <StatsModal
        open={modal === 'stats'}
        onClose={closeModal}
        stats={auth.progress.stats}
        streakState={auth.progress.streakState}
        completions={auth.completions}
        isAuthenticated={Boolean(auth.profile)}
        onRequestSignIn={() => setModal('auth')}
      />

      <LeaderboardModal
        open={modal === 'leaderboard'}
        onClose={closeModal}
        profile={auth.profile}
        onRequestSignIn={() => setModal('auth')}
      />

      <AuthModal
        open={modal === 'auth'}
        onClose={closeModal}
        onSubmit={async (username, password, authMode) => {
          await auth.signIn(username, password, authMode)
          setModal(null)
        }}
      />

      <CustomizerModal
        open={modal === 'customizer'}
        onClose={closeModal}
        filters={practiceFilters}
        onChange={(next) => {
          setPracticeFilters(next)
          setCustomizerStatus('')
        }}
        onStart={() => startPracticeRound()}
        status={customizerStatus}
      />

      <CreateADleModal open={modal === 'createadle'} onClose={closeModal} />

      <RewindModal
        open={modal === 'rewind'}
        onClose={closeModal}
        todaySeed={todaySeed}
        currentSeed={mode === 'daily' ? session.seed : todaySeed}
        completions={auth.completions}
        onLoadDay={goToDay}
      />
    </div>
  )
}
