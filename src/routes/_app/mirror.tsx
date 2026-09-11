import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CorrectionCard } from "@/components/correction-card";
import { Button } from "@/components/ui/button";
import { MIRROR_TOPICS } from "@/lib/content/curriculum";
import { evaluateSpeech, type EvalResult } from "@/lib/server/ai";
import { useMic } from "@/components/voice";

export const Route = createFileRoute("/_app/mirror")({ component: Mirror });

function Mirror() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [topic, setTopic] = useState(MIRROR_TOPICS[0]);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(120);
  const [evaln, setEvaln] = useState<EvalResult | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const mic = useMic("en-IN");
  const timer = useRef<number | null>(null);

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamError(null);
    } catch {
      setCamError("Camera is blocked. Please allow camera access to use Mirror Talk. You can still speak with the microphone.");
    }
  }

  useEffect(() => {
    void startCam();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function start() {
    setEvaln(null);
    setRunning(true);
    setSeconds(120);
    mic.start();
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          void finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function finish() {
    setRunning(false);
    mic.stop();
    if (timer.current) window.clearInterval(timer.current);
    const transcript = mic.transcript || "I tried to speak about this topic.";
    const res = await evaluateSpeech({ data: { transcript, prompt: topic, kind: "mirror" } });
    if (res.ok) setEvaln(res.evaluation);
    else toast.error(res.error);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl">Look at yourself. Speak for 2 minutes.</h1>
        <p className="mt-1 text-sm text-muted">The AI listens through your microphone. Replay lives in the transcript below.</p>
        <video ref={videoRef} autoPlay muted playsInline className="mt-4 aspect-[4/3] w-full rounded-3xl bg-ink object-cover" />
        {camError ? <p className="mt-2 text-sm text-danger">{camError}</p> : null}
        <p className="mt-3 font-display text-4xl tabular-nums">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p>
        <div className="mt-3 flex gap-2">
          {!running ? (
            <Button onClick={start}>Start speaking</Button>
          ) : (
            <Button variant="secondary" onClick={() => void finish()}>Finish early</Button>
          )}
        </div>
        {mic.transcript ? <p className="mt-4 rounded-2xl bg-surface p-3 text-sm">{mic.transcript}</p> : null}
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium">Topics</p>
        <div className="flex flex-wrap gap-2">
          {MIRROR_TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={t === topic ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full bg-surface-2 px-3 py-1 text-sm"}
            >
              {t}
            </button>
          ))}
        </div>
        {evaln ? <CorrectionCard evaluation={evaln} /> : <p className="text-sm text-muted">Your grammar, fillers, and fluency report will land here.</p>}
      </div>
    </div>
  );
}
