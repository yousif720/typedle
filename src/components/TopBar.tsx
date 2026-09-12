import type { UserProfile } from '../lib/types'

type TopBarProps = {
  profile: UserProfile | null
  loading: boolean
  onOpenHelp: () => void
  onOpenStats: () => void
  onOpenLeaderboard: () => void
  onOpenSettings: () => void
  onOpenAuth: () => void
  onSignOut: () => void
}

type IconButtonProps = {
  label: string
  onClick: () => void
  children: React.ReactNode
}

function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button type="button" className="icon-button" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  )
}

export function TopBar({
  profile,
  loading,
  onOpenHelp,
  onOpenStats,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenAuth,
  onSignOut,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-group">
        <IconButton label="How to play" onClick={onOpenHelp}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.2a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.7-.9 1.3v.6" />
            <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
          </svg>
        </IconButton>
      </div>

      <span aria-hidden="true" />

      <div className="topbar-group">
        <IconButton label="Leaderboard" onClick={onOpenLeaderboard}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 20h14M8 20v-6M12 20V6M16 20v-9" />
          </svg>
        </IconButton>

        <IconButton label="Statistics" onClick={onOpenStats}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19h16" />
            <rect x="6" y="10" width="3.4" height="6" rx="1" />
            <rect x="14.6" y="6" width="3.4" height="10" rx="1" />
          </svg>
        </IconButton>

        <IconButton label="Settings" onClick={onOpenSettings}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 3.5v2M12 18.5v2M4.9 7.8l1.7 1M17.4 15.2l1.7 1M4.9 16.2l1.7-1M17.4 8.8l1.7-1" />
          </svg>
        </IconButton>

        {loading ? (
          <span className="topbar-account is-loading" aria-live="polite">
            …
          </span>
        ) : profile ? (
          <button type="button" className="topbar-account" onClick={onSignOut} title={`Signed in as ${profile.username}`}>
            <span className="topbar-avatar" aria-hidden="true">
              {profile.username.charAt(0).toUpperCase()}
            </span>
            <span className="topbar-username">Sign out</span>
          </button>
        ) : (
          <button type="button" className="topbar-account" onClick={onOpenAuth}>
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
