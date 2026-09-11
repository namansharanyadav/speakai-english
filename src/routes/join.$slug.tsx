import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { joinRoom } from "@/lib/server/community";

export const Route = createFileRoute("/join/$slug")({ component: Join });

function Join() {
  const { slug } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Opening room…");

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setMsg("Sign in to join this speaking room.");
      return;
    }
    joinRoom({ data: { slug } })
      .then((r) => {
        if (r.ok) void navigate({ to: "/community" });
        else setMsg(r.error);
      })
      .catch(() => setMsg("Could not join this room."));
  }, [isPending, user, slug, navigate]);

  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="text-xs text-muted">speakai.app/join/{slug}</p>
        <h1 className="mt-2 font-display text-3xl">{msg}</h1>
        {!user && !isPending ? (
          <Button className="mt-4" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        ) : null}
      </div>
    </main>
  );
}
