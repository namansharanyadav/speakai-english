import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BANDS, type Band } from "@/lib/bands";
import { adminOverview, adminSetRole, adminUserDetail } from "@/lib/server/admin";

export const Route = createFileRoute("/_app/admin")({ component: Admin });

function Admin() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminOverview>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof adminUserDetail>> | null>(null);

  useEffect(() => {
    adminOverview()
      .then(setData)
      .catch(() => setErr("Admin only. The first learner on this app is promoted automatically."));
  }, []);

  if (err) return <p className="text-sm text-muted">{err}</p>;
  if (!data) return <p className="text-muted">Loading admin…</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Admin</h1>
      <p className="text-sm text-muted">
        Every practice event is logged. Open a learner to see the dashboard their band produces.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat k="Learners" v={data.counts?.learners ?? 0} />
        <Stat k="Premium" v={data.counts?.premium ?? 0} />
        <Stat k="Conversations" v={data.counts?.conversations ?? 0} />
        <Stat k="Reports" v={data.counts?.reports ?? 0} />
      </div>
      <div className="flex flex-wrap gap-2">
        {data.bands.map((b) => (
          <Badge key={b.band}>
            {BANDS[b.band as Band]?.label ?? b.band} · {b.c}
          </Badge>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="p-3">Learner</th>
              <th className="p-3">Band</th>
              <th className="p-3">Plan</th>
              <th className="p-3">XP</th>
              <th className="p-3">Minutes</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.user_id} className="border-t border-border">
                <td className="p-3">
                  {u.display_name}
                  <span className="block text-xs text-muted">{u.public_id}</span>
                </td>
                <td className="p-3">{BANDS[u.band as Band]?.label ?? u.band}</td>
                <td className="p-3">{u.plan}</td>
                <td className="p-3 tabular-nums">{u.xp}</td>
                <td className="p-3 tabular-nums">{u.practice_minutes}</td>
                <td className="p-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => adminUserDetail({ data: { userId: u.user_id } }).then(setDetail)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      adminSetRole({ data: { userId: u.user_id, role: u.role === "admin" ? "learner" : "admin" } })
                    }
                  >
                    {u.role === "admin" ? "Demote" : "Make admin"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail?.profile ? (
        <Card>
          <h2 className="font-display text-2xl">{detail.profile.display_name}</h2>
          <p className="text-sm text-muted">
            Band {detail.profile.band} · this learner sees a {BANDS[detail.profile.band as Band]?.label} dashboard
            after login.
          </p>
          <pre className="mt-3 max-h-64 overflow-auto text-xs">{JSON.stringify(detail.mistakes, null, 2)}</pre>
        </Card>
      ) : null}
      <div>
        <h2 className="font-display text-xl">Live activity</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {data.activity.map((a, i) => (
            <li key={i}>
              {a.action} · {a.user_id.slice(0, 8)} · {a.created_at}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{k}</p>
      <p className="font-display text-3xl tabular-nums">{v}</p>
    </Card>
  );
}
