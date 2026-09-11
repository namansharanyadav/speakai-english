import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatMessages, listChats, sendChat } from "@/lib/server/community";
import { askCoach } from "@/lib/server/ai";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/messages")({
  component: Messages,
  validateSearch: (s: Record<string, unknown>) => ({ chat: Number(s.chat) || undefined }),
});

function Messages() {
  const { chat } = useSearch({ from: "/_app/messages" });
  const me = useCurrentUser();
  const [chats, setChats] = useState<{ id: number; title: string | null; kind: string }[]>([]);
  const [active, setActive] = useState<number | undefined>(chat);
  const [msgs, setMsgs] = useState<{ id: number; user_id: string; body: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    listChats().then(setChats).catch(() => {});
  }, []);
  useEffect(() => {
    if (!active) return;
    chatMessages({ data: { chatId: active } }).then((rows) => setMsgs(rows.reverse())).catch(() => {});
  }, [active]);

  return (
    <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="rounded-3xl bg-surface p-3">
        <h1 className="mb-3 font-display text-xl">Messages</h1>
        {chats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={c.id === active ? "block w-full rounded-xl bg-primary-soft px-3 py-2 text-left text-sm" : "block w-full rounded-xl px-3 py-2 text-left text-sm"}
          >
            {c.title || `Chat ${c.id}`}
          </button>
        ))}
        {chats.length === 0 ? <p className="text-sm text-muted">Start a chat from Community.</p> : null}
      </aside>
      <div className="flex flex-col rounded-3xl bg-surface shadow-[var(--shadow-border)]">
        <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
          {msgs.map((m) => (
            <div key={m.id} className={m.user_id === me?.id ? "ml-auto max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-primary-fg" : "max-w-[80%] rounded-2xl bg-surface-2 px-3 py-2"}>
              {m.body}
            </div>
          ))}
          {hint ? <p className="rounded-2xl bg-primary-soft p-3 text-xs">{hint}</p> : null}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!active || !draft.trim()) return;
            await sendChat({ data: { chatId: active, body: draft } });
            if (/since two years|am go|speaks english good/i.test(draft)) {
              const res = await askCoach({
                data: { prompt: `Suggest a better English line for: ${draft}`, mode: "grammar" },
              });
              setHint(res.ok ? res.text : null);
            }
            setMsgs((m) => [...m, { id: Date.now(), user_id: me?.id ?? "", body: draft }]);
            setDraft("");
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message in English" />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
