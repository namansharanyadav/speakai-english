import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { Progress } from "@/components/ui/progress";
import { getMyProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/_app/thinking")({ component: Thinking });

const LEVELS = [
  { n: 1, title: "Hindi → English", seed: "I will give you Hindi. Answer only in English." },
  { n: 2, title: "Image → English", seed: "Imagine a busy Gurugram metro. Describe the scene in English." },
  { n: 3, title: "Situation → English", seed: "You missed a stand-up. Explain to your manager in English." },
  { n: 4, title: "Topic → Speak", seed: "Speak for a minute about your city. No Hindi." },
  { n: 5, title: "Abstract topic", seed: "Is ambition a virtue? Think, then speak." },
  { n: 6, title: "Professional only", seed: "English only. Present a project risk to leadership." },
];

function Thinking() {
  const [level, setLevel] = useState(1);
  const [dep, setDep] = useState(70);
  useEffect(() => {
    getMyProfile().then((p) => p && setDep(p.hindiDependency)).catch(() => {});
  }, []);
  const L = LEVELS[level - 1];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">English Thinking Mode</h1>
      <p className="text-sm text-muted">Gradually reduce Hindi. Current Hindi dependency {dep}%.</p>
      <Progress value={100 - dep} />
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.n}
            type="button"
            onClick={() => setLevel(l.n)}
            className={l.n === level ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}
          >
            {l.n}. {l.title}
          </button>
        ))}
      </div>
      <ConversePanel kind="thinking" mode={level >= 5 ? "professional" : "teacher"} topic={L.title} seed={L.seed} />
    </div>
  );
}
