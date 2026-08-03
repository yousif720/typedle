# TypeDle

TypeDle is a daily Pokemon guessing game with progressive clue reveals.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start both the app and the global stats API:

```bash
npm run dev:full
```

The frontend runs on Vite (default `http://127.0.0.1:5173`) and proxies `/api/*` requests to the stats API (`http://127.0.0.1:8787`).

## Global stats API

- Endpoint: `GET /api/stats/global?seed=YYYY-MM-DD`
- Endpoint: `POST /api/stats/global`
- Health check: `GET /api/health`

`POST /api/stats/global` body:

```json
{
	"seed": "2026-08-03",
	"outcomeId": "user:ash:2026-08-03",
	"solved": true,
	"attemptsUsed": 3
}
```

Stats are persisted in `server/data/global-stats.json`.

Per-day global stats are stored by seed, so each day has its own aggregate distribution and win rate.

## Auth API

- Endpoint: `POST /api/auth/register`
- Endpoint: `POST /api/auth/login`
- Endpoint: `GET /api/auth/users/:userKey`
- Endpoint: `GET /api/auth/users/:userKey/completions`
- Endpoint: `POST /api/auth/users/:userKey/completions`

`POST /api/auth/users/:userKey/completions` body:

```json
{
	"seed": "2026-08-03",
	"solved": true,
	"failed": false,
	"attemptsUsed": 3,
	"guessedPokemon": "Bulbasaur",
	"targetPokemon": "Bulbasaur",
	"completedAt": "2026-08-03T18:25:00.000Z"
}
```

Completion data is stored per user and keyed by day seed.

- Endpoint: `GET /api/auth/users/:userKey/progress`
- Endpoint: `PUT /api/auth/users/:userKey/progress`

`PUT /api/auth/users/:userKey/progress` accepts partial payload with `streakState` and/or `stats`.

Users are persisted in `server/data/users.json`.

Each finished game submits one global outcome ID:

- Logged in user: `user:<username>:<seed>`
- Guest: `guest:<client-id>:<seed>`

This prevents duplicate counting on refresh while still allowing real cross-device global aggregation through the backend.

## Hosting notes (GitHub Pages + Squarespace)

Yes, it is different now compared to a pure static setup.

The app frontend can still be hosted statically (GitHub Pages), but global stats now require a running backend API.

### 1) Deploy frontend to GitHub Pages

- Build output is still static (`dist`).
- If you are deploying to a project page (`https://username.github.io/repo-name/`), set `base` in `vite.config.ts` to `/repo-name/`.
- If you are deploying to a user/org page (`https://username.github.io/`), `base: '/'` is fine.

### 2) Deploy backend API somewhere else

Use any Node host (Render, Railway, Fly.io, VPS, etc.) for `server/index.js`.

- Expose the API publicly over HTTPS.
- Keep endpoints:
	- `GET /api/health`
	- `GET /api/stats/global`
	- `POST /api/stats/global`

### 3) Point frontend to that API

Set a Vite environment variable at build time:

`VITE_STATS_API_BASE_URL=https://your-api-domain.com`

The app will call:

`https://your-api-domain.com/api/stats/global`

### 4) Squarespace custom domain

You have two common patterns:

- Point your root/WWW domain to GitHub Pages for the frontend.
- Use an API subdomain for backend, for example `api.yourdomain.com`, pointed to your Node host.

Then build frontend with:

`VITE_STATS_API_BASE_URL=https://api.yourdomain.com`

### 5) CORS and HTTPS

- Your API must allow your frontend origin in CORS.
- Both frontend and API should be HTTPS in production.
- Browsers will block mixed-content calls (HTTPS page -> HTTP API).
