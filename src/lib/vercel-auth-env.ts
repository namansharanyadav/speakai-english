/**
 * On Vercel, Better Auth only trusts BETTER_AUTH_URL. Personal Vercel deploys
 * often omit it, which makes sign-up fail with "Invalid origin".
 *
 * Use dynamic `process.env[key]` access so Vite does not inline these away.
 * Hardcode the production alias — VERCEL_URL is a per-deploy host and would
 * reject the public gilt origin.
 *
 * Deploy overlays may assign DATABASE_URL / XAI_API_KEY / BETTER_AUTH_SECRET
 * at the top of this file before this module body runs.
 */
const PRODUCTION_ORIGIN = "https://speakai-english-gilt.vercel.app";

function readEnv(key: string): string | undefined {
  const value = typeof process === "undefined" ? undefined : process.env[key]?.trim();
  return value ? value : undefined;
}

export function applyVercelAuthEnv(): void {
  if (typeof process === "undefined") return;
  const onVercel = Boolean(readEnv("VERCEL") || readEnv("VERCEL_ENV") || readEnv("VERCEL_URL"));
  if (!onVercel) return;

  if (!readEnv("BETTER_AUTH_URL")) {
    process.env.BETTER_AUTH_URL = PRODUCTION_ORIGIN;
  }

  if (!readEnv("BETTER_AUTH_SECRET")) {
    const seed = readEnv("VERCEL_PROJECT_ID") ?? "speakai-english";
    process.env.BETTER_AUTH_SECRET = `speakai-english/${seed}/better-auth-secret-v1`;
  }
}

applyVercelAuthEnv();
