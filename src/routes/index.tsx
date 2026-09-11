import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Mic2, Sparkles } from "lucide-react";
import { HelpWidget } from "@/components/help-widget";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FEATURE_WHY } from "@/lib/content/curriculum";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Wordmark />
        <div className="flex items-center gap-2">
          <SignedOut>
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Start free</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:py-16">
        <div className="stagger-in">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Think English. Speak confidently.</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Speak English confidently. Practice with AI. Talk with the world.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Learn English from Hindi with personalized AI conversations, instant corrections, real speaking
            practice, games, and professional communication training.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/login">
                Start learning free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/login">Talk with AI</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Practice speaking</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">Hindi + English interface. Built for learners in India.</p>
        </div>
        <HeroDashboard />
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl">Why SpeakAI?</h2>
          <p className="mt-2 max-w-2xl text-muted">
            A speaking academy, an AI tutor, a conversation partner, a game room, and a community — in one
            calm workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_WHY.map((f) => (
              <article key={f.title} className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-3">
        {[
          { k: "C", t: "Average", d: "Hindi support, short sentences, daily confidence." },
          { k: "B", t: "Intermediate", d: "Real conversations. Hindi only when it helps." },
          { k: "A", t: "Professional", d: "Interviews, stand-ups, clients, leadership English." },
        ].map((b) => (
          <article key={b.k} className="rounded-3xl bg-ink p-6 text-bg">
            <p className="text-xs tracking-[0.2em] uppercase opacity-70">Band {b.k}</p>
            <h3 className="mt-2 font-display text-2xl">{b.t}</h3>
            <p className="mt-2 text-sm opacity-80">{b.d}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl">Free to start. Premium when you are ready.</h2>
            <p className="mt-2 text-muted">Core lessons stay open. Unlimited AI speaking is on Premium.</p>
          </div>
          <Button size="lg" asChild>
            <Link to="/login">Create your account</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Wordmark />
          <p>Think English. Speak confidently.</p>
        </div>
      </footer>
      <HelpWidget />
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="dark rounded-[2rem] bg-bg p-4 text-fg shadow-[var(--shadow-border)]">
      <div className="rounded-[1.4rem] bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">SpeakAI Coach</p>
          <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-xs text-primary">
            <Mic2 className="size-3" /> Live
          </span>
        </div>
        <p className="mt-6 font-display text-2xl">Hi. How was your day?</p>
        <div className="mt-4 rounded-2xl bg-surface-2 p-4">
          <p className="text-sm">My day was very good because I complete my project.</p>
        </div>
        <div className="mt-3 rounded-2xl border border-border p-4">
          <p className="flex items-center gap-2 text-xs text-primary">
            <Check className="size-3" /> I completed my project.
          </p>
          <p className="mt-2 text-sm text-muted">
            यहाँ ‘completed’ इस्तेमाल होगा क्योंकि आप बीते हुए समय की बात कर रहे हैं।
          </p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Speaking", "72"],
            ["Grammar", "64"],
            ["Words", "128"],
          ].map(([l, n]) => (
            <div key={l} className="rounded-2xl bg-surface-2 p-3">
              <p className="text-xs text-muted">{l}</p>
              <p className="font-display text-xl tabular-nums">{n}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Sparkles className="size-3 text-primary" /> Vocabulary · reliable, concise, follow up
        </p>
      </div>
    </div>
  );
}
