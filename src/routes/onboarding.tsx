import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BANDS, BAND_ORDER, GOALS, TOPICS, type Band } from "@/lib/bands";
import { saveOnboarding } from "@/lib/server/profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [band, setBand] = useState<Band>("C");
  const [goal, setGoal] = useState("general_fluency");
  const [minutes, setMinutes] = useState(20);
  const [topics, setTopics] = useState<string[]>(["Daily life"]);
  const [busy, setBusy] = useState(false);

  if (isPending) return <div className="grid min-h-dvh place-items-center text-muted">Loading your session…</div>;
  if (!user) return <RedirectToSignIn />;
  const account = user;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const storedPhone =
      phone || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("speakai-phone") : "") || "";
    await saveOnboarding({
      data: {
        displayName: name || account.displayName || "Learner",
        phone: storedPhone,
        nativeLanguage: "Hindi",
        band,
        goal,
        dailyMinutes: minutes,
        topics,
      },
    });
    void navigate({ to: "/assessment" });
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-10">
      <Wordmark />
      <h1 className="mt-8 font-display text-3xl">How should we teach you?</h1>
      <p className="mt-2 text-muted">
        Choose Average (C), Intermediate (B), or Professional (A). Your dashboard, AI tutor, and interview
        questions will follow this band.
      </p>
      <form className="mt-8 space-y-6" onSubmit={submit}>
        <div className="space-y-1">
          <Label htmlFor="n">Your name</Label>
          <Input id="n" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p">Mobile number</Label>
          <Input id="p" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
        </div>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Your current English</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {BAND_ORDER.map((b) => {
              const meta = BANDS[b];
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBand(b)}
                  className={cn(
                    "rounded-3xl border p-4 text-left",
                    band === b ? "border-primary bg-primary-soft" : "border-border bg-surface",
                  )}
                >
                  <p className="text-xs text-muted">{b}</p>
                  <p className="font-display text-xl">{meta.label}</p>
                  <p className="mt-1 text-xs text-muted">{meta.hindiLabel}</p>
                  <p className="mt-2 text-sm text-muted">{meta.description}</p>
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="space-y-1">
          <Label>Learning goal</Label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm",
                  goal === g.id ? "bg-ink text-bg" : "bg-surface-2 text-fg",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="m">Daily practice (minutes)</Label>
          <Input
            id="m"
            type="number"
            min={5}
            max={60}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Preferred topics</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const on = topics.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopics((prev) => (on ? prev.filter((x) => x !== t) : [...prev, t]))}
                  className={cn("rounded-full px-3 py-2 text-sm", on ? "bg-primary text-primary-fg" : "bg-surface-2")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Saving…" : "Continue to speaking check"}
        </Button>
      </form>
    </main>
  );
}
