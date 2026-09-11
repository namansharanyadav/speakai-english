import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MicButton, SpeakButton, useMic } from "@/components/voice";
import { translateText } from "@/lib/server/ai";

export const Route = createFileRoute("/_app/translator")({ component: Translator });

function Translator() {
  const [dir, setDir] = useState<"en" | "hi">("hi");
  const [src, setSrc] = useState("");
  const [out, setOut] = useState<{ translation?: string; transliteration?: string; notes?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const mic = useMic(dir === "hi" ? "en-IN" : "hi-IN");
  useEffect(() => {
    if (mic.transcript) setSrc(mic.transcript);
  }, [mic.transcript]);

  async function run() {
    const text = src.trim();
    if (!text) return;
    setBusy(true);
    const res = await translateText({
      data: { text, source: "auto", target: dir },
    });
    setBusy(false);
    if (res.ok) setOut(res);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl">Voice translator</h1>
        <p className="text-sm text-muted">Record English or Hindi. Convert either way. Use this when a page feels unclear too.</p>
        <div className="mt-4 flex gap-2">
          <Button variant={dir === "hi" ? "default" : "secondary"} onClick={() => setDir("hi")}>
            English → Hindi
          </Button>
          <Button variant={dir === "en" ? "default" : "secondary"} onClick={() => setDir("en")}>
            Hindi → English
          </Button>
        </div>
        <Textarea className="mt-4 min-h-40" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="Type or record" />
        <div className="mt-3 flex gap-2">
          <MicButton listening={mic.listening} onClick={() => (mic.listening ? mic.stop() : mic.start())} />
          <Button onClick={() => void run()} disabled={busy}>
            {busy ? "Translating…" : "Translate"}
          </Button>
        </div>
      </div>
      <div className="rounded-3xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="flex items-start justify-between">
          <p className="text-xs text-muted">Result</p>
          {out?.translation ? <SpeakButton text={out.translation} /> : null}
        </div>
        <p className="mt-3 font-display text-2xl leading-snug">{out?.translation || "Your translation will appear here."}</p>
        {out?.transliteration ? <p className="mt-2 text-sm text-muted">{out.transliteration}</p> : null}
        {out?.notes ? <p className="mt-4 text-sm">{out.notes}</p> : null}
      </div>
    </div>
  );
}
