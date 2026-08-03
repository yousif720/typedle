import cors from 'cors'
import express from 'express'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const statsFilePath = path.join(dataDir, 'global-stats.json')
const usersFilePath = path.join(dataDir, 'users.json')
const seedPattern = /^\d{4}-\d{2}-\d{2}$/

function createEmptyStats() {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    guessDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    totalWinningGuesses: 0,
    recordedSeeds: [],
  }
}

function createEmptyStatsStore() {
  return {
    byDay: {},
  }
}

function createEmptyUsersStore() {
  return {
    users: {},
  }
}

function sanitizeStats(rawStats) {
  const baseStats = createEmptyStats()
  const stats = rawStats && typeof rawStats === 'object' ? rawStats : {}

  return {
    played: Number.isFinite(stats.played) ? Math.max(0, stats.played) : baseStats.played,
    wins: Number.isFinite(stats.wins) ? Math.max(0, stats.wins) : baseStats.wins,
    losses: Number.isFinite(stats.losses) ? Math.max(0, stats.losses) : baseStats.losses,
    guessDistribution: {
      1: Number.isFinite(stats.guessDistribution?.[1]) ? Math.max(0, stats.guessDistribution[1]) : 0,
      2: Number.isFinite(stats.guessDistribution?.[2]) ? Math.max(0, stats.guessDistribution[2]) : 0,
      3: Number.isFinite(stats.guessDistribution?.[3]) ? Math.max(0, stats.guessDistribution[3]) : 0,
      4: Number.isFinite(stats.guessDistribution?.[4]) ? Math.max(0, stats.guessDistribution[4]) : 0,
      5: Number.isFinite(stats.guessDistribution?.[5]) ? Math.max(0, stats.guessDistribution[5]) : 0,
      6: Number.isFinite(stats.guessDistribution?.[6]) ? Math.max(0, stats.guessDistribution[6]) : 0,
    },
    totalWinningGuesses: Number.isFinite(stats.totalWinningGuesses)
      ? Math.max(0, stats.totalWinningGuesses)
      : baseStats.totalWinningGuesses,
    recordedSeeds: Array.isArray(stats.recordedSeeds)
      ? stats.recordedSeeds.filter((entry) => typeof entry === 'string')
      : [],
  }
}

function sanitizeStatsStore(rawStore) {
  const store = rawStore && typeof rawStore === 'object' ? rawStore : {}
  const byDay = store.byDay && typeof store.byDay === 'object' ? store.byDay : {}
  const safeStore = createEmptyStatsStore()

  for (const [seed, rawStats] of Object.entries(byDay)) {
    if (typeof seed === 'string' && seedPattern.test(seed)) {
      safeStore.byDay[seed] = sanitizeStats(rawStats)
    }
  }

  // Backward compatibility for old single-object stats format.
  if (Object.keys(safeStore.byDay).length === 0 && Number.isFinite(store.played)) {
    safeStore.byDay.legacy = sanitizeStats(store)
  }

  return safeStore
}

function sanitizeUsersStore(rawStore) {
  const store = rawStore && typeof rawStore === 'object' ? rawStore : {}
  const users = store.users && typeof store.users === 'object' ? store.users : {}
  const safeStore = createEmptyUsersStore()

  for (const [userKey, value] of Object.entries(users)) {
    if (!value || typeof value !== 'object') {
      continue
    }

    const username = typeof value.username === 'string' ? value.username.trim() : ''
    const passwordHash = typeof value.passwordHash === 'string' ? value.passwordHash.trim() : ''
    const createdAt = typeof value.createdAt === 'string' ? value.createdAt : new Date(0).toISOString()

    if (!username || !passwordHash) {
      continue
    }

    safeStore.users[userKey] = {
      username,
      passwordHash,
      createdAt,
    }
  }

  return safeStore
}

function normalizeUserKey(userKey) {
  return userKey.trim().toLowerCase()
}

function getStatsForSeed(statsStore, seed) {
  return statsStore.byDay[seed] ? sanitizeStats(statsStore.byDay[seed]) : createEmptyStats()
}

async function ensureStatsFile() {
  await mkdir(dataDir, { recursive: true })

  try {
    await readFile(statsFilePath, 'utf8')
  } catch {
    await writeFile(statsFilePath, JSON.stringify(createEmptyStatsStore(), null, 2), 'utf8')
  }

  try {
    await readFile(usersFilePath, 'utf8')
  } catch {
    await writeFile(usersFilePath, JSON.stringify(createEmptyUsersStore(), null, 2), 'utf8')
  }
}

async function readStatsStore() {
  await ensureStatsFile()

  try {
    const raw = await readFile(statsFilePath, 'utf8')
    const parsed = JSON.parse(raw)
    return sanitizeStatsStore(parsed)
  } catch {
    return createEmptyStatsStore()
  }
}

async function writeStatsStore(nextStatsStore) {
  const safeStatsStore = sanitizeStatsStore(nextStatsStore)
  const tempPath = `${statsFilePath}.tmp`
  await writeFile(tempPath, JSON.stringify(safeStatsStore, null, 2), 'utf8')
  await rename(tempPath, statsFilePath)
  return safeStatsStore
}

async function readUsersStore() {
  await ensureStatsFile()

  try {
    const raw = await readFile(usersFilePath, 'utf8')
    const parsed = JSON.parse(raw)
    return sanitizeUsersStore(parsed)
  } catch {
    return createEmptyUsersStore()
  }
}

