import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { GAMES } from "@/lib/content/games-data";
import { leaderboard } from "@/lib/server/learning";

export const Route = createFileRoute("/_app/games/")({ component: GamesHome });

function GamesHome() {
  const [board, setBoard] = useState<{ display_name: string; xp: number; band: string }[]>([]);
  useEffect(() => {
    leaderboard().then(setBoard).catch(() => {});
  }, []);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div>
        <h1 className="font-display text-3xl">English Games</h1>
        <p className="mt-1 text-sm text-muted">XP, coins, streaks, and a weekly board. Play in short bursts.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => (
            <Link
              key={g.id}
              to="/games/$id"
              params={{ id: g.id }}
              className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-border)] hover:bg-surface-2"
            >
              <h2 className="font-medium">{g.title}</h2>
              <p className="mt-1 text-sm text-muted">{g.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
      <Card>
        <h2 className="font-medium">Leaderboard</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {board.map((b, i) => (
            <li key={b.display_name + i} className="flex justify-between">
              <span>
                {i + 1}. {b.display_name}
              </span>
              <span className="tabular-nums text-muted">{b.xp} XP</span>
            </li>
          ))}
          {board.length === 0 ? <li className="text-muted">Play a round to appear here.</li> : null}
        </ol>
      </Card>
    </div>
  );
}
