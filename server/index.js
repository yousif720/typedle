import cors from 'cors'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// In production this must point at a Render persistent disk's mount path via
// the DATA_DIR env var. Without it, data lives inside the app's own checkout
// and gets wiped on every deploy (the checkout is rebuilt from git each time).
const dataDir = process.env.DATA_DIR?.trim() || path.join(__dirname, 'data')
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

function createEmptyStreakState() {
  return {
    current: 0,
    best: 0,
    lastSeed: null,
  }
}

function sanitizeStreakState(rawState) {
  const state = rawState && typeof rawState === 'object' ? rawState : {}

  return {
    current: Number.isFinite(state.current) ? Math.max(0, state.current) : 0,
    best: Number.isFinite(state.best) ? Math.max(0, state.best) : 0,
    lastSeed: typeof state.lastSeed === 'string' ? state.lastSeed : null,
  }
}

function sanitizeCompletion(rawCompletion, seed) {
  const completion = rawCompletion && typeof rawCompletion === 'object' ? rawCompletion : {}
  const solved = Boolean(completion.solved)
  const failed = Boolean(completion.failed)
  const attemptsUsed = Number.isFinite(completion.attemptsUsed)
    ? Math.max(1, Math.min(6, Number.parseInt(completion.attemptsUsed, 10)))
    : 1
  const guessedPokemon = typeof completion.guessedPokemon === 'string' ? completion.guessedPokemon : ''
  const targetPokemon = typeof completion.targetPokemon === 'string' ? completion.targetPokemon : ''
  const guessHistory = Array.isArray(completion.guessHistory)
    ? completion.guessHistory.filter((value) => typeof value === 'string')
    : []
  const completedAt = typeof completion.completedAt === 'string' ? completion.completedAt : new Date(0).toISOString()

  return {
    seed,
    solved,
    failed,
    attemptsUsed,
    guessedPokemon,
    targetPokemon,
    guessHistory,
    completedAt,
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
    const completions = value.completions && typeof value.completions === 'object' ? value.completions : {}
    const streakState = sanitizeStreakState(value.streakState)
    const stats = sanitizeStats(value.stats)

    if (!username || !passwordHash) {
      continue
    }

    const safeCompletions = {}

    for (const [seed, rawCompletion] of Object.entries(completions)) {
      if (typeof seed === 'string' && seedPattern.test(seed)) {
        safeCompletions[seed] = sanitizeCompletion(rawCompletion, seed)
      }
    }

    safeStore.users[userKey] = {
      username,
      passwordHash,
      createdAt,
      streakState,
      stats,
      completions: safeCompletions,
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
  const tempPath = `${statsFilePath}.${randomUUID()}.tmp`
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
  const tempPath = `${usersFilePath}.${randomUUID()}.tmp`
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
        streakState: createEmptyStreakState(),
        stats: createEmptyStats(),
        completions: {},
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

app.get('/api/auth/users/:userKey/completions', async (req, res) => {
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
    userKey,
    completions: user.completions ?? {},
  })
})

app.get('/api/auth/users/:userKey/progress', async (req, res) => {
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
    userKey,
    progress: {
      streakState: sanitizeStreakState(user.streakState),
      stats: sanitizeStats(user.stats),
    },
  })
})

app.put('/api/auth/users/:userKey/progress', async (req, res) => {
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

  const incomingStreakState = req.body?.streakState
  const incomingStats = req.body?.stats

  const nextUser = {
    ...user,
    streakState: incomingStreakState ? sanitizeStreakState(incomingStreakState) : sanitizeStreakState(user.streakState),
    stats: incomingStats ? sanitizeStats(incomingStats) : sanitizeStats(user.stats),
  }

  const nextUsersStore = {
    ...usersStore,
    users: {
      ...usersStore.users,
      [userKey]: nextUser,
    },
  }

  await writeUsersStore(nextUsersStore)
  res.json({
    userKey,
    progress: {
      streakState: nextUser.streakState,
      stats: nextUser.stats,
    },
  })
})

