import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Moon, Search, Sun, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { HelpWidget } from "@/components/help-widget";
import { Wordmark } from "@/components/logo";
import { useTheme } from "@/components/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BANDS } from "@/lib/bands";
import { MOBILE_NAV, MORE_NAV, PRIMARY_NAV } from "@/lib/nav";
import { notifications as fetchNotes, markNotifications, searchAll } from "@/lib/server/learning";
import type { Profile } from "@/lib/server/profile";
import { cn } from "@/lib/utils";

function NavLinks({ onGo, path, isAdmin }: { onGo?: () => void; path: string; isAdmin?: boolean }) {
  return (
    <nav className="flex flex-col gap-1">
      {PRIMARY_NAV.map((item) => {
        const active = path === item.to || path.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onGo}
            className={cn(
              "flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium",
              active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <p className="mt-4 px-3 text-[11px] font-medium tracking-wide text-faint uppercase">Studio</p>
      {MORE_NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onGo}
          className={cn(
            "flex h-10 items-center rounded-2xl px-3 text-sm",
            path === item.to ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
          )}
        >
          {item.label}
        </Link>
      ))}
      {isAdmin ? (
        <Link
          to="/admin"
          onClick={onGo}
          className={cn(
            "mt-2 flex h-10 items-center rounded-2xl px-3 text-sm font-medium",
            path === "/admin" ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
          )}
        >
          Admin
        </Link>
      ) : null}
    </nav>
  );
}

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { resolved, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ vocab: string[]; grammar: string[]; users: { name: string; publicId: string }[] } | null>(null);
  const [notes, setNotes] = useState<{ id: number; title: string; body: string; read: boolean }[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const navigate = useNavigate();
  const band = BANDS[profile.band];
  const unread = notes.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotes()
      .then(setNotes)
      .catch(() => setNotes([]));
  }, []);

  async function onSearch(v: string) {
    setQ(v);
    if (v.trim().length < 2) {
      setHits(null);
      return;
    }
    const res = await searchAll({ data: { q: v } });
    setHits(res);
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="mb-6 px-1" onClick={() => setOpen(false)}>
        <Wordmark />
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <NavLinks path={path} onGo={() => setOpen(false)} isAdmin={profile.role === "admin"} />
      </div>
      <div className="mt-4 rounded-2xl bg-surface-2 p-3">
        <p className="text-xs text-muted">Level</p>
        <p className="font-medium">{band.short}</p>
        <p className="text-xs text-muted">
          {band.cefr} → {band.targetCefr}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-bg p-5 lg:block">{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-sm">
          <button type="button" className="rounded-full p-2 hover:bg-surface-2 lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
            <Input
              value={q}
              onChange={(e) => void onSearch(e.target.value)}
              placeholder="Search lessons, words, people"
              className="pl-9"
              aria-label="Search"
            />
            {hits ? (
              <div className="absolute top-12 z-40 w-full rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                {hits.vocab.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className="block w-full rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-2"
                    onClick={() => {
                      setHits(null);
                      void navigate({ to: "/vocabulary" });
                    }}
                  >
                    Word · {w}
                  </button>
                ))}
                {hits.grammar.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className="block w-full rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-2"
                    onClick={() => {
                      setHits(null);
                      void navigate({ to: "/grammar" });
                    }}
                  >
                    Grammar · {g}
                  </button>
                ))}
                {hits.users.map((u) => (
                  <p key={u.publicId} className="px-2 py-2 text-sm">
                    {u.name} · {u.publicId}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <Badge variant="muted" className="hidden sm:inline-flex">
            {profile.plan === "premium" ? "Premium" : "Free"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          >
            {resolved === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => {
                setShowNotes((v) => !v);
                void markNotifications();
              }}
            >
              <Bell className="size-4" />
            </Button>
            {unread ? (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            ) : null}
            {showNotes ? (
              <div className="absolute top-12 right-0 z-40 w-72 rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted">No notifications yet.</p>
                ) : (
                  notes.slice(0, 6).map((n) => (
                    <div key={n.id} className="border-b border-border py-2 last:border-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <Link to="/settings" className="hidden text-sm text-muted hover:text-fg sm:inline">
            Settings
          </Link>
          <div className="hidden md:block">
            <UserButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 lg:pb-10">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg/95 px-2 py-2 backdrop-blur-sm lg:hidden">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <Link to="/settings" className="flex h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-muted">
          <UserRound className="size-5" />
          You
        </Link>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-5">
          {sidebar}
        </SheetContent>
      </Sheet>
      <HelpWidget />
    </div>
  );
}
