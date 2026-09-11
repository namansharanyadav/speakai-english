import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme";
import { getMyProfile, updateProfile, type Profile } from "@/lib/server/profile";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const [p, setP] = useState<Profile | null>(null);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    getMyProfile().then(setP).catch(() => {});
  }, []);
  if (!p) return <p className="text-muted">Loading…</p>;
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>
      <div className="space-y-1">
        <Label>Name</Label>
        <Input value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Mobile</Label>
        <Input value={p.phone ?? ""} onChange={(e) => setP({ ...p, phone: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Bio</Label>
        <Input value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} />
      </div>
      <p className="text-sm text-muted">
        User ID {p.publicId} · @{p.username} · Band {p.band}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm">Larger text</span>
        <Switch
          onCheckedChange={(on) => {
            document.documentElement.style.fontSize = on ? "18px" : "";
          }}
        />
      </div>
      <div className="flex gap-2">
        {(["light", "dark", "system"] as const).map((t) => (
          <Button key={t} variant={theme === t ? "default" : "secondary"} size="sm" onClick={() => setTheme(t)}>
            {t}
          </Button>
        ))}
      </div>
      <div className="space-y-1">
        <Label>AI voice</Label>
        <Input value={p.voicePref} onChange={(e) => setP({ ...p, voicePref: e.target.value })} placeholder="eve" />
      </div>
      <Button
        onClick={async () => {
          await updateProfile({
            data: { displayName: p.displayName, phone: p.phone ?? undefined, bio: p.bio, voicePref: p.voicePref },
          });
          toast.success("Saved");
        }}
      >
        Save
      </Button>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/pricing" className="underline">
          Plans
        </Link>
        {p.role === "admin" ? (
          <Link to="/admin" className="underline">
            Admin
          </Link>
        ) : null}
      </div>
      <Button
        variant="danger"
        onClick={async () => {
          if (!confirm("Delete your SpeakAI learning data on this app?")) return;
          await updateProfile({ data: { deleteAccount: true } });
          toast.message("Learning data removed.");
        }}
      >
        Delete my learning data
      </Button>
    </div>
  );
}
