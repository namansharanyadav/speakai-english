import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SpeakButton } from "@/components/voice";
import { VOCABULARY, VOCAB_CATEGORIES } from "@/lib/content/curriculum";
import { myVocab, saveVocabProgress } from "@/lib/server/learning";

export const Route = createFileRoute("/_app/vocabulary")({ component: Vocab });

function Vocab() {
  const [cat, setCat] = useState<string>("Office");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [sentence, setSentence] = useState("");
  useEffect(() => {
    myVocab()
      .then((rows) => setStatus(Object.fromEntries(rows.map((r) => [r.word, r.status]))))
      .catch(() => {});
  }, []);
  const list = useMemo(
    () =>
      VOCABULARY.filter(
        (w) => (cat === "All" || w.category === cat) && (!q || w.word.toLowerCase().includes(q.toLowerCase()) || w.hindi.includes(q)),
      ),
    [cat, q],
  );
  const [open, setOpen] = useState(list[0]?.word ?? "Reliable");
  const word = VOCABULARY.find((w) => w.word === open) ?? list[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="space-y-1">
        <h1 className="mb-3 font-display text-3xl">Vocabulary</h1>
        {["All", ...VOCAB_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={c === cat ? "block w-full rounded-2xl bg-primary-soft px-3 py-2 text-left text-sm" : "block w-full rounded-2xl px-3 py-2 text-left text-sm text-muted"}
          >
            {c}
          </button>
        ))}
      </aside>
      <div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search English or Hindi" />
        <div className="mt-3 flex flex-wrap gap-2">
          {list.map((w) => (
            <button
              key={w.word}
              type="button"
              onClick={() => setOpen(w.word)}
              className={w.word === open ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}
            >
              {w.word}
            </button>
          ))}
        </div>
        {word ? (
          <Card className="mt-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-3xl">{word.word}</h2>
                <p className="text-muted">{word.pronunciation}</p>
              </div>
              <SpeakButton text={word.word} />
            </div>
            <p className="text-lg">{word.hindi}</p>
            <p>{word.meaning}</p>
            <p className="text-sm italic">{word.example}</p>
            <p className="text-sm text-muted">{word.hindiExample}</p>
            <p className="text-sm">Synonyms: {word.synonyms.join(", ") || "—"}</p>
            <p className="text-sm">Antonyms: {word.antonyms.join(", ") || "—"}</p>
            <p className="text-sm text-muted">{word.usage}</p>
            <Input value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="Write your own sentence with this word" />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  void saveVocabProgress({ data: { word: word.word, category: word.category, status: "known" } });
                  setStatus((s) => ({ ...s, [word.word]: "known" }));
                }}
              >
                I know this
              </Button>
              <span className="self-center text-xs text-muted">{status[word.word] ?? "new"}</span>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
