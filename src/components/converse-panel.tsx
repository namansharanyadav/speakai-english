import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CorrectionCard } from "@/components/correction-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MicButton, SpeakButton, useMic } from "@/components/voice";
import { converse, type EvalResult } from "@/lib/server/ai";
import { awardPractice } from "@/lib/server/profile";
import { cn } from "@/lib/utils";

export function ConversePanel({
  kind,
  mode,
  topic,
  seed,
  extra,
}: {
  kind: string;
  mode?: string;
  topic?: string;
  seed?: string;
  extra?: React.ReactNode;
}) {
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>(
    seed ? [{ role: "assistant", content: seed }] : [],
  );
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaln, setEvaln] = useState<EvalResult | null>(null);
  const [cid, setCid] = useState<number | undefined>();
  const mic = useMic("en-IN");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mic.transcript) setText(mic.transcript);
  }, [mic.transcript]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, busy]);

  async function send() {
    const msg = text.trim();
    if (!msg || busy) return;
    setText("");
    mic.setTranscript("");
    setBusy(true);
    setError(null);
    const next = [...history, { role: "user" as const, content: msg }];
    setHistory(next);
    try {
      const res = await converse({
        data: {
          conversationId: cid,
          kind,
          mode,
          topic,
          history: next,
          userText: msg,
          evaluate: true,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCid(res.conversationId);
      setEvaln(res.evaluation);
      setHistory([...next, { role: "assistant", content: res.evaluation.reply }]);
      void awardPractice({ data: { minutes: 1, xp: 8, conversation: true } });
    } catch {
      setError("Could not reach the tutor. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-h-[28rem] flex-col rounded-3xl bg-surface shadow-[var(--shadow-border)]">
        {extra}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted">Start speaking. Corrections appear on the side — the chat keeps moving.</p>
          ) : null}
          {history.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                m.role === "user" ? "ml-auto bg-primary text-primary-fg" : "bg-surface-2",
              )}
            >
              <div className="flex items-start gap-1">
                <p className="flex-1 whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" ? <SpeakButton text={m.content} /> : null}
              </div>
            </div>
          ))}
          {busy ? <p className="text-sm text-muted">Listening to your English…</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div ref={endRef} />
        </div>
        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or use the microphone"
            className="min-h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
          <Button type="submit" size="icon" disabled={busy}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
      <div className="space-y-3">
        {evaln ? <CorrectionCard evaluation={evaln} /> : (
          <aside className="rounded-3xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)]">
            After you speak, grammar, Hindi explanation, and a more natural version appear here.
          </aside>
        )}
      </div>
    </div>
  );
}
