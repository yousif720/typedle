import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { api } from '../../lib/api'
import type { LeaderboardEntry, UserProfile } from '../../lib/types'
import { Modal } from '../Modal'

type LeaderboardModalProps = {
  open: boolean
  onClose: () => void
  profile: UserProfile | null
  onRequestSignIn: () => void
}

type Tab = 'global' | 'friends'

function LeaderboardTable({
  entries,
  currentUserKey,
  emptyMessage,
  onRemove,
}: {
  entries: LeaderboardEntry[]
  currentUserKey?: string
  emptyMessage: string
  onRemove?: (entry: LeaderboardEntry) => void
}) {
  if (entries.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <ol className="leaderboard-list">
      {entries.map((entry, index) => (
        <li key={entry.userKey} className={`leaderboard-row${entry.userKey === currentUserKey ? ' is-you' : ''}`}>
          <span className="leaderboard-rank">{entry.rank ?? index + 1}</span>
          <span className="leaderboard-name">
            {entry.username}
            {entry.userKey === currentUserKey ? <span className="leaderboard-you">you</span> : null}
          </span>
          <span className="leaderboard-stat" title="Best streak">
            <strong>{entry.bestStreak}</strong> best
          </span>
          <span className="leaderboard-stat" title="Current streak">
            {entry.currentStreak} now
          </span>
          {onRemove ? (
            <button
              type="button"
              className="leaderboard-remove"
              onClick={() => onRemove(entry)}
              aria-label={`Remove ${entry.username} from your friends`}
            >
              ×
            </button>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

/**
 * Split out so the parent can mount it only while the dialog is open. That
 * makes "fetch on open" a mount effect rather than something that has to reset
 * state when an `open` prop flips, and it means the data is always fresh
 * instead of showing whatever was loaded the last time the dialog was used.
 */
function LeaderboardContent({
  profile,
  onRequestSignIn,
  onStatus,
}: {
  profile: UserProfile | null
  onRequestSignIn: () => void
  onStatus: (message: string) => void
}) {
  const [tab, setTab] = useState<Tab>('global')
  // null means "still loading" — avoids a separate boolean that would have to
  // be set synchronously inside the effect.
  const [global, setGlobal] = useState<LeaderboardEntry[] | null>(null)
  const [friends, setFriends] = useState<LeaderboardEntry[] | null>(null)
  const [friendName, setFriendName] = useState('')

  const loadFriends = useCallback(async () => {
    if (!profile) {
      return
    }

    try {
      setFriends(await api.getFriends(profile.userKey))
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'Could not load friends.')
    }
  }, [onStatus, profile])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const entries = await api.getLeaderboard(25, controller.signal)

        if (!controller.signal.aborted) {
          setGlobal(entries)
        }
      } catch {
        if (!controller.signal.aborted) {
          setGlobal([])
          onStatus('Could not load the leaderboard.')
        }
      }

      if (profile && !controller.signal.aborted) {
        await loadFriends()
      }
    }

    void load()

    return () => controller.abort()
  }, [loadFriends, onStatus, profile])

  async function handleAddFriend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = friendName.trim()

    if (!profile || !trimmed) {
      return
    }

    try {
      await api.addFriend(profile.userKey, trimmed)
      setFriendName('')
      onStatus(`Added ${trimmed}.`)
      await loadFriends()
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'Could not add that player.')
    }
  }

  async function handleRemoveFriend(entry: LeaderboardEntry) {
    if (!profile) {
      return
    }

    try {
      await api.removeFriend(profile.userKey, entry.userKey)
      await loadFriends()
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'Could not remove that player.')
    }
  }

  return (
    <>
      <div className="tab-bar" role="tablist" aria-label="Leaderboard scope">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'global'}
          className={`tab${tab === 'global' ? ' is-active' : ''}`}
          onClick={() => setTab('global')}
        >
          Global
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'friends'}
          className={`tab${tab === 'friends' ? ' is-active' : ''}`}
          onClick={() => setTab('friends')}
        >
          Friends
        </button>
      </div>

      {tab === 'global' ? (
        global === null ? (
          <p className="empty-state">Loading…</p>
        ) : (
          <LeaderboardTable
            entries={global}
            currentUserKey={profile?.userKey}
            emptyMessage="No one has finished a puzzle yet. Be the first."
          />
        )
      ) : profile ? (
        <>
          <form className="inline-form" onSubmit={handleAddFriend}>
            <label className="sr-only" htmlFor="friend-name">
              Add a friend by username
            </label>
            <input
              id="friend-name"
              className="field-input"
              value={friendName}
              onChange={(event) => setFriendName(event.target.value)}
              placeholder="Add by username"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="button button-secondary">
              Add
            </button>
          </form>

          {friends === null ? (
            <p className="empty-state">Loading…</p>
          ) : (
            <LeaderboardTable
              entries={friends}
              currentUserKey={profile.userKey}
              emptyMessage="No friends yet. Add someone by their username above."
              onRemove={handleRemoveFriend}
            />
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>Sign in to add friends and compare streaks.</p>
          <button type="button" className="button button-primary" onClick={onRequestSignIn}>
            Sign in
          </button>
        </div>
      )}
    </>
  )
}

export function LeaderboardModal({ open, onClose, profile, onRequestSignIn }: LeaderboardModalProps) {
  const [status, setStatus] = useState('')
  const handleStatus = useCallback((message: string) => setStatus(message), [])

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-leaderboard"
      eyebrow="Leaderboard"
      title="Longest streaks"
      description="Ranked by best streak. Only players who have finished at least one puzzle appear."
      status={status}
    >
      {open ? (
        <LeaderboardContent profile={profile} onRequestSignIn={onRequestSignIn} onStatus={handleStatus} />
      ) : null}
    </Modal>
  )
}
