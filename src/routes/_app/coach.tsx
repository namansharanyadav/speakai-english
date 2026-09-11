import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/coach")({ component: Coach });

const PROMPTS = [
  "Explain present perfect.",
  "Why is my sentence wrong?",
  "Give me 20 office vocabulary words.",
  "Practice an interview with me.",
  "Talk to me like a native speaker.",
  "Teach me advanced English.",
  "Give me today's lesson.",
];

function Coach() {
  const [seed] = useState("I am SpeakAI Coach. What would you like to practise?");
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl">SpeakAI Coach</h1>
        <p className="text-sm text-muted">A teacher who remembers your level, weak grammar, and goals.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <Button key={p} variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(p)}>
            {p}
          </Button>
        ))}
      </div>
      <ConversePanel kind="coach" mode="teacher" seed={seed} />
    </div>
  );
}
