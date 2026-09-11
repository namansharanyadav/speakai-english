/**
 * On Vercel, Better Auth only trusts BETTER_AUTH_URL. The Grok deployer injects
 * that var; a personal Vercel project often does not, which makes sign-up/sign-in
 * fail with "Invalid origin". Set origin + a stable secret from Vercel metadata
 * before `src/lib/auth/server.ts` reads process.env (imported first from db.ts).
 *
 * No-ops in the sandbox preview (VERCEL is unset).
 */
function trim(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function httpsOrigin(hostOrUrl: string | undefined): string | undefined {
  const raw = trim(hostOrUrl);
  if (!raw) return undefined;
  if (raw.startsWith("https://") || raw.startsWith("http://")) return raw.replace(/\/+$/, "");
  return `https://${raw.replace(/\/+$/, "")}`;
}

export function applyVercelAuthEnv(): void {
  if (typeof process === "undefined") return;
  if (process.env.VERCEL !== "1") return;

  if (!trim(process.env.BETTER_AUTH_URL)) {
    const origin =
      httpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
      httpsOrigin(process.env.VERCEL_URL) ??
      "https://speakai-english-gilt.vercel.app";
    process.env.BETTER_AUTH_URL = origin;
  }

  if (!trim(process.env.BETTER_AUTH_SECRET)) {
    const seed =
      trim(process.env.VERCEL_PROJECT_ID) ??
      trim(process.env.VERCEL_URL) ??
      "speakai-english";
    process.env.BETTER_AUTH_SECRET = `speakai-english/${seed}/better-auth-secret-v1`;
  }
}

applyVercelAuthEnv();
