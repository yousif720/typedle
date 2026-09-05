/**
 * Minimal hand-written service worker.
 *
 * Deliberately conservative about what it touches:
 *   - Only GET requests, only same-origin.
 *   - Never intercepts the API (cross-origin anyway), so game state, auth and
 *     stats always hit the network and can never be served stale.
 *   - Navigations are network-first so a deploy is picked up immediately, with
 *     the cached shell as an offline fallback.
 *   - Static assets are stale-while-revalidate: instant from cache, refreshed
 *     in the background.
 */
const VERSION = 'v2'
const SHELL_CACHE = `typedle-shell-${VERSION}`
const ASSET_CACHE = `typedle-assets-${VERSION}`

const SHELL_URLS = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // Individually so one 404 can't fail the whole install.
      .then((cache) => Promise.allSettled(SHELL_URLS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('typedle-') && key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/type-icons/') ||
    /\.(?:css|js|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          void caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(async () => (await caches.match('/index.html')) ?? Response.error()),
    )
    return
  }

  if (!isStaticAsset(url)) {
    return
  }

  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(request)

      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            void cache.put(request, response.clone())
          }

          return response
        })
        .catch(() => cached ?? Response.error())

      return cached ?? network
    }),
  )
})
