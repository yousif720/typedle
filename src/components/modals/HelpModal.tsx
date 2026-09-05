import { CLUE_SCHEDULE, MAX_GUESSES } from '../../lib/gameRules'
import { Modal } from '../Modal'

type HelpModalProps = {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal-help"
      eyebrow="How to play"
      title="Guess the Pokémon"
      description={`You get ${MAX_GUESSES} guesses. Every wrong one reveals another clue.`}
    >
      <h3 className="section-heading">Clue order</h3>
      <ol className="help-list">
        {CLUE_SCHEDULE.map((clue) => (
          <li key={clue.key}>
            <strong>{clue.label}</strong>
            <span>
              {clue.revealAfter === 0
                ? 'Visible from the start.'
                : `Unlocks after wrong guess ${clue.revealAfter}.`}
            </span>
          </li>
        ))}
      </ol>

      <h3 className="section-heading">Reading the board</h3>
      <ul className="help-list">
        <li>
          <strong>Weak to</strong>
          <span>Types that hit the answer for extra damage. 4x rows sit above 2x rows.</span>
        </li>
        <li>
          <strong>Resists</strong>
          <span>Reduced damage (1/2x, then 1/4x), with full immunities on the bottom row.</span>
        </li>
        <li>
          <strong>Your guesses</strong>
          <span>
            After each guess, its type icons light up green for any type it shares with the answer — the
            fastest way to narrow things down.
          </span>
        </li>
      </ul>

      <h3 className="section-heading">Other modes</h3>
      <ul className="help-list">
        <li>
          <strong>Practice</strong>
          <span>Unlimited random rounds. Filter by region or Mega forms. Never affects your streak.</span>
        </li>
        <li>
          <strong>Create-a-dle</strong>
          <span>Pick any Pokémon and send a friend a link that makes it their puzzle.</span>
        </li>
        <li>
          <strong>Rewind</strong>
          <span>Replay any earlier day.</span>
        </li>
      </ul>

      <h3 className="section-heading">Keyboard</h3>
      <ul className="shortcut-list">
        <li>
          <kbd>Enter</kbd> submit a guess
        </li>
        <li>
          <kbd>↑</kbd> <kbd>↓</kbd> move through suggestions
        </li>
        <li>
          <kbd>Esc</kbd> close a dialog or the suggestion list
        </li>
        <li>
          <kbd>?</kbd> open this help
        </li>
      </ul>
    </Modal>
  )
}
