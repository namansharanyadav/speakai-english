import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { ROLEPLAY } from "@/lib/content/curriculum";

export const Route = createFileRoute("/_app/roleplay")({ component: Roleplay });

function Roleplay() {
  const [scene, setScene] = useState("Job interview");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">AI Roleplay</h1>
      <p className="text-sm text-muted">Scenes respond dynamically — not a fixed script.</p>
      {Object.entries(ROLEPLAY).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{cat}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScene(item)}
                className={item === scene ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
      <ConversePanel
        kind="roleplay"
        mode="partner"
        topic={scene}
        seed={`Scene: ${scene}. I will stay in character. You start when you are ready.`}
      />
    </div>
  );
}
