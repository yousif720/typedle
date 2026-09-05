/**
 * Registered only in production builds: a service worker sitting in front of
 * Vite's dev server interferes with HMR and serves stale modules.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`).catch((error) => {
      // Registration failing shouldn't break the game — it just means no
      // offline support for this visit.
      console.warn('Service worker registration failed:', error)
    })
  })
}
