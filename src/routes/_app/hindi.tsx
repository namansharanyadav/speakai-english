import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CorrectionCard } from "@/components/correction-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MicButton, useMic } from "@/components/voice";
import { HINDI_PROMPTS } from "@/lib/content/curriculum";
import { evaluateSpeech, type EvalResult } from "@/lib/server/ai";
import { saveVocabProgress } from "@/lib/server/learning";

export const Route = createFileRoute("/_app/hindi")({ component: HindiTrainer });

function HindiTrainer() {
  const [i, setI] = useState(0);
  const [draft, setDraft] = useState("");
  const [evaln, setEvaln] = useState<EvalResult | null>(null);
  const [busy, setBusy] = useState(false);
  const mic = useMic("en-IN");
  const item = HINDI_PROMPTS[i % HINDI_PROMPTS.length];

  async function check() {
    const text = (draft || mic.transcript).trim();
    if (!text) return;
    setBusy(true);
    const res = await evaluateSpeech({
      data: { transcript: text, prompt: `Translate to English: ${item.hi}. Expected like: ${item.en}`, kind: "hindi" },
    });
    setBusy(false);
    if (res.ok) setEvaln(res.evaluation);
    void saveVocabProgress({ data: { word: item.en.split(" ")[1] || "translation", category: "hindi", status: "learning" } });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl">Hindi → English</h1>
        <p className="mt-1 text-sm text-muted">See Hindi. Speak English. Learn to think directly in English.</p>
        <div className="mt-6 rounded-3xl bg-ink p-6 text-bg">
          <p className="text-xs opacity-70">Hindi prompt</p>
          <p className="mt-2 font-display text-2xl leading-snug">{item.hi}</p>
        </div>
        <Textarea className="mt-4 min-h-28" value={draft || mic.transcript} onChange={(e) => setDraft(e.target.value)} placeholder="Speak or type the English" />
        <div className="mt-3 flex gap-2">
          <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
          <Button onClick={() => void check()} disabled={busy}>{busy ? "Checking…" : "Check"}</Button>
          <Button variant="ghost" onClick={() => { setI(i + 1); setEvaln(null); setDraft(""); mic.setTranscript(""); }}>
            Next
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <Version k="Basic" v={item.en} />
        <Version k="Natural" v={item.natural} />
        <Version k="Advanced" v={item.advanced} />
        {evaln ? <CorrectionCard evaluation={evaln} /> : null}
      </div>
    </div>
  );
}

function Version({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted">{k}</p>
      <p className="mt-1">{v}</p>
    </div>
  );
}
