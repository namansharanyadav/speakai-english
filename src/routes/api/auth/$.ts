import { applyVercelAuthEnv } from "@/lib/vercel-auth-env";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

applyVercelAuthEnv();

function requestHost(request: Request): string {
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  try {
    return new URL(origin).hostname;
  } catch {
    return "";
  }
}

/** Personal Vercel aliases are not registered on the Grok OAuth broker. */
function isUnregisteredOAuthHost(host: string): boolean {
  return host.endsWith(".vercel.app");
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: async ({ request }) => {
        const path = new URL(request.url).pathname;
        if (path.includes("/sign-in/oauth2") && isUnregisteredOAuthHost(requestHost(request))) {
          return Response.json(
            {
              message:
                "Google and X are not connected on this live URL yet. Use email and password — that works now.",
            },
            { status: 400 },
          );
        }
        try {
          return await auth.handler(request);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sign-in failed";
          return Response.json({ message }, { status: 500 });
        }
      },
    },
  },
});
