import { HelpCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HELP_STARTERS } from "@/lib/content/help-kb";
import { askCoach } from "@/lib/server/ai";
import { cn } from "@/lib/utils";

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "I am the SpeakAI guide. Ask how to practise speaking, change your level, use the microphone, or join a room.",
    },
  ]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await askCoach({
        data: { prompt: q, mode: "guide", history: next.slice(-8) },
      });
      setMessages([
        ...next,
        { role: "assistant", content: res.ok ? res.text : res.error },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Sign in to get a live guide. Meanwhile: start on Dashboard, tap Speak to talk with AI, and allow the microphone when asked.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-20 z-40 md:bottom-6">
      {open ? (
        <div className="mb-3 flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col rounded-3xl bg-surface shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium">How SpeakAI works</p>
            <button type="button" className="rounded-full p-1 hover:bg-surface-2" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2",
                  m.role === "user" ? "ml-auto bg-primary text-primary-fg" : "bg-surface-2",
                )}
              >
                {m.content}
              </div>
            ))}
            {!busy && messages.length < 3 ? (
              <div className="flex flex-wrap gap-2">
                {HELP_STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-surface-2"
                    onClick={() => send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask how to use SpeakAI" />
            <Button type="submit" size="icon" disabled={busy}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="shadow-md"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <HelpCircle className="size-4" />
        Guide
      </Button>
    </div>
  );
}
