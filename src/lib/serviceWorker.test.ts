import { describe, expect, it, vi } from 'vitest'

// Pulled in through Vite's ?raw so this stays a browser-target module with no
// Node imports, matching the rest of `src`.
import source from '../../public/service-worker.js?raw'

/**
 * `public/service-worker.js` is shipped verbatim and never imported by the app,
 * so nothing else in the suite would catch a mistake in it. It is plain
 * script-scope JS, so evaluating it through a Function wrapper with injected
 * globals is the closest thing to how a browser runs it.
 */
const ORIGIN = 'https://www.typedle.net'

type FakeRequest = { url: string; method: string; mode: string }
type FakeCache = {
  entries: Map<string, Response>
  match: (request: FakeRequest | string) => Promise<Response | undefined>
  put: (request: FakeRequest | string, response: Response) => Promise<void>
  add: (url: string) => Promise<void>
}

function keyOf(request: FakeRequest | string) {
  return typeof request === 'string' ? new URL(request, ORIGIN).toString() : request.url
}

/** Enough of the CacheStorage API for this worker, backed by plain Maps. */
function createCacheStorage() {
  const caches = new Map<string, Map<string, Response>>()

  function openCache(name: string): FakeCache {
    if (!caches.has(name)) {
      caches.set(name, new Map())
    }

    const entries = caches.get(name) as Map<string, Response>

    return {
      entries,
      match: async (request) => entries.get(keyOf(request)),
      put: async (request, response) => void entries.set(keyOf(request), response),
      add: async (url) => {
        const response = await globalThis.fetch(new URL(url, ORIGIN).toString())

        if (!response.ok) {
          throw new Error(`add failed: ${url}`)
        }

        entries.set(keyOf(url), response)
      },
    }
  }

  return {
    raw: caches,
    open: async (name: string) => openCache(name),
    keys: async () => [...caches.keys()],
    delete: async (name: string) => caches.delete(name),
    match: async (request: FakeRequest | string) => {
      for (const entries of caches.values()) {
        const hit = entries.get(keyOf(request))

        if (hit) {
          return hit
        }
      }

      return undefined
    },
  }
}

type WorkerEvent = { request?: FakeRequest }

function loadWorker(fetch: typeof globalThis.fetch) {
  const listeners = new Map<string, (event: unknown) => void>()
  const caches = createCacheStorage()

  const self = {
    location: { origin: ORIGIN },
    skipWaiting: vi.fn(async () => {}),
    clients: { claim: vi.fn(async () => {}) },
    addEventListener: (type: string, handler: (event: unknown) => void) => listeners.set(type, handler),
  }

  globalThis.fetch = fetch

  const evaluate = new Function('self', 'caches', 'fetch', source)
  evaluate(self, caches, fetch)

  async function dispatch(type: string, event: WorkerEvent) {
    const waits: Promise<unknown>[] = []
    const responses: Promise<Response>[] = []

    listeners.get(type)?.({
      ...event,
      waitUntil: (promise: Promise<unknown>) => waits.push(promise),
      respondWith: (promise: Promise<Response>) => responses.push(promise),
    })

    await Promise.all(waits)

    return { responded: responses.length > 0, response: await responses[0] }
  }

  return { self, caches, dispatch }
}

function request(path: string, { method = 'GET', mode = 'no-cors' } = {}): FakeRequest {
  return { url: new URL(path, ORIGIN).toString(), method, mode }
}

function ok(body: string) {
  return new Response(body, { status: 200 })
}

