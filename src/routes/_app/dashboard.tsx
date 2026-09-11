import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScoreRing } from "@/components/correction-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BANDS } from "@/lib/bands";
import { latestScores } from "@/lib/server/learning";
import { getMyProfile, type Profile } from "@/lib/server/profile";
import { greetingForHour } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

const ACTIONS = [
  { to: "/speak", label: "Start AI conversation" },
  { to: "/mirror", label: "Mirror Talk" },
  { to: "/grammar", label: "Grammar practice" },
  { to: "/vocabulary", label: "Vocabulary" },
  { to: "/games", label: "Play English game" },
  { to: "/community", label: "Find a speaking partner" },
  { to: "/academy", label: "Professional English" },
] as const;

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<{
    overall: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    listening: number;
  } | null>(null);

  useEffect(() => {
    getMyProfile().then(setProfile).catch(() => {});
    latestScores()
      .then((rows) => {
        if (rows[0]) setScores(rows[0]);
      })
      .catch(() => {});
  }, []);

  if (!profile) {
    return <p className="text-muted">Loading your journey…</p>;
  }

  const band = BANDS[profile.band];
  const hour = new Date().getHours();
  const goal = profile.dailyMinutes;
  const todayMin =
    profile.lastPracticeDate === new Date().toISOString().slice(0, 10) ? Math.min(profile.practiceMinutes, goal) : 0;
  const recs =
    profile.band === "C"
      ? ["15 minutes speaking", "10 vocabulary words", "1 grammar lesson"]
      : profile.band === "B"
        ? ["20 minutes conversation", "1 listening lesson", "1 roleplay"]
        : ["Interview drill", "Project update to a manager", "Round table"];

  return (
    <div className="stagger-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {greetingForHour(hour)}, {profile.displayName}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl">Your English journey continues today.</h1>
          <p className="mt-2 text-muted">{band.dashboardTone}</p>
        </div>
        <Badge>{band.short}</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Speak for {goal} minutes today</p>
            <p className="mt-1 font-display text-2xl tabular-nums">
              {todayMin}/{goal}
            </p>
            <Progress className="mt-3" value={(todayMin / Math.max(1, goal)) * 100} />
          </div>
          <ScoreRing value={scores?.overall ?? 42} label="Overall" />
        </Card>
        {(
          [
            ["Speaking", scores?.overall ?? 42],
            ["Grammar", scores?.grammar ?? 40],
            ["Vocabulary", scores?.vocabulary ?? 38],
            ["Pronunciation", scores?.pronunciation ?? 45],
            ["Fluency", scores?.fluency ?? 40],
            ["Listening", scores?.listening ?? 44],
          ] as const
        ).map(([l, v]) => (
          <Card key={l}>
            <p className="text-sm text-muted">{l}</p>
            <p className="font-display text-3xl tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Daily streak" value={`${profile.streakDays} days`} />
        <Stat label="Practice minutes" value={String(profile.practiceMinutes)} />
        <Stat label="Words learned" value={String(profile.wordsLearned)} />
        <Stat label="Conversations" value={String(profile.conversationsCompleted)} />
      </div>

      <section>
        <h2 className="font-display text-2xl">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIONS.filter((a) => (profile.band === "C" ? a.to !== "/academy" : true)).map((a) => (
            <Button key={a.to} variant="secondary" asChild>
              <Link to={a.to}>{a.label}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">
            Recommended today · {band.cefr} → {band.targetCefr}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {recs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Button className="mt-4" asChild>
            <Link to="/lesson">Open today’s lesson</Link>
          </Button>
        </Card>
        <Card className="bg-ink text-bg">
          <p className="text-sm opacity-70">Hindi dependency</p>
          <p className="font-display text-4xl tabular-nums">{profile.hindiDependency}%</p>
          <p className="mt-2 text-sm opacity-80">
            Thinking Mode slowly reduces Hindi. Professional band practises in English only.
          </p>
          <Button variant="secondary" className="mt-4" asChild>
            <Link to="/thinking">Open Thinking Mode</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-2xl tabular-nums">{value}</p>
    </Card>
  );
}
