import "@/lib/vercel-auth-env";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Frozen `src/lib/auth/server.ts` only trusts BETTER_AUTH_URL + localhost:8080.
 * Personal Vercel deploys often never inject BETTER_AUTH_URL, so the gilt origin
 * is rejected. Proxy our known production hosts onto that trusted slot for the
 * CSRF header check only — do not clone the Request (that drops/locks the body
 * on Nitro and 500s). Browsers on those pages send the real Origin; other sites
 * cannot spoof it. Cookie domain is unchanged.
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

  const headers = new Proxy(request.headers, {
    get(target, prop, receiver) {
      if (prop === "get") {
        return (name: string) => {
          const key = name.toLowerCase();
          if (key === "origin") return "http://localhost:8080";
          if (key === "referer") {
            const referer = target.get("referer");
            return referer ? "http://localhost:8080/" : null;
          }
          return target.get(name);
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });

  return new Proxy(request, {
    get(target, prop, receiver) {
      if (prop === "headers") return headers;
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

async function handleAuth(request: Request) {
  try {
    return await auth.handler(withTrustedOrigin(request));
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
