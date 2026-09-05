import type { GameMode } from '../lib/types'

type SiteFooterProps = {
  mode: GameMode
  onPractice: () => void
  onCustomize: () => void
  onCreateChallenge: () => void
  onBackToToday: () => void
  onOpenCredits: () => void
}

export function SiteFooter({
  mode,
  onPractice,
  onCustomize,
  onCreateChallenge,
  onBackToToday,
  onOpenCredits,
}: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <nav className="footer-actions" aria-label="Game modes">
        {mode === 'daily' ? (
          <>
            <button type="button" className="footer-link" onClick={onPractice}>
              Practice
            </button>
            <button type="button" className="footer-link" onClick={onCustomize}>
              Customize
            </button>
          </>
        ) : (
          <button type="button" className="footer-link is-highlight" onClick={onBackToToday}>
            ← Back to today
          </button>
        )}
        <button type="button" className="footer-link" onClick={onCreateChallenge}>
          Create-a-dle
        </button>
      </nav>

      <nav className="footer-links" aria-label="Site">
        <a href="/how-to-play.html">How to Play</a>
        <a href="/about.html">About</a>
        <a href="/privacy.html">Privacy</a>
        <button type="button" className="footer-link" onClick={onOpenCredits}>
          Credits
        </button>
      </nav>
    </footer>
  )
}
