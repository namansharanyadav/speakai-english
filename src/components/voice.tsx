import { Mic, MicOff, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { speakText } from "@/lib/server/ai";
import { cn } from "@/lib/utils";

type Recog = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function SpeechCtor(): (new () => Recog) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => Recog;
    webkitSpeechRecognition?: new () => Recog;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useMic(lang = "en-IN") {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<Recog | null>(null);

  function stop() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }

  function start() {
    const Ctor = SpeechCtor();
    if (!Ctor) {
      toast.error("Speech recognition is not available here. Please type instead.");
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (ev) => {
        let text = "";
        for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript;
        setTranscript(text.trim());
      };
      rec.onerror = (ev) => {
        setListening(false);
        if (ev.error === "not-allowed") {
          toast.error("Your microphone isn't available. Please allow microphone access and try again.");
        } else if (ev.error !== "no-speech" && ev.error !== "aborted") {
          toast.error("We could not hear that. Please try again or type your answer.");
        }
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      toast.error("Your microphone isn't available. Please allow microphone access and try again.");
    }
  }

  useEffect(() => () => stop(), []);
  return { listening, transcript, setTranscript, start, stop };
}

export async function playVoice(text: string, voice?: string) {
  try {
    const res = await speakText({ data: { text, voice } });
    if (res.ok) {
      const audio = new Audio(`data:${res.mime};base64,${res.audio}`);
      await audio.play();
      return;
    }
  } catch {
    /* fallback */
  }
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function MicButton({
  listening,
  onClick,
  className,
}: {
  listening: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={listening ? "default" : "secondary"}
      size="icon"
      onClick={onClick}
      className={cn(listening && "mic-pulse", className)}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start speaking"}
    >
      {listening ? <MicOff /> : <Mic />}
    </Button>
  );
}

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      disabled={!text || busy}
      aria-label="Play audio"
      onClick={async () => {
        setBusy(true);
        await playVoice(text);
        setBusy(false);
      }}
    >
      <Volume2 />
    </Button>
  );
}
