import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

/**
 * v1 had no boundary at all, so any render-time throw produced a blank white
 * page with no way back. This at least keeps the player oriented and gives them
 * a recovery path that doesn't involve clearing site data by hand.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TypeDle crashed:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    try {
      // Corrupt persisted game state is the most likely cause of a repeatable
      // crash, so offer a targeted wipe rather than "clear everything".
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith('typedle-daystate'))
        .forEach((key) => window.localStorage.removeItem(key))
    } catch {
      // Ignore storage failures; reloading is still worth trying.
    }

    window.location.reload()
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <main className="crash-shell">
        <div className="crash-card">
          <p className="modal-eyebrow">Something broke</p>
          <h1>TypeDle hit an error</h1>
          <p className="crash-copy">
            Sorry about that. Reloading usually fixes it. If it keeps happening, resetting the saved puzzle
            state should clear it up — your account, streak and stats are stored on the server and won&apos;t
            be affected.
          </p>
          <pre className="crash-detail">{this.state.error.message}</pre>
          <div className="modal-actions">
            <button type="button" className="button button-primary" onClick={this.handleReload}>
              Reload
            </button>
            <button type="button" className="button button-secondary" onClick={this.handleReset}>
              Reset saved puzzle state
            </button>
          </div>
        </div>
      </main>
    )
  }
}
