import { createFileRoute } from "@tanstack/react-router";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { MicButton, SpeakButton, useMic } from "@/components/voice";
import { CHAT_MODES } from "@/lib/ai/prompts";
import { askCoach } from "@/lib/server/ai";
import { deleteConversation, listConversations, renameConversation } from "@/lib/server/learning";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai-chat")({ component: AiChat });

function AiChat() {
  const [mode, setMode] = useState("teacher");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chats, setChats] = useState<{ id: number; title: string; mode: string }[]>([]);
  const mic = useMic("en-IN");

  useEffect(() => {
    listConversations()
      .then((rows) => setChats(rows.filter((r) => r.kind === "chat" || r.kind === "coach").slice(0, 20)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (mic.transcript) setInput(mic.transcript);
  }, [mic.transcript]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setBusy(true);
    const res = await askCoach({ data: { prompt: q, mode, history: next } });
    setBusy(false);
    setMessages([...next, { role: "assistant", content: res.ok ? res.text : res.error }]);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="rounded-3xl bg-surface p-3 shadow-[var(--shadow-border)]">
        <Button className="w-full" size="sm" onClick={() => setMessages([])}>
          <Plus className="size-4" /> New chat
        </Button>
        <div className="mt-3 space-y-1">
          {chats.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl px-2 py-2 text-sm hover:bg-surface-2">
              <span className="truncate">{c.title}</span>
              <button
                type="button"
                className="p-1 text-muted"
                onClick={() => deleteConversation({ data: { id: c.id } }).then(() => setChats((x) => x.filter((i) => i.id !== c.id)))}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex min-h-[32rem] flex-col rounded-3xl bg-surface shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap gap-1 border-b border-border p-3">
          {Object.keys(CHAT_MODES).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn("rounded-full px-3 py-1 text-xs capitalize", mode === m ? "bg-ink text-bg" : "bg-surface-2")}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {["Explain present perfect in Hindi.", "Correct: I am working here since two years.", "Give me a 1-minute interview intro.", "Debate: remote work vs office."].map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-2xl bg-surface-2 p-3 text-left text-sm"
                    onClick={() => void send(s)}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          ) : null}
          {messages.map((m, i) => (
            <div key={i} className={cn("rounded-2xl p-3 text-sm", m.role === "user" ? "ml-12 bg-primary-soft" : "mr-6 bg-surface-2")}>
              <div className="flex justify-between gap-2">
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" ? (
                  <div className="flex">
                    <SpeakButton text={m.content} />
                    <button type="button" className="p-2" onClick={() => { void navigator.clipboard.writeText(m.content); toast.success("Copied"); }}>
                      <Copy className="size-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {busy ? <p className="text-sm text-muted">Writing…</p> : null}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your English coach" className="min-h-12" />
          <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}

void Input;
void renameConversation;
