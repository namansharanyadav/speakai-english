import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BANDS, type Band } from "@/lib/bands";
import {
  createRoom,
  friendAction,
  joinRoom,
  listLearners,
  listRooms,
  startCall,
  startDirectChat,
} from "@/lib/server/community";
import { getMyProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/_app/community")({ component: Community });

function Community() {
  const [people, setPeople] = useState<Awaited<ReturnType<typeof listLearners>>>([]);
  const [rooms, setRooms] = useState<Awaited<ReturnType<typeof listRooms>>>([]);
  const [me, setMe] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("Daily English");

  useEffect(() => {
    listLearners().then(setPeople).catch(() => {});
    listRooms().then(setRooms).catch(() => {});
    getMyProfile()
      .then((p) => p && setMe(p.userId))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl">Speaking community</h1>
        <p className="text-sm text-muted">Find partners, join rooms, share a link like speakai.app/join/ABC123.</p>
      </header>
      <section>
        <h2 className="font-display text-2xl">Rooms</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {rooms.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{r.name}</h3>
                  <p className="text-sm text-muted">{r.topic}</p>
                  <p className="mt-1 text-xs text-faint">
                    {r.members} in room · /join/{r.slug}
                  </p>
                </div>
                {r.level_band ? <Badge>{BANDS[r.level_band as Band]?.label ?? r.level_band}</Badge> : null}
              </div>
              <Button
                className="mt-3"
                size="sm"
                onClick={() => joinRoom({ data: { slug: r.slug } }).then(() => toast.success("Joined"))}
              >
                Join
              </Button>
            </Card>
          ))}
        </div>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createRoom({ data: { name, topic, isPublic: true } }).then((r) => {
              if (r.ok) toast.success("Room created. Share /join/" + r.slug);
            });
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New room name" className="max-w-xs" />
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="max-w-xs" />
          <Button type="submit">Create room</Button>
        </form>
      </section>
      <section>
        <h2 className="font-display text-2xl">Learners</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <Card key={p.user_id}>
              <div className="flex items-center gap-3">
                <Avatar name={p.display_name} />
                <div>
                  <p className="font-medium">{p.display_name}</p>
                  <p className="text-xs text-muted">
                    {p.public_id} · {p.username}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">
                {BANDS[p.band as Band]?.label ?? p.band} · {p.goal.replaceAll("_", " ")}
              </p>
              <p className="text-sm">{p.bio || "Ready to practise."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    friendAction({ data: { toId: p.user_id, action: "request" } }).then(() =>
                      toast.success("Request sent"),
                    )
                  }
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const chat = await startDirectChat({ data: { otherId: p.user_id } });
                    window.location.href = "/messages?chat=" + chat.chatId;
                  }}
                >
                  Chat
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    const call = await startCall({ data: { toId: p.user_id } });
                    window.location.href = "/call/" + call.code;
                  }}
                >
                  Call
                </Button>
              </div>
            </Card>
          ))}
          {people.length === 0 ? (
            <p className="text-sm text-muted">No other learners yet. Invite a friend after they sign in.</p>
          ) : null}
        </div>
      </section>
      <p className="text-xs text-muted">Signed in as {me ? "you" : "…"}.</p>
    </div>
  );
}
