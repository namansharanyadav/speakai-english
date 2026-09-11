import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { P2PRoom } from "@/lib/multiplayer";
import { getCall } from "@/lib/server/community";
import { getMyProfile } from "@/lib/server/profile";
import { evaluateSpeech } from "@/lib/server/ai";

export const Route = createFileRoute("/_app/call/$code")({ component: CallRoom });

function CallRoom() {
  const { code } = Route.useParams();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ai, setAi] = useState(false);
  const [status, setStatus] = useState("Connecting…");
  const [chat, setChat] = useState<{ from: string; body: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [peerName, setPeerName] = useState("Partner");
  const roomRef = useRef<P2PRoom | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      const profile = await getMyProfile();
      const call = await getCall({ data: { code } });
      if (!call) {
        setStatus("This call is not available.");
        return;
      }
      setPeerName(call.to_id ? "Learner" : "Open room");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;
      } catch {
        toast.error("Your camera or microphone isn't available. Please allow access and try again.");
      }
      const selfId = (profile?.publicId || "peer").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16) || "peer";
      const p2p = new P2PRoom({
        room: "call-" + code,
        selfId,
        name: profile?.displayName || "You",
        onPeersChanged: (peers) => {
          if (dead) return;
          setStatus(peers.length ? `Connected · ${peers.length} other` : "Waiting for the other person…");
          setPeerName(peers[0]?.name || "Partner");
        },
        onMessage: (from, data) => {
          if (data && typeof data === "object" && "body" in (data as { body?: string })) {
            setChat((c) => [...c, { from, body: String((data as { body: string }).body) }]);
          }
        },
      });
      roomRef.current = p2p;
      await p2p.join();
    })();
    return () => {
      dead = true;
      roomRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [code]);

  function toggle(kind: "audio" | "video") {
    streamRef.current?.getTracks().forEach((t) => {
      if (t.kind === kind) t.enabled = !t.enabled;
    });
    if (kind === "audio") setMicOn((v) => !v);
    else setCamOn((v) => !v);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <p className="text-sm text-muted">Calling {peerName}</p>
        <p className="text-xs text-faint">Room {code}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <video ref={localRef} autoPlay muted playsInline className="aspect-video w-full rounded-3xl bg-ink object-cover" />
          <video ref={remoteRef} autoPlay playsInline className="aspect-video w-full rounded-3xl bg-ink object-cover" />
        </div>
        <p className="mt-2 text-sm text-muted">{status}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="icon" onClick={() => toggle("audio")} aria-label="Microphone">
            {micOn ? <Mic /> : <MicOff />}
          </Button>
          <Button variant="secondary" size="icon" onClick={() => toggle("video")} aria-label="Camera">
            {camOn ? <Video /> : <VideoOff />}
          </Button>
          <Button variant="secondary" size="icon" aria-label="Share screen" onClick={async () => {
            try {
              await navigator.mediaDevices.getDisplayMedia({ video: true });
              toast.message("Screen sharing started on this device.");
            } catch {
              toast.error("Screen sharing was blocked.");
            }
          }}>
            <MonitorUp />
          </Button>
          <Button variant="danger" asChild>
            <Link to="/calls">
              <PhoneOff className="size-4" /> End
            </Link>
          </Button>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <Switch checked={ai} onCheckedChange={setAi} />
          After-call AI analysis (grammar and fluency). Audio is processed only if this is on.
        </label>
        {ai ? (
          <Button
            className="mt-3"
            variant="secondary"
            onClick={async () => {
              const res = await evaluateSpeech({
                data: { transcript: chat.map((c) => c.body).join(" ") || "We practised speaking together.", prompt: "Post-call review", kind: "call" },
              });
              toast.message(res.ok ? res.evaluation.reply : res.error);
            }}
          >
            Run AI review
          </Button>
        ) : null}
      </div>
      <aside className="flex flex-col rounded-3xl bg-surface p-3 shadow-[var(--shadow-border)]">
        <p className="text-sm font-medium">In-call chat</p>
        <div className="min-h-40 flex-1 space-y-2 overflow-y-auto py-2 text-sm">
          {chat.map((m, i) => (
            <p key={i}>
              <span className="text-muted">{m.from}: </span>
              {m.body}
            </p>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            roomRef.current?.broadcast({ body: draft });
            setChat((c) => [...c, { from: "You", body: draft }]);
            setDraft("");
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      </aside>
    </div>
  );
}