async function writeUsersStore(nextUsersStore) {
  const safeUsersStore = sanitizeUsersStore(nextUsersStore)
  const tempPath = `${usersFilePath}.tmp`
  await writeFile(tempPath, JSON.stringify(safeUsersStore, null, 2), 'utf8')
  await rename(tempPath, usersFilePath)
  return safeUsersStore
}

function applyOutcome(stats, { outcomeId, solved, attemptsUsed }) {
  if (stats.recordedSeeds.includes(outcomeId)) {
    return stats
  }

  const nextStats = {
    ...stats,
    played: stats.played + 1,
    wins: stats.wins + (solved ? 1 : 0),
    losses: stats.losses + (solved ? 0 : 1),
    totalWinningGuesses: stats.totalWinningGuesses + (solved ? attemptsUsed : 0),
    recordedSeeds: [...stats.recordedSeeds, outcomeId],
    guessDistribution: {
      ...stats.guessDistribution,
      [attemptsUsed]: solved
        ? stats.guessDistribution[attemptsUsed] + 1
        : stats.guessDistribution[attemptsUsed],
    },
  }

  return sanitizeStats(nextStats)
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/stats/global', async (req, res) => {
  const seed = typeof req.query.seed === 'string' ? req.query.seed : ''

  if (!seedPattern.test(seed)) {
    res.status(400).json({ error: 'seed query parameter is required as YYYY-MM-DD.' })
    return
  }

  const statsStore = await readStatsStore()
  const stats = getStatsForSeed(statsStore, seed)
  res.json({ seed, stats })
})

app.post('/api/stats/global', async (req, res) => {
  const { seed, outcomeId, solved, attemptsUsed } = req.body ?? {}

  if (typeof seed !== 'string' || !seedPattern.test(seed)) {
    res.status(400).json({ error: 'seed is required as YYYY-MM-DD.' })
    return
  }

  if (typeof outcomeId !== 'string' || outcomeId.trim().length === 0) {
    res.status(400).json({ error: 'outcomeId is required.' })
    return
  }

  if (typeof solved !== 'boolean') {
    res.status(400).json({ error: 'solved must be a boolean.' })
    return
  }

  if (!Number.isInteger(attemptsUsed) || attemptsUsed < 1 || attemptsUsed > 6) {
    res.status(400).json({ error: 'attemptsUsed must be an integer from 1 to 6.' })
    return
  }

  const statsStore = await readStatsStore()
  const currentStats = getStatsForSeed(statsStore, seed)
  const nextStats = applyOutcome(currentStats, {
    outcomeId: outcomeId.trim(),
    solved,
    attemptsUsed,
  })

  const nextStatsStore = {
    ...statsStore,
    byDay: {
      ...statsStore.byDay,
      [seed]: nextStats,
    },
  }

  const savedStatsStore = await writeStatsStore(nextStatsStore)
  const savedStats = getStatsForSeed(savedStatsStore, seed)
  const deduped = currentStats.recordedSeeds.includes(outcomeId.trim())
  res.json({ seed, stats: savedStats, deduped })
})

app.post('/api/auth/register', async (req, res) => {
  const rawUserKey = typeof req.body?.userKey === 'string' ? req.body.userKey : ''
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const passwordHash = typeof req.body?.passwordHash === 'string' ? req.body.passwordHash.trim() : ''
  const userKey = normalizeUserKey(rawUserKey)

  if (!userKey || !username || !passwordHash) {
    res.status(400).json({ error: 'userKey, username, and passwordHash are required.' })
    return
  }

  const usersStore = await readUsersStore()

  if (usersStore.users[userKey]) {
    res.status(409).json({ error: 'Username already exists.' })
    return
  }

  const nextUsersStore = {
    ...usersStore,
    users: {
      ...usersStore.users,
      [userKey]: {
        username,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
    },
  }

  await writeUsersStore(nextUsersStore)
  res.status(201).json({
    user: {
      userKey,
      username,
    },
  })
})

app.post('/api/auth/login', async (req, res) => {
  const rawUserKey = typeof req.body?.userKey === 'string' ? req.body.userKey : ''
  const passwordHash = typeof req.body?.passwordHash === 'string' ? req.body.passwordHash.trim() : ''
  const userKey = normalizeUserKey(rawUserKey)

  if (!userKey || !passwordHash) {
    res.status(400).json({ error: 'userKey and passwordHash are required.' })
    return
  }

  const usersStore = await readUsersStore()
  const user = usersStore.users[userKey]

  if (!user || user.passwordHash !== passwordHash) {
    res.status(401).json({ error: 'Invalid username or password.' })
    return
  }

  res.json({
    user: {
      userKey,
      username: user.username,
    },
  })
})

app.get('/api/auth/users/:userKey', async (req, res) => {
  const userKey = normalizeUserKey(typeof req.params.userKey === 'string' ? req.params.userKey : '')

  if (!userKey) {
    res.status(400).json({ error: 'userKey is required.' })
    return
  }

  const usersStore = await readUsersStore()
  const user = usersStore.users[userKey]

  if (!user) {
    res.status(404).json({ error: 'User not found.' })
    return
  }

  res.json({
    user: {
      userKey,
      username: user.username,
    },
  })
})

const port = Number.parseInt(process.env.PORT ?? '8787', 10)

ensureStatsFile()
  .then(() => {
    app.listen(port, () => {
      console.log(`TypeDle stats API running on http://127.0.0.1:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start TypeDle stats API:', error)
    process.exit(1)
  })
