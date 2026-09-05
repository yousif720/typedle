import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  /** Extra class for size variations. */
  className?: string
  status?: string
}

/**
 * v1's dialogs were plain divs: no focus trap, no Escape handling, no focus
 * restore, and the page behind them stayed scrollable and reachable by Tab.
 * Every dialog in the app now goes through this one component, so the
 * accessibility behaviour is consistent and only has to be right once.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  className = '',
  status,
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const focusFirstElement = useCallback(() => {
    const card = cardRef.current

    if (!card) {
      return
    }

    const focusable = card.querySelectorAll<HTMLElement>(focusableSelector)
    const first = focusable[0]

    if (first) {
      first.focus()
    } else {
      card.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null

    // Defer so the dialog content is mounted before we try to focus into it.
    const frame = requestAnimationFrame(focusFirstElement)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const card = cardRef.current

      if (!card) {
        return
      }

      const focusable = Array.from(card.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      )

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      // Wrap focus so Tab can never escape the dialog into the page behind it.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus?.()
    }
  }, [focusFirstElement, onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="modal-layer">
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={cardRef}
        className={`modal-card ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <button type="button" className="modal-close-x" onClick={onClose} aria-label="Close dialog">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {eyebrow ? <p className="modal-eyebrow">{eyebrow}</p> : null}
        <h2 className="modal-title" id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className="modal-description" id={descriptionId}>
            {description}
          </p>
        ) : null}

        <div className="modal-body">{children}</div>

        {footer ? <div className="modal-actions">{footer}</div> : null}

        <p className="modal-status" role="status" aria-live="polite">
          {status}
        </p>
      </div>
    </div>
  )
}
