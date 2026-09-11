import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { Card } from "@/components/ui/card";
import { ACADEMY, TECH_DRILLS } from "@/lib/content/curriculum";

export const Route = createFileRoute("/_app/academy")({ component: Academy });

function Academy() {
  const [mod, setMod] = useState(ACADEMY[0]);
  const [drill, setDrill] = useState(TECH_DRILLS[0]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Professional English Academy</h1>
        <p className="text-sm text-muted">Workplace, interview, client, and technical communication.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACADEMY.map((m) => (
          <button key={m.slug} type="button" onClick={() => setMod(m)} className="text-left">
            <Card className={m.slug === mod.slug ? "ring-2 ring-primary" : ""}>
              <h2 className="font-medium">{m.title}</h2>
              <p className="mt-1 text-sm text-muted">{m.summary}</p>
            </Card>
          </button>
        ))}
      </div>
      <div>
        <h2 className="font-display text-2xl">Technology drills</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {TECH_DRILLS.map((d) => (
            <button key={d} type="button" onClick={() => setDrill(d)} className={d === drill ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <ConversePanel kind="academy" mode="professional" topic={mod.title} seed={`Let us practise ${mod.title}. Prompt: ${drill}`} />
    </div>
  );
}
