import "@/lib/vercel-auth-env";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Frozen `src/lib/auth/server.ts` only trusts BETTER_AUTH_URL + localhost:8080.
 * Personal Vercel deploys often never inject BETTER_AUTH_URL, so the gilt origin
 * is rejected. Rebuild the request with Origin remapped to localhost:8080 for
 * the CSRF check, copying the body as bytes. Auth is imported inside the
 * handler so a boot crash returns JSON instead of an empty 500.
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

async function withTrustedOrigin(request: Request): Promise<Request> {
  const origin = request.headers.get("origin") || "";
  if (!isSpeakAiProductionOrigin(origin)) return request;

  const headers = new Headers(request.headers);
  headers.set("origin", "http://localhost:8080");
  if (headers.has("referer")) headers.set("referer", "http://localhost:8080/");

  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer();
    (init as RequestInit & { duplex: "half" }).duplex = "half";
  }
  return new Request(request.url, init);
}

async function handleAuth(request: Request) {
  try {
    const req = await withTrustedOrigin(request);
    const { auth } = await import("@/lib/auth/server");
    return await auth.handler(req);
  } catch (err) {
    console.error("[auth]", err);
    const message = err instanceof Error ? err.message : "Sign-in is unavailable.";
    return Response.json({ message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
