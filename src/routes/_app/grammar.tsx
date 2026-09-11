import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GRAMMAR } from "@/lib/content/curriculum";
import { completeLesson } from "@/lib/server/learning";

export const Route = createFileRoute("/_app/grammar")({ component: Grammar });

function Grammar() {
  const [slug, setSlug] = useState(GRAMMAR[0].slug);
  const [answer, setAnswer] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);
  const topic = GRAMMAR.find((g) => g.slug === slug) ?? GRAMMAR[0];
  const drill = topic.practice[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="space-y-1">
        <h1 className="mb-3 font-display text-3xl">Grammar Lab</h1>
        {GRAMMAR.map((g) => (
          <button
            key={g.slug}
            type="button"
            onClick={() => { setSlug(g.slug); setOk(null); setAnswer(""); }}
            className={g.slug === slug ? "block w-full rounded-2xl bg-primary-soft px-3 py-2 text-left text-sm" : "block w-full rounded-2xl px-3 py-2 text-left text-sm text-muted"}
          >
            {g.title}
          </button>
        ))}
      </aside>
      <div className="space-y-4">
        <Card>
          <p className="text-xs text-muted">{topic.level}</p>
          <h2 className="font-display text-2xl">{topic.title}</h2>
          <p className="mt-3">{topic.explanation}</p>
          <p className="mt-3 rounded-2xl bg-surface-2 p-3 text-sm">{topic.hindi}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {topic.examples.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </Card>
        <Card>
          <h3 className="font-medium">Common mistakes</h3>
          {topic.mistakes.map((m) => (
            <div key={m.bad} className="mt-2 text-sm">
              <p className="text-danger">{m.bad}</p>
              <p className="text-ok">{m.good}</p>
              <p className="text-muted">{m.why}</p>
            </div>
          ))}
        </Card>
        {drill ? (
          <Card>
            <h3 className="font-medium">Practice</h3>
            <p className="mt-2 text-sm">{drill.prompt}</p>
            <Input className="mt-2" value={answer} onChange={(e) => setAnswer(e.target.value)} />
            <Button
              className="mt-2"
              onClick={() => {
                const match = answer.trim().toLowerCase().includes(drill.answer.toLowerCase().slice(0, 12));
                setOk(match);
                if (match) void completeLesson({ data: { lessonId: topic.slug, kind: "grammar", score: 100 } });
              }}
            >
              Check
            </Button>
            {ok === true ? <p className="mt-2 text-sm text-ok">Good. {drill.answer}</p> : null}
            {ok === false ? <p className="mt-2 text-sm text-danger">Close. Aim for: {drill.answer}</p> : null}
          </Card>
        ) : null}
        <div>
          <h3 className="mb-2 font-medium">Speaking exercise</h3>
          <ConversePanel kind="grammar" mode="grammar" topic={topic.title} seed={topic.speaking} />
        </div>
      </div>
    </div>
  );
}
