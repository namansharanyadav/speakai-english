import { createFileRoute } from "@tanstack/react-router";
import { ConversePanel } from "@/components/converse-panel";

export const Route = createFileRoute("/_app/speak")({ component: Speak });

function Speak() {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs tracking-wide text-muted uppercase">AI speaking partner</p>
        <h1 className="font-display text-3xl">Talk. We will not interrupt every slip.</h1>
        <p className="mt-1 text-sm text-muted">
          Speak or type. The partner replies first. Corrections sit on the side, with a Hindi explanation when you
          need one.
        </p>
      </header>
      <ConversePanel
        kind="partner"
        mode="partner"
        seed="Hi! How was your day?"
      />
    </div>
  );
}
