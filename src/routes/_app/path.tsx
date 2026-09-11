import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PATH_STEPS } from "@/lib/content/curriculum";
import { completeLesson, lessonStatus } from "@/lib/server/learning";
import { getMyProfile } from "@/lib/server/profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/path")({ component: Path });

function Path() {
  const [done, setDone] = useState<string[]>([]);
  const [band, setBand] = useState("C");
  useEffect(() => {
    lessonStatus().then((rows) => setDone(rows.filter((r) => r.status === "completed").map((r) => r.lesson_id))).catch(() => {});
    getMyProfile().then((p) => p && setBand(p.band)).catch(() => {});
  }, []);
  const unlockAt = band === "A" ? 6 : band === "B" ? 4 : 0;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-3xl">Learning path</h1>
      <ol className="space-y-3">
        {PATH_STEPS.map((s, i) => {
          const locked = i > unlockAt && !done.includes(s.id);
          return (
            <li key={s.id} className={cn("rounded-3xl p-4", locked ? "bg-surface-2 text-muted" : "bg-surface shadow-[var(--shadow-border)]")}>
              <p className="text-xs">{i + 1}</p>
              <h2 className="font-display text-xl">{s.title}</h2>
              <p className="text-sm text-muted">{s.blurb}</p>
              {locked ? (
                <p className="mt-2 text-xs">Locked until you grow into this stage.</p>
              ) : (
                <button
                  type="button"
                  className="mt-2 text-sm underline"
                  onClick={() => completeLesson({ data: { lessonId: s.id, kind: "path" } }).then(() => setDone((d) => [...d, s.id]))}
                >
                  {done.includes(s.id) ? "Completed" : "Mark complete"}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <Link to="/lesson" className="text-sm underline">
        Open today’s lesson
      </Link>
    </div>
  );
}
