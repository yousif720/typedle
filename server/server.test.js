import { createHash } from 'node:crypto'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Boots the real Express app against a throwaway data directory and drives it
 * over HTTP, so these exercise the actual middleware stack rather than mocks.
 */
let baseUrl
let server
let dataDir

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let json = null

  try {
    json = await response.json()
  } catch {
    // Some responses have no body.
  }

  return { status: response.status, body: json }
}

beforeAll(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), 'typedle-test-'))
  process.env.DATA_DIR = dataDir
  process.env.PORT = '0'

  // Seed a v1-era account so the legacy migration path is exercised too.
  const legacyHash = createHash('sha256').update('oldpassword123', 'utf8').digest('hex')
  await writeFile(
    path.join(dataDir, 'users.json'),
    JSON.stringify({
      users: {
        legacyuser: {
          username: 'legacyuser',
          passwordHash: legacyHash,
          createdAt: new Date().toISOString(),
          streakState: { current: 4, best: 9, lastSeed: '2026-08-01' },
          stats: {
            played: 12,
            wins: 10,
            losses: 2,
            guessDistribution: { 1: 1, 2: 2, 3: 4, 4: 2, 5: 1, 6: 0 },
            totalWinningGuesses: 30,
            recordedSeeds: [],
          },
          completions: {},
          friends: [],
          achievements: [],
          sessions: {},
        },
      },
    }),
    'utf8',
  )

  const { default: app, ready } = await import('./index.js')

  // Wait for the stores to finish loading before serving any request.
  await ready

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`
      resolve()
    })
  })
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

describe('health', () => {
  it('reports the data directory it is actually using', async () => {
    const { status, body } = await request('/api/health')

    expect(status).toBe(200)
    expect(body.ok).toBe(true)
    // Surfaced so a deploy can be checked: a reset userCount means the disk
    // isn't wired up.
    expect(body.dataDir).toBe(dataDir)
  })
})

describe('registration and validation', () => {
  it('creates an account and returns a session token', async () => {
    const { status, body } = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'alice', password: 'correcthorse1' },
    })

    expect(status).toBe(201)
    expect(body.user).toEqual({ userKey: 'alice', username: 'alice' })
    expect(body.token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('rejects a short password', async () => {
    const { status } = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'shorty', password: 'abc' },
    })

    expect(status).toBe(400)
  })

  it('rejects an invalid username', async () => {
    const { status } = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'no spaces allowed', password: 'correcthorse1' },
    })

    expect(status).toBe(400)
  })

  it('refuses a duplicate username', async () => {
    const { status } = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'alice', password: 'anotherpassword' },
    })

    expect(status).toBe(409)
  })

  it('never stores the password in readable form', async () => {
    const stored = JSON.parse(await readFile(path.join(dataDir, 'users.json'), 'utf8'))

    expect(stored.users.alice.passwordHash).not.toContain('correcthorse1')
    expect(stored.users.alice.passwordHash.startsWith('$2')).toBe(true)
  })
})

describe('login', () => {
  it('accepts the right password', async () => {
    const { status, body } = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'alice', password: 'correcthorse1' },
    })

    expect(status).toBe(200)
    expect(body.token).toBeTruthy()
  })

  it('rejects the wrong password', async () => {
    const { status } = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'alice', password: 'wrongpassword' },
    })

    expect(status).toBe(401)
  })

  it('gives the same response for an unknown user, so accounts cannot be enumerated', async () => {
    const unknown = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'ghost', password: 'wrongpassword' },
    })
    const wrongPassword = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'alice', password: 'wrongpassword' },
    })

    expect(unknown.status).toBe(wrongPassword.status)
    expect(unknown.body.error).toBe(wrongPassword.body.error)
  })
})

describe('legacy password migration', () => {
  it('lets a v1 account sign in with its original password', async () => {
    const { status, body } = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'legacyuser', password: 'oldpassword123' },
    })

    expect(status).toBe(200)
    expect(body.token).toBeTruthy()
  })

  it('silently upgrades the stored hash to bcrypt', async () => {
    const stored = JSON.parse(await readFile(path.join(dataDir, 'users.json'), 'utf8'))

    expect(stored.users.legacyuser.passwordHash.startsWith('$2')).toBe(true)
  })

  it('preserves the account streak and stats through the upgrade', async () => {
    const stored = JSON.parse(await readFile(path.join(dataDir, 'users.json'), 'utf8'))

    expect(stored.users.legacyuser.streakState).toMatchObject({ current: 4, best: 9 })
    expect(stored.users.legacyuser.stats.played).toBe(12)
  })

  it('still rejects a wrong password against a legacy account', async () => {
    const { status } = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'legacyuser', password: 'notmypassword' },
    })

    expect(status).toBe(401)
  })
})

describe('authorization on user routes', () => {
  let aliceToken
  let bobToken

  beforeAll(async () => {
    aliceToken = (
      await request('/api/auth/login', { method: 'POST', body: { username: 'alice', password: 'correcthorse1' } })
    ).body.token

    await request('/api/auth/register', { method: 'POST', body: { username: 'bob', password: 'hunter2hunter2' } })
    bobToken = (
      await request('/api/auth/login', { method: 'POST', body: { username: 'bob', password: 'hunter2hunter2' } })
    ).body.token
  })

  // These are the exact requests that succeeded against v1, where none of the
  // /users/:userKey routes checked anything at all.
  it.each([
    ['GET', '/api/auth/users/alice/progress'],
    ['GET', '/api/auth/users/alice/completions'],
    ['GET', '/api/auth/users/alice/friends'],
  ])('rejects unauthenticated %s %s', async (method, path) => {
    const { status } = await request(path, { method })
    expect(status).toBe(401)
  })

  it('rejects an unauthenticated write to another account', async () => {
    const { status } = await request('/api/auth/users/alice/progress', {
      method: 'PUT',
      body: { streakState: { current: 9999, best: 9999, lastSeed: '2026-01-01' } },
    })

    expect(status).toBe(401)
  })

  it("rejects a valid token used against someone else's account", async () => {
    const { status } = await request('/api/auth/users/alice/progress', {
      method: 'PUT',
      token: bobToken,
      body: { streakState: { current: 9999, best: 9999, lastSeed: '2026-01-01' } },
    })

    expect(status).toBe(403)
  })

  it('leaves the targeted account untouched after a failed attack', async () => {
    const { body } = await request('/api/auth/users/alice/progress', { token: aliceToken })
    expect(body.progress.streakState.current).not.toBe(9999)
  })

  it('allows the owner to read and write their own progress', async () => {
    const write = await request('/api/auth/users/alice/progress', {
      method: 'PUT',
      token: aliceToken,
      body: { streakState: { current: 3, best: 5, lastSeed: '2026-09-05' } },
    })

    expect(write.status).toBe(200)

    const read = await request('/api/auth/users/alice/progress', { token: aliceToken })
    expect(read.body.progress.streakState).toMatchObject({ current: 3, best: 5 })
  })

  it('rejects a made-up token', async () => {
    const { status } = await request('/api/auth/users/alice/progress', { token: 'a'.repeat(64) })
    expect(status).toBe(401)
  })

  it('invalidates a token after logout', async () => {
    const { body } = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'bob', password: 'hunter2hunter2' },
    })

    const token = body.token
    expect((await request('/api/auth/me', { token })).status).toBe(200)

    await request('/api/auth/logout', { method: 'POST', token })

    expect((await request('/api/auth/me', { token })).status).toBe(401)
  })
})

describe('input sanitisation', () => {
  let token

  beforeAll(async () => {
    token = (
      await request('/api/auth/login', { method: 'POST', body: { username: 'alice', password: 'correcthorse1' } })
    ).body.token
  })

  it('clamps a negative streak to zero rather than storing it', async () => {
    await request('/api/auth/users/alice/progress', {
      method: 'PUT',
      token,
      body: { streakState: { current: -50, best: -10, lastSeed: 'not-a-date' } },
    })

    const { body } = await request('/api/auth/users/alice/progress', { token })

    expect(body.progress.streakState.current).toBe(0)
    expect(body.progress.streakState.best).toBe(0)
    expect(body.progress.streakState.lastSeed).toBeNull()
  })

  it('rejects an out-of-range attempt count on a completion', async () => {
    const { status } = await request('/api/auth/users/alice/completions', {
      method: 'POST',
      token,
      body: { seed: '2026-09-05', solved: true, failed: false, attemptsUsed: 99 },
    })

    expect(status).toBe(400)
  })

  it('rejects a malformed seed', async () => {
    const { status } = await request('/api/auth/users/alice/completions', {
      method: 'POST',
      token,
      body: { seed: 'tomorrow', solved: true, failed: false, attemptsUsed: 3 },
    })

    expect(status).toBe(400)
  })

  it('treats a finished day as immutable', async () => {
    await request('/api/auth/users/alice/completions', {
      method: 'POST',
      token,
      body: {
        seed: '2026-09-04',
        solved: true,
        failed: false,
        attemptsUsed: 2,
        targetPokemon: 'Chewtle',
        guessHistory: ['Squirtle', 'Chewtle'],
      },
    })

    const second = await request('/api/auth/users/alice/completions', {
      method: 'POST',
      token,
      body: { seed: '2026-09-04', solved: false, failed: true, attemptsUsed: 6 },
    })

    expect(second.body.deduped).toBe(true)
    expect(second.body.completion.solved).toBe(true)
    expect(second.body.completion.attemptsUsed).toBe(2)
  })
})

describe('global stats', () => {
  it('requires a valid seed', async () => {
    expect((await request('/api/stats/global?seed=nope')).status).toBe(400)
  })

  it('counts an outcome once and dedupes repeats', async () => {
    const outcome = { seed: '2026-09-05', outcomeId: 'guest:test-1:2026-09-05', solved: true, attemptsUsed: 3 }

    const first = await request('/api/stats/global', { method: 'POST', body: outcome })
    expect(first.body.stats.played).toBe(1)
    expect(first.body.stats.guessDistribution['3']).toBe(1)

    const second = await request('/api/stats/global', { method: 'POST', body: outcome })
    expect(second.body.stats.played).toBe(1)
    expect(second.body.deduped).toBe(true)
  })

  it('does not lose updates under concurrent writes', async () => {
    // v1 read the whole file, mutated it and wrote it back with no
    // coordination, so simultaneous requests silently overwrote each other.
    const seed = '2026-09-06'
    const submissions = Array.from({ length: 25 }, (_, index) =>
      request('/api/stats/global', {
        method: 'POST',
        body: { seed, outcomeId: `guest:concurrent-${index}:${seed}`, solved: true, attemptsUsed: 2 },
      }),
    )

    await Promise.all(submissions)

    const { body } = await request(`/api/stats/global?seed=${seed}`)
    expect(body.stats.played).toBe(25)
  })
})

describe('leaderboard', () => {
  it('never exposes credentials or private data', async () => {
    const { status, body } = await request('/api/leaderboard/streaks')

    expect(status).toBe(200)

    const serialised = JSON.stringify(body)
    expect(serialised).not.toMatch(/passwordHash/)
    expect(serialised).not.toMatch(/sessions/)
    expect(serialised).not.toMatch(/completions/)
    expect(serialised).not.toMatch(/\$2[aby]\$/)
  })

  it('ranks by best streak', async () => {
    const { body } = await request('/api/leaderboard/streaks')
    const streaks = body.entries.map((entry) => entry.bestStreak)

    expect(streaks).toEqual([...streaks].sort((a, b) => b - a))
  })
})

describe('friends', () => {
  let token

  beforeAll(async () => {
    token = (
      await request('/api/auth/login', { method: 'POST', body: { username: 'alice', password: 'correcthorse1' } })
    ).body.token
  })

  it('adds a friend and lists them', async () => {
    expect((await request('/api/auth/users/alice/friends', { method: 'POST', token, body: { username: 'bob' } })).status).toBe(201)

    const { body } = await request('/api/auth/users/alice/friends', { token })
    expect(body.friends.map((friend) => friend.username)).toContain('bob')
  })

  it('refuses to add an unknown player', async () => {
    const { status } = await request('/api/auth/users/alice/friends', {
      method: 'POST',
      token,
      body: { username: 'nobody-here' },
    })

    expect(status).toBe(404)
  })

  it('refuses self-adds', async () => {
    const { status } = await request('/api/auth/users/alice/friends', {
      method: 'POST',
      token,
      body: { username: 'alice' },
    })

    expect(status).toBe(400)
  })

  it('removes a friend', async () => {
    await request('/api/auth/users/alice/friends/bob', { method: 'DELETE', token })

    const { body } = await request('/api/auth/users/alice/friends', { token })
    expect(body.friends).toHaveLength(0)
  })
})