app.post('/api/auth/users/:userKey/completions', async (req, res) => {
  const userKey = normalizeUserKey(typeof req.params.userKey === 'string' ? req.params.userKey : '')

  if (!userKey) {
    res.status(400).json({ error: 'userKey is required.' })
    return
  }

  const seed = typeof req.body?.seed === 'string' ? req.body.seed : ''
  const solved = req.body?.solved
  const failed = req.body?.failed
  const attemptsUsed = req.body?.attemptsUsed
  const guessedPokemon = typeof req.body?.guessedPokemon === 'string' ? req.body.guessedPokemon : ''
  const targetPokemon = typeof req.body?.targetPokemon === 'string' ? req.body.targetPokemon : ''
  const guessHistory = Array.isArray(req.body?.guessHistory)
    ? req.body.guessHistory.filter((value) => typeof value === 'string')
    : []
  const completedAt = typeof req.body?.completedAt === 'string' ? req.body.completedAt : new Date().toISOString()

  if (!seedPattern.test(seed)) {
    res.status(400).json({ error: 'seed is required as YYYY-MM-DD.' })
    return
  }

  if (typeof solved !== 'boolean' || typeof failed !== 'boolean') {
    res.status(400).json({ error: 'solved and failed must be booleans.' })
    return
  }

  if (!Number.isInteger(attemptsUsed) || attemptsUsed < 1 || attemptsUsed > 6) {
    res.status(400).json({ error: 'attemptsUsed must be an integer from 1 to 6.' })
    return
  }

  const usersStore = await readUsersStore()
  const user = usersStore.users[userKey]

  if (!user) {
    res.status(404).json({ error: 'User not found.' })
    return
  }

  const existingCompletion = user.completions?.[seed]

  if (existingCompletion) {
    const existingHistory = Array.isArray(existingCompletion.guessHistory)
      ? existingCompletion.guessHistory.filter((value) => typeof value === 'string')
      : []
    const nextHistory = existingHistory.length > 0 ? existingHistory : guessHistory
    const nextGuessedPokemon = existingCompletion.guessedPokemon || guessedPokemon
    const nextTargetPokemon = existingCompletion.targetPokemon || targetPokemon
    const shouldRepairCompletion =
      nextHistory.length !== existingHistory.length ||
      nextGuessedPokemon !== existingCompletion.guessedPokemon ||
      nextTargetPokemon !== existingCompletion.targetPokemon

    if (!shouldRepairCompletion) {
      res.json({ completion: existingCompletion, deduped: true })
      return
    }

    const repairedCompletion = sanitizeCompletion(
      {
        ...existingCompletion,
        guessedPokemon: nextGuessedPokemon,
        targetPokemon: nextTargetPokemon,
        guessHistory: nextHistory,
      },
      seed,
    )

    const nextUsersStore = {
      ...usersStore,
      users: {
        ...usersStore.users,
        [userKey]: {
          ...user,
          completions: {
            ...(user.completions ?? {}),
            [seed]: repairedCompletion,
          },
        },
      },
    }

    await writeUsersStore(nextUsersStore)
    res.json({ completion: repairedCompletion, deduped: true })
    return
  }

  const nextCompletion = sanitizeCompletion(
    {
      solved,
      failed,
      attemptsUsed,
      guessedPokemon,
      targetPokemon,
      guessHistory,
      completedAt,
    },
    seed,
  )

  const nextUsersStore = {
    ...usersStore,
    users: {
      ...usersStore.users,
      [userKey]: {
        ...user,
        completions: {
          ...(user.completions ?? {}),
          [seed]: nextCompletion,
        },
      },
    },
  }

  await writeUsersStore(nextUsersStore)
  res.status(201).json({ completion: nextCompletion, deduped: false })
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
