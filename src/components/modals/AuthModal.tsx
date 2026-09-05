import { useState, type FormEvent } from 'react'

import { Modal } from '../Modal'

type AuthModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (username: string, password: string, mode: 'login' | 'register') => Promise<void>
}

export function AuthModal({ open, onClose, onSubmit }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (busy) {
      return
    }

    setBusy(true)
    setStatus('')

    try {
      await onSubmit(username.trim(), password, mode)
      setUsername('')
      setPassword('')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-auth"
      eyebrow="Account"
      title={mode === 'login' ? 'Sign in' : 'Create an account'}
      description="An account syncs your streak, stats and completed days across devices."
      status={status}
    >
      <form className="form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="auth-username">
          Username
        </label>
        <input
          id="auth-username"
          className="field-input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="3-20 letters, numbers, . - _"
          required
        />

        <label className="field-label" htmlFor="auth-password">
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          className="field-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
          minLength={mode === 'register' ? 8 : undefined}
          required
        />

        {mode === 'register' ? (
          <p className="field-hint">
            Passwords are hashed with bcrypt on the server and never stored in readable form.
          </p>
        ) : null}

        <div className="modal-actions">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'register' : 'login'))
              setStatus('')
            }}
          >
            {mode === 'login' ? 'Need an account?' : 'Have an account?'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
