import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SpeakButton } from "@/components/voice";
import { finishDailyLesson, getDailyLesson } from "@/lib/server/learning";

export const Route = createFileRoute("/_app/lesson")({ component: Lesson });

function Lesson() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDailyLesson>> | null>(null);
  useEffect(() => {
    getDailyLesson().then(setData).catch(() => {});
  }, []);
  if (!data) return <p className="text-muted">Preparing today’s lesson…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Today’s lesson</h1>
      <p className="text-sm text-muted">A 15–30 minute mix. We will not invent fake improvement percentages.</p>
      <Card>
        <p className="text-xs text-muted">5 min · Vocabulary</p>
        <ul className="mt-2 space-y-2">
          {data.vocab.map((v) => (
            <li key={v.word} className="flex items-center justify-between">
              <span>
                <strong>{v.word}</strong> · {v.hindi}
                <span className="block text-sm text-muted">{v.example}</span>
              </span>
              <SpeakButton text={v.word} />
            </li>
          ))}
        </ul>
      </Card>
      {data.grammar ? (
        <Card>
          <p className="text-xs text-muted">5 min · Grammar</p>
          <h2 className="font-display text-2xl">{data.grammar.title}</h2>
          <p className="mt-2 text-sm">{data.grammar.explanation}</p>
          <p className="mt-2 text-sm text-muted">{data.grammar.hindi}</p>
        </Card>
      ) : null}
      <Card>
        <p className="text-xs text-muted">10 min · Speaking</p>
        <p className="font-display text-xl">{data.speaking}</p>
      </Card>
      <Button
        disabled={data.completed}
        onClick={async () => {
          await finishDailyLesson();
          setData({ ...data, completed: true });
        }}
      >
        {data.completed ? "Completed" : "Mark today’s lesson complete"}
      </Button>
    </div>
  );
}