describe('service worker', () => {
  it('precaches the shell on install and takes over immediately', async () => {
    const { self, caches, dispatch } = loadWorker(vi.fn(async () => ok('shell')))

    await dispatch('install', {})

    const shell = await caches.open('typedle-shell-v2')
    expect([...shell.entries.keys()]).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/index.html`,
      `${ORIGIN}/favicon.svg`,
      `${ORIGIN}/manifest.webmanifest`,
    ])
    expect(self.skipWaiting).toHaveBeenCalled()
  })

  it('still installs when part of the shell is missing', async () => {
    const fetch = vi.fn(async (url: RequestInfo | URL) =>
      String(url).endsWith('/favicon.svg') ? new Response('', { status: 404 }) : ok('shell'),
    )
    const { self, caches, dispatch } = loadWorker(fetch as unknown as typeof globalThis.fetch)

    // A rejected cache.add must not reject the whole install.
    await expect(dispatch('install', {})).resolves.toBeDefined()

    const shell = await caches.open('typedle-shell-v2')
    expect([...shell.entries.keys()]).not.toContain(`${ORIGIN}/favicon.svg`)
    expect(self.skipWaiting).toHaveBeenCalled()
  })

  it('deletes caches from older versions on activate but keeps its own', async () => {
    const { self, caches, dispatch } = loadWorker(vi.fn(async () => ok('shell')))

    await caches.open('typedle-shell-v1')
    await caches.open('typedle-assets-v2')
    await caches.open('typedle-shell-v2')
    await caches.open('someone-elses-cache')

    await dispatch('activate', {})

    expect([...caches.raw.keys()].sort()).toEqual([
      'someone-elses-cache',
      'typedle-assets-v2',
      'typedle-shell-v2',
    ])
    expect(self.clients.claim).toHaveBeenCalled()
  })

  it('ignores non-GET requests so a POST is never cached or replayed', async () => {
    const { dispatch } = loadWorker(vi.fn(async () => ok('x')))

    const result = await dispatch('fetch', {
      request: request('/api/stats/global', { method: 'POST' }),
    })

    expect(result.responded).toBe(false)
  })

  it('ignores cross-origin requests, including the API', async () => {
    const { dispatch } = loadWorker(vi.fn(async () => ok('x')))

    const result = await dispatch('fetch', {
      request: { url: 'https://typedle.onrender.com/api/stats/global', method: 'GET', mode: 'cors' },
    })

    expect(result.responded).toBe(false)
  })

  it('ignores same-origin requests that are neither navigations nor static assets', async () => {
    const { dispatch } = loadWorker(vi.fn(async () => ok('x')))

    const result = await dispatch('fetch', { request: request('/some/data') })

    expect(result.responded).toBe(false)
  })

  it('serves navigations from the network and refreshes the cached shell', async () => {
    const { caches, dispatch } = loadWorker(vi.fn(async () => ok('fresh page')))

    const result = await dispatch('fetch', { request: request('/', { mode: 'navigate' }) })

    expect(await result.response.text()).toBe('fresh page')

    const shell = await caches.open('typedle-shell-v2')
    expect(await (await shell.match('/index.html'))?.text()).toBe('fresh page')
  })

  it('falls back to the cached shell when a navigation fails offline', async () => {
    const { caches, dispatch } = loadWorker(
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    const shell = await caches.open('typedle-shell-v2')
    await shell.put('/index.html', ok('cached page'))

    const result = await dispatch('fetch', { request: request('/', { mode: 'navigate' }) })

    expect(await result.response.text()).toBe('cached page')
  })

  it('serves a cached asset immediately and revalidates in the background', async () => {
    const { caches, dispatch } = loadWorker(vi.fn(async () => ok('new asset')))

    const assets = await caches.open('typedle-assets-v2')
    await assets.put(request('/assets/index-abc.js'), ok('old asset'))

    const result = await dispatch('fetch', { request: request('/assets/index-abc.js') })

    // Instant from cache…
    expect(await result.response.text()).toBe('old asset')

    // …while the network copy replaces it for next time.
    await vi.waitFor(async () =>
      expect(await (await assets.match(request('/assets/index-abc.js')))?.text()).toBe('new asset'),
    )
  })

  it('caches an uncached asset on first fetch', async () => {
    const { caches, dispatch } = loadWorker(vi.fn(async () => ok('icon bytes')))

    const result = await dispatch('fetch', { request: request('/type-icons/Grass_icon_SV.png') })

    expect(await result.response.text()).toBe('icon bytes')

    const assets = await caches.open('typedle-assets-v2')
    expect(await assets.match(request('/type-icons/Grass_icon_SV.png'))).toBeDefined()
  })

  it('does not cache a failed asset response', async () => {
    const { caches, dispatch } = loadWorker(vi.fn(async () => new Response('nope', { status: 500 })))

    const result = await dispatch('fetch', { request: request('/assets/missing.css') })

    expect(result.response.status).toBe(500)

    const assets = await caches.open('typedle-assets-v2')
    expect(await assets.match(request('/assets/missing.css'))).toBeUndefined()
  })
})
