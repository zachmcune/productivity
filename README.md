# Productivity Hub

Personal productivity site: calculator, notes, timer, color picker, brain-break games, and account sync.

## Live site

- **Pages URL:** your `*.pages.dev` URL from Cloudflare
- **Repo:** https://github.com/zachmcune/productivity

## Local dev

```bash
npm install
npm run dev          # site + API at http://localhost:8788
npm run db:migrate:local
```

## Deploy

Push to `main` → Cloudflare Pages auto-deploys.

See `CLOUDFLARE_SETUP.md` for D1 database and auth setup.

## Data storage

| Signed in | Guest |
|-----------|-------|
| Cloudflare D1 (`user_data` table) | Browser `localStorage` |

Keys: `hub-notes`, `hub-todos`, `hub-colors`, `hub-game-scores`, `hub-transitions-enabled`

## Project map for AI

See `AGENTS.md`.
