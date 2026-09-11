import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConversePanel } from "@/components/converse-panel";
import { Card } from "@/components/ui/card";
import { listMistakes } from "@/lib/server/learning";

export const Route = createFileRoute("/_app/mistakes")({ component: Mistakes });

function Mistakes() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listMistakes>>>([]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    listMistakes().then(setRows).catch(() => {});
  }, []);
  const grouped = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + r.count;
    return acc;
  }, {});
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">My common mistakes</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(grouped).map(([k, n]) => (
          <button key={k} type="button" onClick={() => setOpen(k)}>
            <Card>
              <p className="font-medium capitalize">{k}</p>
              <p className="text-sm text-muted">{n} times</p>
            </Card>
          </button>
        ))}
        {rows.length === 0 ? <p className="text-sm text-muted">No logged mistakes yet. Talk with the AI partner first.</p> : null}
      </div>
      {rows.filter((r) => !open || r.category === open).map((r) => (
        <Card key={r.id}>
          <p className="text-danger">{r.original}</p>
          <p className="text-ok">{r.corrected}</p>
          <p className="mt-1 text-sm text-muted">{r.hindi_explanation}</p>
        </Card>
      ))}
      {open ? <ConversePanel kind="mistakes" mode="grammar" topic={open} seed={`Let us drill your ${open} mistakes.`} /> : null}
    </div>
  );
}
