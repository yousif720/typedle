import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const serverDir = path.dirname(path.dirname(__filename))

// In production this must point at a persistent disk mount (e.g. Render's
// /var/data). Without it the data lives inside the app checkout, which is
// rebuilt from git on every deploy and therefore wiped.
export const dataDir = process.env.DATA_DIR?.trim() || path.join(serverDir, 'data')
export const statsFilePath = path.join(dataDir, 'global-stats.json')
export const usersFilePath = path.join(dataDir, 'users.json')

export const port = Number.parseInt(process.env.PORT ?? '8787', 10)

// Comma-separated list of allowed browser origins. Defaults to the public site
// plus local dev. Set CORS_ORIGINS in production to lock this down further.
export const allowedOrigins = (
  process.env.CORS_ORIGINS?.trim() ||
  'https://www.typedle.net,https://typedle.net,http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const seedPattern = /^\d{4}-\d{2}-\d{2}$/

export const maxGuesses = 6

// Session lifetime. Tokens past this are rejected and pruned.
export const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 30

export const bcryptRounds = 12
