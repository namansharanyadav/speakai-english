import { PROD_SECRETS } from "./prod-secrets";

/**
 * On Vercel, Better Auth only trusts BETTER_AUTH_URL. Personal Vercel deploys
 * often omit it, which makes sign-up fail with "Invalid origin".
 *
 * `PROD_SECRETS` is inlined at deploy time (see scripts/inject-prod-env.mjs)
 * so Vite cannot drop DATABASE_URL / BETTER_AUTH_URL at build.
 */
const PRODUCTION_ORIGIN = "https://speakai-english-gilt.vercel.app";

function readEnv(key: string): string | undefined {
  const value = typeof process === "undefined" ? undefined : process.env[key]?.trim();
  return value ? value : undefined;
}

export function applyVercelAuthEnv(): void {
  if (typeof process === "undefined") return;

  for (const [key, value] of Object.entries(PROD_SECRETS)) {
    if (value && !readEnv(key)) process.env[key] = value;
  }

  const onVercel = Boolean(readEnv("VERCEL") || readEnv("VERCEL_ENV") || readEnv("VERCEL_URL"));
  if (!onVercel && Object.keys(PROD_SECRETS).length === 0) return;

  if (!readEnv("BETTER_AUTH_URL")) {
    process.env.BETTER_AUTH_URL = PRODUCTION_ORIGIN;
  }

  if (!readEnv("BETTER_AUTH_SECRET")) {
    const seed = readEnv("VERCEL_PROJECT_ID") ?? "speakai-english";
    process.env.BETTER_AUTH_SECRET = `speakai-english/${seed}/better-auth-secret-v1`;
  }
}

applyVercelAuthEnv();
