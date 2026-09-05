import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Modal } from './Modal'

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn()

  const utils = render(
    <>
      <button type="button">outside button</button>
      <Modal open onClose={onClose} title="Test dialog" {...props}>
        <button type="button">first</button>
        <button type="button">second</button>
      </Modal>
    </>,
  )

  return { ...utils, onClose }
}

describe('Modal accessibility', () => {
  it('exposes proper dialog semantics', () => {
    renderModal({ description: 'Some description' })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Test dialog')
    expect(dialog).toHaveAccessibleDescription('Some description')
  })

  it('moves focus into the dialog when it opens', async () => {
    renderModal()

    // The close button is the first focusable element in the card.
    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
    })
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const { onClose, container } = renderModal()

    const backdrop = container.querySelector('.modal-backdrop') as HTMLElement
    await user.click(backdrop)

    expect(onClose).toHaveBeenCalled()
  })

  it('traps Tab inside the dialog', async () => {
    const user = userEvent.setup()
    renderModal()

    const outside = screen.getByRole('button', { name: 'outside button' })
    const dialog = screen.getByRole('dialog')

    // Tab through more elements than the dialog contains; focus must never
    // escape to the page behind it.
    for (let i = 0; i < 8; i += 1) {
      await user.tab()
      expect(document.activeElement).not.toBe(outside)
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('wraps backwards with Shift+Tab', async () => {
    const user = userEvent.setup()
    renderModal()

    const outside = screen.getByRole('button', { name: 'outside button' })
    const dialog = screen.getByRole('dialog')

    for (let i = 0; i < 5; i += 1) {
      await user.tab({ shift: true })
      expect(document.activeElement).not.toBe(outside)
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('restores focus to the previously focused element on close', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    function Harness() {
      const [open, setOpen] = React.useState(false)

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            open dialog
          </button>
          <Modal
            open={open}
            onClose={() => {
              setOpen(false)
              onClose()
            }}
            title="Test dialog"
          >
            <button type="button">inside</button>
          </Modal>
        </>
      )
    }

    render(<Harness />)

    const trigger = screen.getByRole('button', { name: 'open dialog' })
    await user.click(trigger)
    await user.keyboard('{Escape}')

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })

  it('locks background scrolling while open and restores it after', () => {
    const { unmount } = renderModal()

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden dialog">
        content
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

