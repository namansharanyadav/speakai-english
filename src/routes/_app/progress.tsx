import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { latestScores } from "@/lib/server/learning";
import { getMyProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/_app/progress")({ component: ProgressPage });

function ProgressPage() {
  const [rows, setRows] = useState<{ overall: number; grammar: number; fluency: number; created_at: string }[]>([]);
  const [xp, setXp] = useState(0);
  useEffect(() => {
    latestScores().then(setRows).catch(() => {});
    getMyProfile().then((p) => p && setXp(p.xp)).catch(() => {});
  }, []);
  const data = [...rows].reverse().map((r, i) => ({
    i: i + 1,
    overall: r.overall,
    grammar: r.grammar,
    fluency: r.fluency,
  }));
  const latest = rows[0];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Speaking score</h1>
      <p className="text-sm text-muted">Progress over your sessions. We only show movement that actually happened — no fake “+4%”.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Overall</p>
          <p className="font-display text-4xl tabular-nums">{latest?.overall ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Grammar</p>
          <p className="font-display text-4xl tabular-nums">{latest?.grammar ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">XP</p>
          <p className="font-display text-4xl tabular-nums">{xp}</p>
        </Card>
      </div>
      <Card className="h-72">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="i" hide />
              <YAxis domain={[0, 100]} width={28} />
              <Tooltip />
              <Area type="monotone" dataKey="overall" stroke="var(--color-primary)" fill="var(--color-primary-soft)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted">Complete a speaking session to plot your first point.</p>
        )}
      </Card>
    </div>
  );
}
