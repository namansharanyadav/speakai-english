import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MicButton, playVoice, useMic } from "@/components/voice";
import { LISTENING } from "@/lib/content/curriculum";
import {
  ANTONYMS,
  DIALOGUES,
  FILL_BLANK,
  GAMES,
  GRAMMAR_BATTLE,
  GUESS_CLUES,
  MATCH_PAIRS,
  PHRASALS,
  RAPID,
  SENTENCE_ROUNDS,
  SYNONYMS,
  TENSES,
  WORD_POOLS,
} from "@/lib/content/games-data";
import { saveGameScore } from "@/lib/server/learning";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/games/$id")({ component: GamePlay });

function GamePlay() {
  const { id } = Route.useParams();
  const game = GAMES.find((g) => g.id === id);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function finish(final: number) {
    setScore(final);
    setDone(true);
    await saveGameScore({ data: { gameId: id, score: final, xp: Math.max(5, final), coins: Math.ceil(final / 10) } });
    toast.success(`+${Math.max(5, final)} XP`);
  }

  if (!game) {
    return (
      <p>
        Unknown game. <Link to="/games">Back</Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="text-xs text-muted">
        <Link to="/games">Games</Link> / {game.title}
      </p>
      <h1 className="font-display text-3xl">{game.title}</h1>
      {done ? (
        <div className="rounded-3xl bg-surface p-6">
          <p className="text-sm text-muted">Score</p>
          <p className="font-display text-5xl tabular-nums">{score}</p>
          <Button className="mt-4" asChild>
            <Link to="/games">More games</Link>
          </Button>
        </div>
      ) : (
        <Play id={id} onDone={finish} />
      )}
    </div>
  );
}

function Play({ id, onDone }: { id: string; onDone: (n: number) => void }) {
  if (id === "word-builder") return <WordBuilder onDone={onDone} />;
  if (id === "sentence-builder")
    return (
      <Quiz
        onDone={onDone}
        items={SENTENCE_ROUNDS.map((r, i) => ({
          key: i,
          prompt: "Arrange: " + r.words.join(" / "),
          options: [r.answer, r.words.slice().reverse().join(" ")],
          answer: r.answer,
        }))}
      />
    );
  if (id === "grammar-battle")
    return (
      <Quiz
        onDone={onDone}
        items={GRAMMAR_BATTLE.map((g, i) => ({
          key: i,
          prompt: "Which is correct?",
          options: [g.a, g.b],
          answer: g.correct === "a" ? g.a : g.b,
        }))}
      />
    );
  if (id === "fill-blank")
    return (
      <Quiz
        onDone={onDone}
        items={FILL_BLANK.map((f, i) => ({ key: i, prompt: f.q, options: f.options, answer: f.answer }))}
      />
    );
  if (id === "vocab-match") return <MatchGame onDone={onDone} />;
  if (id === "speak-score") return <SpeakScore onDone={onDone} />;
  if (id === "guess-word") return <Guess onDone={onDone} />;
  if (id === "rapid-fire") return <Rapid onDone={onDone} />;
  if (id === "tense-challenge")
    return (
      <Quiz
        onDone={onDone}
        items={TENSES.map((t, i) => ({
          key: i,
          prompt: t.s,
          options: ["Present simple", "Present perfect", "Past continuous", "Past perfect", "Future simple"],
          answer: t.a,
        }))}
      />
    );
  if (id === "synonym-race")
    return (
      <Quiz
        onDone={onDone}
        items={SYNONYMS.map((s, i) => ({ key: i, prompt: s.w, options: s.options, answer: s.a }))}
      />
    );
  if (id === "antonym")
    return (
      <Quiz
        onDone={onDone}
        items={ANTONYMS.map((s, i) => ({ key: i, prompt: s.w, options: s.options, answer: s.a }))}
      />
    );
  if (id === "phrasal")
    return (
      <Quiz
        onDone={onDone}
        items={PHRASALS.map((s, i) => ({ key: i, prompt: s.q, options: s.options, answer: s.a }))}
      />
    );
  if (id === "listening") return <ListenGame onDone={onDone} />;
  if (id === "conversation")
    return (
      <Quiz
        onDone={onDone}
        items={DIALOGUES.map((d, i) => ({
          key: i,
          prompt: d.context + " — " + d.bot,
          options: d.options,
          answer: d.options[d.a],
        }))}
      />
    );
  return <p>Coming soon.</p>;
}

function Quiz({
  items,
  onDone,
}: {
  items: { key: number; prompt: string; options: string[]; answer: string }[];
  onDone: (n: number) => void;
}) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const item = items[i];
  if (!item) return null;
  function pick(opt: string) {
    const next = score + (opt === item.answer ? 20 : 0);
    if (i + 1 >= items.length) onDone(next);
    else {
      setScore(next);
      setI(i + 1);
    }
  }
  return (
    <div className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted">
        {i + 1} / {items.length} · {score} pts
      </p>
      <p className="mt-3 font-display text-xl">{item.prompt}</p>
      <div className="mt-4 space-y-2">
        {item.options.map((o) => (
          <button
            key={o}
            type="button"
            className="block w-full rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm hover:bg-primary-soft"
            onClick={() => pick(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function WordBuilder({ onDone }: { onDone: (n: number) => void }) {
  const pool = WORD_POOLS[0];
  const [found, setFound] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-3xl bg-surface p-5">
      <p className="font-display text-2xl tracking-[0.4em]">{pool.letters.split("").join(" ")}</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const w = draft.trim().toUpperCase();
          const hit = pool.words.includes(w) && !found.includes(w);
          const next = hit ? [...found, w] : found;
          if (hit) setFound(next);
          setDraft("");
          if (next.length >= 5) onDone(next.length * 15 + 20);
        }}
      >
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a word" />
        <Button type="submit">Add</Button>
      </form>
      <p className="mt-3 text-sm">{found.join(", ") || "No words yet"}</p>
    </div>
  );
}

function MatchGame({ onDone }: { onDone: (n: number) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const tiles = useMemo(() => {
    const t = MATCH_PAIRS.flatMap((p) => [p.en, p.hi]);
    return t.sort(() => Math.random() - 0.5);
  }, []);
  function tap(t: string) {
    if (matched.includes(t)) return;
    if (!picked) {
      setPicked(t);
      return;
    }
    const pair = MATCH_PAIRS.find((p) => (p.en === picked && p.hi === t) || (p.hi === picked && p.en === t));
    const next = pair ? [...matched, pair.en, pair.hi] : matched;
    if (pair) setMatched(next);
    setPicked(null);
    if (next.length >= MATCH_PAIRS.length * 2) onDone(80);
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => tap(t)}
          className={cn(
            "rounded-2xl px-3 py-4 text-sm",
            matched.includes(t) ? "bg-ok/20" : picked === t ? "bg-primary-soft" : "bg-surface",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SpeakScore({ onDone }: { onDone: (n: number) => void }) {
  const line = "I completed my project yesterday.";
  const mic = useMic("en-IN");
  return (
    <div className="rounded-3xl bg-surface p-5">
      <p className="font-display text-2xl">{line}</p>
      <div className="mt-4 flex gap-2">
        <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
        <Button
          onClick={() => {
            const said = mic.transcript.toLowerCase();
            const hit = line
              .toLowerCase()
              .split(" ")
              .filter((w) => said.includes(w.replace(".", ""))).length;
            onDone(Math.min(100, hit * 12));
          }}
        >
          Score me
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted">{mic.transcript}</p>
    </div>
  );
}

function Guess({ onDone }: { onDone: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const g = GUESS_CLUES[i];
  if (!g) return null;
  return (
    <div className="rounded-3xl bg-surface p-5">
      <ul className="list-disc pl-5 text-sm">
        {g.clues.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = score + (val.trim().toLowerCase() === g.answer ? 25 : 0);
          if (i + 1 >= GUESS_CLUES.length) onDone(next);
          else {
            setScore(next);
            setI(i + 1);
            setVal("");
          }
        }}
      >
        <Input value={val} onChange={(e) => setVal(e.target.value)} />
        <Button type="submit">Guess</Button>
      </form>
    </div>
  );
}

function Rapid({ onDone }: { onDone: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(10);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const finished = i >= RAPID.length;

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setI((idx) => idx + 1);
          return 10;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [i, finished]);

  useEffect(() => {
    if (finished) onDone(score);
  }, [finished, onDone, score]);

  if (finished) return null;
  const q = RAPID[i];
  return (
    <div className="rounded-3xl bg-surface p-5">
      <p className="text-xs tabular-nums">{left}s</p>
      <p className="font-display text-2xl">{q.q}</p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const add = val.trim().toLowerCase() === q.a ? 15 : 0;
          setScore((s) => s + add);
          setI((idx) => idx + 1);
          setLeft(10);
          setVal("");
        }}
      >
        <Input value={val} onChange={(e) => setVal(e.target.value)} />
        <Button type="submit">Go</Button>
      </form>
    </div>
  );
}

function ListenGame({ onDone }: { onDone: (n: number) => void }) {
  const L = LISTENING.beginner;
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const q = L.questions[i];
  if (!q) return null;
  return (
    <div className="rounded-3xl bg-surface p-5">
      <Button variant="secondary" onClick={() => void playVoice(L.script)}>
        Play audio
      </Button>
      <p className="mt-4 text-sm">{q.q}</p>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = score + (val.toLowerCase().includes(q.a) ? 40 : 0);
          if (i + 1 >= L.questions.length) onDone(next);
          else {
            setScore(next);
            setI(i + 1);
            setVal("");
          }
        }}
      >
        <Input value={val} onChange={(e) => setVal(e.target.value)} />
        <Button type="submit">Answer</Button>
      </form>
    </div>
  );
}
