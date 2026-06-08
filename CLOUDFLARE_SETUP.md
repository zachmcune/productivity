# Cloudflare login setup

Productivity Hub uses **Cloudflare Pages Functions** + **D1** for accounts and synced data. Guests still use `localStorage`; signed-in users sync notes, todos, colors, and animation settings.

## Architecture

```
Browser  →  Cloudflare Pages (static HTML/JS)
         →  /api/* Pages Functions (functions/)
         →  D1 database (users, sessions, user_data)
```

## One-time setup

### 1. Install tools

```bash
cd /path/to/productivity-hub
npm install
# If wrangler says it's out of date:
npm i -D wrangler@latest
```

### 2. Log in to Cloudflare

```bash
npx wrangler login
```

### 3. Create the D1 database

```bash
npx wrangler d1 create productivity-hub-db
```

Copy the `database_id` from the output into `wrangler.toml`:

```toml
database_id = "your-uuid-here"
```

### 4. Run database migrations

**Local (for `npm run dev`):**

```bash
npm run db:migrate:local
```

**Production:**

```bash
npm run db:migrate:remote
```

### 5. Bind D1 to your Pages project

In the [Cloudflare dashboard](https://dash.cloudflare.com):

1. **Workers & Pages** → your Pages project → **Settings**
2. **Functions** → **D1 database bindings**
3. Add binding:
   - **Variable name:** `DB`
   - **D1 database:** `productivity-hub-db`

The binding name `DB` must match `wrangler.toml`.

### 6. Deploy

Push to GitHub (Cloudflare Pages auto-deploys), or:

```bash
npx wrangler pages deploy .
```

Ensure the Pages project root is the repo root (no build command needed).

## Local development

```bash
npm run dev
```

Opens the site with working `/api` routes and a local D1 database.

Test flow:

1. Visit `http://localhost:8788/account.html`
2. Create an account
3. Open Notes — data saves to D1 when signed in
4. Use **Import browser data** on the account page to copy old `localStorage` content

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signup` | POST | Create account `{ email, password }` |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/logout` | POST | Sign out |
| `/api/auth/me` | GET | Current user or `{ user: null }` |
| `/api/auth/import` | POST | Import localStorage keys to cloud |
| `/api/data/:key` | GET/PUT | Per-user data (`hub-notes`, `hub-todos`, etc.) |

Sessions use an HTTP-only cookie (`hub_session`) valid for 30 days.

## Security notes

- Passwords are hashed with PBKDF2 (100k iterations, SHA-256).
- API data keys are whitelisted in `functions/_shared/data-keys.js`.
- Add **Cloudflare Turnstile** on signup/login for bot protection at scale.
- Consider rate limiting in a `_middleware.js` for production traffic.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `API returns 500` | D1 binding missing in Pages settings |
| `Not signed in` after login | Site must be served over HTTPS in production (cookie `Secure` flag) |
| Local login fails | Run `npm run db:migrate:local` first |
| `database_id` error | Update `wrangler.toml` after `wrangler d1 create` |
