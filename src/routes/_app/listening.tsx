import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { playVoice } from "@/components/voice";
import { LISTENING } from "@/lib/content/curriculum";

export const Route = createFileRoute("/_app/listening")({ component: Listening });

function Listening() {
  const [level, setLevel] = useState<keyof typeof LISTENING>("beginner");
  const L = LISTENING[level];
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState("");
  const q = L.questions[i];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Listening Lab</h1>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LISTENING) as (keyof typeof LISTENING)[]).map((k) => (
          <button key={k} type="button" onClick={() => { setLevel(k); setI(0); setMsg(""); }} className={k === level ? "rounded-full bg-ink px-3 py-1 text-sm text-bg capitalize" : "rounded-full bg-surface-2 px-3 py-1 text-sm capitalize"}>
            {k}
          </button>
        ))}
      </div>
      <Card>
        <h2 className="font-display text-2xl">{L.title}</h2>
        <Button className="mt-3" variant="secondary" onClick={() => void playVoice(L.script)}>
          Play audio
        </Button>
        <p className="mt-4 text-sm">{q.q}</p>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const good = val.toLowerCase().includes(q.a.toLowerCase());
            setMsg(good ? "Yes." : `Listen again. Hint: ${q.a}`);
            if (good && i + 1 < L.questions.length) setI(i + 1);
            setVal("");
          }}
        >
          <Input value={val} onChange={(e) => setVal(e.target.value)} />
          <Button type="submit">Answer</Button>
        </form>
        {msg ? <p className="mt-2 text-sm">{msg}</p> : null}
      </Card>
    </div>
  );
}
