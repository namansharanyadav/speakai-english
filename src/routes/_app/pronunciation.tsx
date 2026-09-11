import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MicButton, SpeakButton, useMic } from "@/components/voice";
import { evaluateSpeech } from "@/lib/server/ai";

export const Route = createFileRoute("/_app/pronunciation")({ component: Pronunciation });

const DRILLS = [
  { sound: "v / w", word: "very well", tip: "Hindi speakers often mix v and w. Bite the lip for v." },
  { sound: "th", word: "think this", tip: "Tongue between teeth for th in think." },
  { sound: "r", word: "red river", tip: "English r is not a tap. Keep the tongue bunched." },
  { sound: "p / f", word: "coffee copy", tip: "f is teeth on lip. p is a burst of air." },
];

function Pronunciation() {
  const [i, setI] = useState(0);
  const [note, setNote] = useState("");
  const mic = useMic("en-IN");
  const d = DRILLS[i];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Pronunciation</h1>
      <p className="text-sm text-muted">Word and sentence practice for sounds that often trip Hindi speakers.</p>
      <div className="flex flex-wrap gap-2">
        {DRILLS.map((x, idx) => (
          <button key={x.sound} type="button" onClick={() => setI(idx)} className={idx === i ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}>
            {x.sound}
          </button>
        ))}
      </div>
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-display text-3xl">{d.word}</p>
          <p className="mt-2 text-sm text-muted">{d.tip}</p>
        </div>
        <SpeakButton text={d.word} />
      </Card>
      <div className="flex gap-2">
        <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
        <Button
          onClick={async () => {
            const res = await evaluateSpeech({
              data: { transcript: mic.transcript || d.word, prompt: `Pronounce: ${d.word}. Sound focus ${d.sound}`, kind: "pronunciation" },
            });
            setNote(res.ok ? `${res.evaluation.reply} · score ${res.evaluation.scores.pronunciation}` : res.error);
          }}
        >
          Score this attempt
        </Button>
      </div>
      {mic.transcript ? <p className="text-sm">{mic.transcript}</p> : null}
      {note ? <p className="rounded-2xl bg-surface p-3 text-sm">{note}</p> : null}
    </div>
  );
}
