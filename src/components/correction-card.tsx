import { SpeakButton } from "@/components/voice";
import type { EvalResult } from "@/lib/server/ai";

export function CorrectionCard({ evaluation }: { evaluation: EvalResult }) {
  const s = evaluation.scores;
  const items = [
    ["Grammar", s.grammar],
    ["Naturalness", s.naturalness],
    ["Pronunciation", s.pronunciation],
    ["Fluency", s.fluency],
  ] as const;
  if (!evaluation.original_sentence && !evaluation.corrected_sentence) return null;
  return (
    <aside className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Speaking check</p>
      {evaluation.original_sentence ? (
        <div className="mt-3">
          <p className="text-xs text-muted">Your sentence</p>
          <p className="text-sm">{evaluation.original_sentence}</p>
        </div>
      ) : null}
      {evaluation.corrected_sentence ? (
        <div className="mt-3">
          <p className="text-xs text-ok">Correct sentence</p>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{evaluation.corrected_sentence}</p>
            <SpeakButton text={evaluation.corrected_sentence} />
          </div>
        </div>
      ) : null}
      {evaluation.natural_sentence && evaluation.natural_sentence !== evaluation.corrected_sentence ? (
        <div className="mt-3">
          <p className="text-xs text-muted">More natural</p>
          <p className="text-sm">{evaluation.natural_sentence}</p>
        </div>
      ) : null}
      {evaluation.hindi_explanation ? (
        <div className="mt-3 rounded-2xl bg-surface-2 p-3">
          <p className="text-xs text-muted">Hindi explanation</p>
          <p className="text-sm leading-relaxed">{evaluation.hindi_explanation}</p>
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map(([label, val]) => (
          <div key={label} className="rounded-2xl bg-surface-2 px-3 py-2">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="font-display text-lg tabular-nums">{Math.round(val || 0)}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function ScoreRing({ value, label, size = 88 }: { value: number; label: string; size?: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 72 72" className="absolute inset-0 -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" className="text-surface-2" strokeWidth="8" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="8"
            strokeDasharray={`${(v / 100) * c} ${c}`}
            strokeLinecap="round"
          />
        </svg>
        <p className="font-display text-lg tabular-nums">{Math.round(v)}</p>
      </div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
