import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { ROUND_TABLE_TOPICS } from "@/lib/content/curriculum";

export const Route = createFileRoute("/_app/round-table")({ component: RoundTable });

function RoundTable() {
  const [topic, setTopic] = useState(ROUND_TABLE_TOPICS[0]);
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl">AI Round Table</h1>
        <p className="text-sm text-muted">You plus four AI voices: Teacher, Professional, Beginner, and Critical Thinker.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {ROUND_TABLE_TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={t === topic ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}
          >
            {t}
          </button>
        ))}
      </div>
      <ConversePanel
        kind="roundtable"
        mode="debate"
        topic={topic}
        seed={`Teacher: Welcome. Today we discuss “${topic}”. Professional, Beginner, and Critical Thinker are here. What is your opening view?`}
      />
    </div>
  );
}
