import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { allowedOrigins, dataDir, port } from './lib/config.js'
import { errorHandler, generalLimiter } from './lib/middleware.js'
import { loadStores, statsStore, usersStore } from './lib/store.js'
import authRoutes from './routes/auth.js'
import leaderboardRoutes from './routes/leaderboard.js'
import statsRoutes from './routes/stats.js'
import userRoutes from './routes/users.js'

const app = express()

// Behind Render's proxy, so rate limiting needs the real client IP.
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, health checks) which send no Origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`))
    },
  }),
)
app.use(express.json({ limit: '64kb' }))
app.use(generalLimiter)

app.get('/api/health', (_req, res) => {
  const users = usersStore.read()
  const stats = statsStore.read()

  res.json({
    ok: true,
    dataDir,
    // Surfaced so a deploy can be spot-checked: if this drops to zero after a
    // deploy, the persistent disk isn't wired up correctly.
    userCount: Object.keys(users.users).length,
    dayCount: Object.keys(stats.byDay).length,
  })
})

app.use('/api/stats', statsRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/auth/users', userRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.use(errorHandler)

/**
 * Exposed so tests (and any other embedder) can await the stores being loaded
 * before issuing requests, instead of racing the boot sequence.
 */
export const ready = loadStores()

// Only take over the port when this file is the process entry point; importing
// it for tests should not start a listener.
const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  ready
    .then(() => {
      app.listen(port, () => {
        console.log(`TypeDle API running on http://127.0.0.1:${port}`)
        console.log(`Data directory: ${dataDir}`)
      })
    })
    .catch((error) => {
      console.error('Failed to start TypeDle API:', error)
      process.exit(1)
    })
}

export default app
