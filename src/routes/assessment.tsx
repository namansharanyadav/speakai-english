import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MicButton, useMic } from "@/components/voice";
import { BANDS, type Band } from "@/lib/bands";
import { INTERVIEW } from "@/lib/content/curriculum";
import { recommendBand } from "@/lib/server/ai";
import { completeAssessment, getMyProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/assessment")({ component: Assessment });

function Assessment() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [band, setBand] = useState<Band>("C");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ band: Band; rationale?: string; hindi?: string } | null>(null);
  const mic = useMic("en-IN");

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        if (p?.band) setBand(p.band);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mic.transcript) setDraft(mic.transcript);
  }, [mic.transcript]);

  if (isPending) return <div className="grid min-h-dvh place-items-center text-muted">Loading…</div>;
  if (!user) return <RedirectToSignIn />;

  const questions = INTERVIEW[band];
  const q = questions[step];

  async function finish(answersToUse: string[], skipAi = false) {
    setBusy(true);
    const pairs = questions.map((item, i) => ({ prompt: item.prompt, answer: answersToUse[i] ?? "" }));
    let finalBand: Band = band;
    let rationale: string | undefined =
      "We used the level you chose. This is an AI estimate, not an official CEFR certificate.";
    let hindi: string | undefined;
    try {
      if (!skipAi) {
        const rec = await recommendBand({ data: { answers: pairs, chosenBand: band } });
        if (rec.ok) {
          finalBand = rec.band;
          rationale = rec.rationale ?? rec.note ?? rationale;
          hindi = rec.hindi_note;
        }
        await completeAssessment({
          data: {
            recommendedBand: finalBand,
            scores: rec.ok ? rec.evaluation.scores : {},
            transcript: pairs.map((p) => p.answer).join(" "),
          },
        });
      } else {
        await completeAssessment({
          data: { recommendedBand: band, scores: {}, transcript: pairs.map((p) => p.answer).join(" ") },
        });
      }
    } catch {
      await completeAssessment({
        data: { recommendedBand: band, scores: {}, transcript: pairs.map((p) => p.answer).join(" ") },
      }).catch(() => {});
      finalBand = band;
    }
    setDone({ band: finalBand, rationale, hindi });
    setBusy(false);
  }

  async function next() {
    const text = draft.trim();
    if (!text) return;
    const nextAnswers = [...answers, text];
    setAnswers(nextAnswers);
    setDraft("");
    mic.setTranscript("");
    if (step + 1 < questions.length) {
      setStep(step + 1);
      return;
    }
    await finish(nextAnswers);
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-10">
      <Wordmark />
      <p className="mt-8 text-xs font-medium tracking-wide text-muted uppercase">Speaking check · Band {band}</p>
      <h1 className="mt-2 font-display text-3xl">Introduce yourself in English</h1>
      <p className="mt-2 text-sm text-muted">
        This is an AI estimate, not an official CEFR certificate. Speak or type. We listen for grammar, fluency,
        and how naturally you sound.
      </p>

      {done ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl bg-surface p-6 shadow-[var(--shadow-border)]">
            <p className="text-sm text-muted">Estimated starting level</p>
            <p className="font-display text-3xl">{BANDS[done.band].short}</p>
            <p className="mt-2 text-sm text-muted">{done.rationale}</p>
            {done.hindi ? <p className="mt-2 text-sm">{done.hindi}</p> : null}
          </div>
          <Button size="lg" onClick={() => navigate({ to: "/dashboard" })}>
            Go to your dashboard
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs text-muted">
              Question {step + 1} of {questions.length}
            </p>
            <p className="mt-2 font-display text-2xl">{q.prompt}</p>
            <p className="mt-2 text-sm text-muted">{q.hint}</p>
            <Textarea
              className="mt-4 min-h-32"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Speak or type your answer"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
              <Button onClick={() => void next()} disabled={busy || !draft.trim()}>
                {busy ? "Reviewing…" : step + 1 === questions.length ? "Finish check" : "Next"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => void finish(answers, true)}
              >
                Skip and use my chosen level
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
