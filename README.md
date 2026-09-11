# SpeakAI English

English-learning academy for Hindi-speaking adults. Average / Intermediate / Professional bands, AI speaking partner, games, community rooms, and an admin console.

## Live

This repo deploys to Vercel. After the first deploy, add these environment variables in the Vercel project **Settings → Environment Variables** (Production):

| Variable | Why |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string. Required for accounts, scores, community, and admin. |
| `XAI_API_KEY` | Grok tutor, translator, and speaking check. |
| `BETTER_AUTH_SECRET` | Session signing. Use a long random string. |
| `BETTER_AUTH_URL` | Public site origin, e.g. `https://your-app.vercel.app` |
| `GROK_AUTH_CLIENT_ID` | Optional. Google / X login via the Grok broker. |
| `GROK_AUTH_CLIENT_SECRET` | Optional. Google / X login via the Grok broker. |

Without `DATABASE_URL` the site still builds; sign-in and saved progress need Postgres.

## Local

```bash
npm install
npm run dev
```

Sign in with email/password, Google, or X. The first account is promoted to admin.

## Stack

TanStack Start, React 19, Tailwind v4, Better Auth, Postgres, xAI Grok.
