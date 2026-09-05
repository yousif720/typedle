import type { Settings, ThemePreference } from '../../lib/types'
import { Modal } from '../Modal'

type SettingsModalProps = {
  open: boolean
  onClose: () => void
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

const themeOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="setting-row">
      <label className="setting-text" htmlFor={id}>
        <span className="setting-label">{label}</span>
        <span className="setting-description">{description}</span>
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        className={`switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  )
}

export function SettingsModal({ open, onClose, settings, onChange }: SettingsModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="modal-settings" eyebrow="Preferences" title="Settings">
      <div className="setting-row">
        <span className="setting-text">
          <span className="setting-label">Theme</span>
          <span className="setting-description">Follow your device or lock it in.</span>
        </span>
        <div className="chip-grid chip-grid-compact">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`chip${settings.theme === option.value ? ' is-active' : ''}`}
              aria-pressed={settings.theme === option.value}
              onClick={() => onChange({ theme: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        id="setting-hard-mode"
        label="Hard mode"
        description="Clues stop revealing after your second wrong guess."
        checked={settings.hardMode}
        onChange={(value) => onChange({ hardMode: value })}
      />

      <Toggle
        id="setting-high-contrast"
        label="High contrast"
        description="Stronger borders and text contrast throughout."
        checked={settings.highContrast}
        onChange={(value) => onChange({ highContrast: value })}
      />

      <Toggle
        id="setting-reduced-motion"
        label="Reduce motion"
        description="Turn off tile flips and other animations."
        checked={settings.reducedMotion}
        onChange={(value) => onChange({ reducedMotion: value })}
      />

      <Toggle
        id="setting-sound"
        label="Sound effects"
        description="Short tones on a correct or incorrect guess."
        checked={settings.soundEnabled}
        onChange={(value) => onChange({ soundEnabled: value })}
      />
    </Modal>
  )
}
