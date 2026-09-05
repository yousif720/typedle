/**
 * Tiny WebAudio blips. Deliberately synthesised rather than shipped as audio
 * files: no extra network requests, no licensing question, a few hundred bytes.
 * Off by default and gated behind a setting.
 */
let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!context) {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioCtor) {
      return null
    }

    try {
      context = new AudioCtor()
    } catch {
      return null
    }
  }

  return context
}

function tone(frequency: number, durationMs: number, startOffsetMs = 0, gainValue = 0.05) {
  const ctx = getContext()

  if (!ctx) {
    return
  }

  // Browsers suspend the context until a user gesture; a guess is a gesture.
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const startTime = ctx.currentTime + startOffsetMs / 1000
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationMs / 1000)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + durationMs / 1000 + 0.02)
}

export const sound = {
  correct() {
    tone(523.25, 120)
    tone(659.25, 120, 90)
    tone(783.99, 220, 180)
  },
  wrong() {
    tone(196, 160, 0, 0.04)
  },
  lose() {
    tone(261.63, 180, 0, 0.04)
    tone(196, 320, 150, 0.04)
  },
}
