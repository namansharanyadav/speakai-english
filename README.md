# SpeakAI English

English-learning academy for Hindi-speaking adults. Average / Intermediate / Professional bands, AI speaking partner, games, community rooms, and an admin console.

## Live

Production: https://speakai-english-gilt.vercel.app

Sign in with **email and password**. The first account becomes admin.

### Keep the database (required)

The live site uses a Neon Postgres database that must be claimed to your Neon account or it expires in 72 hours:

https://neon.new/claim/01a090df-fa9a-7279-87d3-c25837c6d831

After claiming, paste the connection string as `DATABASE_URL` in Vercel → Project → Settings → Environment Variables so later deploys keep working.

Other production variables (already set on the current deploy):

| Variable | Why |
|---|---|
| `DATABASE_URL` | Neon Postgres. Accounts, scores, community, admin. |
| `XAI_API_KEY` | Grok tutor, translator, and speaking check. |
| `BETTER_AUTH_SECRET` | Session signing. Long random string. |
| `BETTER_AUTH_URL` | Public origin: `https://speakai-english-gilt.vercel.app` |
| `GROK_AUTH_CLIENT_ID` | Optional. Google / X via the Grok broker. |
| `GROK_AUTH_CLIENT_SECRET` | Optional. Google / X via the Grok broker. |

## Local

```bash
npm install
npm run dev
```

Sign in with email/password, Google, or X. The first account is promoted to admin.

## Stack

TanStack Start, React 19, Tailwind v4, Better Auth, Postgres, xAI Grok.
