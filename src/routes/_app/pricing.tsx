import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/_app/pricing")({ component: Pricing });

function Pricing() {
  return (
    <div>
      <h1 className="font-display text-3xl">Free and Premium</h1>
      <p className="mt-1 text-sm text-muted">Basic learning stays open. Unlimited AI speaking is Premium.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Free</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {["Limited AI conversations", "Basic lessons and games", "Core vocabulary", "Limited speaking analysis"].map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="size-4 text-ok" /> {x}
              </li>
            ))}
          </ul>
          <Button className="mt-6" variant="secondary" onClick={() => updateProfile({ data: { plan: "free" } }).then(() => toast.success("On the Free plan"))}>
            Stay on Free
          </Button>
        </Card>
        <Card className="bg-ink text-bg">
          <h2 className="font-display text-2xl">Premium</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Unlimited AI speaking (fair-use cap)",
              "Advanced tutor and Round Table",
              "Pronunciation analysis",
              "Professional English",
              "Detailed progress",
              "More AI voices",
              "Community rooms and calls",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="size-4" /> {x}
              </li>
            ))}
          </ul>
          <Button
            className="mt-6"
            variant="secondary"
            onClick={() => updateProfile({ data: { plan: "premium" } }).then(() => toast.success("Premium unlocked on this account"))}
          >
            Unlock Premium
          </Button>
        </Card>
      </div>
    </div>
  );
}
