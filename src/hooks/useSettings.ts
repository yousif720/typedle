import { useCallback, useEffect, useState } from 'react'

import { settingsStorage } from '../lib/storage'
import type { Settings } from '../lib/types'

const defaultSettings: Settings = {
  theme: 'system',
  soundEnabled: false,
  reducedMotion: false,
  highContrast: false,
  hardMode: false,
}

function applySettingsToDocument(settings: Settings) {
  const root = document.documentElement

  root.dataset.theme = settings.theme
  root.dataset.reducedMotion = String(settings.reducedMotion)
  root.dataset.highContrast = String(settings.highContrast)
}

export function useSettings() {
  // Read synchronously during initialisation so the first paint already has the
  // right theme — no flash of the wrong colours before an effect corrects it.
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = settingsStorage.read(defaultSettings)
    applySettingsToDocument(stored)
    return stored
  })

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      settingsStorage.write(next)
      applySettingsToDocument(next)
      return next
    })
  }, [])

  // Keep the document in sync if something else (e.g. another tab) changes it.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key && event.key.includes('typedle-settings')) {
        const stored = settingsStorage.read(defaultSettings)
        applySettingsToDocument(stored)
        setSettings(stored)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { settings, updateSettings }
}

export { defaultSettings }
