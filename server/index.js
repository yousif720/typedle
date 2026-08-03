import cors from 'cors'
import express from 'express'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const statsFilePath = path.join(dataDir, 'global-stats.json')

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

async function ensureStatsFile() {
  await mkdir(dataDir, { recursive: true })

  try {
    await readFile(statsFilePath, 'utf8')
  } catch {
    await writeFile(statsFilePath, JSON.stringify(createEmptyStats(), null, 2), 'utf8')
  }
}

async function readStats() {
  await ensureStatsFile()

  try {
    const raw = await readFile(statsFilePath, 'utf8')
    const parsed = JSON.parse(raw)
    return sanitizeStats(parsed)
  } catch {
    return createEmptyStats()
  }
}

async function writeStats(nextStats) {
  const safeStats = sanitizeStats(nextStats)
  const tempPath = `${statsFilePath}.tmp`
  await writeFile(tempPath, JSON.stringify(safeStats, null, 2), 'utf8')
  await rename(tempPath, statsFilePath)
  return safeStats
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

app.get('/api/stats/global', async (_req, res) => {
  const stats = await readStats()
  res.json({ stats })
})

app.post('/api/stats/global', async (req, res) => {
  const { outcomeId, solved, attemptsUsed } = req.body ?? {}

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

  const currentStats = await readStats()
  const nextStats = applyOutcome(currentStats, {
    outcomeId: outcomeId.trim(),
    solved,
    attemptsUsed,
  })

  const savedStats = await writeStats(nextStats)
  const deduped = currentStats.recordedSeeds.includes(outcomeId.trim())
  res.json({ stats: savedStats, deduped })
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
