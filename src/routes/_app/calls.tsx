import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { startCall } from "@/lib/server/community";

export const Route = createFileRoute("/_app/calls")({ component: Calls });

function Calls() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Calls</h1>
      <p className="text-sm text-muted">
        One-to-one video with camera, microphone, chat, and an optional AI coach after the call. We never record
        secretly — analysis is off until you switch it on.
      </p>
      <Button
        onClick={async () => {
          const call = await startCall({ data: { aiAnalysis: false } });
          void navigate({ to: "/call/$code", params: { code: call.code } });
        }}
      >
        Start a practice room
      </Button>
    </div>
  );
}
