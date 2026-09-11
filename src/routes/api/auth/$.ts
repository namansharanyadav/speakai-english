import "@/lib/vercel-auth-env";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Frozen `src/lib/auth/server.ts` only trusts BETTER_AUTH_URL + localhost:8080.
 * Personal Vercel deploys often never inject BETTER_AUTH_URL, so the gilt origin
 * is rejected. Map our known production hosts onto localhost:8080 for the CSRF
 * check only — browsers on those pages send the real Origin; attackers on other
 * sites cannot spoof it. Cookie domain is unchanged (still the Vercel host).
 */
function isSpeakAiProductionOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    const host = url.host.toLowerCase();
    if (host === "speakai-english-gilt.vercel.app") return true;
    return host.startsWith("speakai-english") && host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function withTrustedOrigin(request: Request): Request {
  const origin = request.headers.get("origin") || "";
  if (!isSpeakAiProductionOrigin(origin)) return request;
  const headers = new Headers(request.headers);
  headers.set("origin", "http://localhost:8080");
  const referer = headers.get("referer");
  if (referer) headers.set("referer", "http://localhost:8080/");
  return new Request(request, { headers });
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(withTrustedOrigin(request)),
    },
  },
});
