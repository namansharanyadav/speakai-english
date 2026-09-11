import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyProfile, type Profile } from "@/lib/server/profile";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    getMyProfile()
      .then((p) => {
        setProfile(p);
        if (p && !p.onboardingComplete) void navigate({ to: "/onboarding" });
        else if (p && !p.assessmentComplete) void navigate({ to: "/assessment" });
      })
      .catch(() => setProfile(null))
      .finally(() => setReady(true));
  }, [isPending, user, navigate]);

  if (isPending || (user && !ready)) {
    return (
      <div className="min-h-dvh bg-bg p-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <p>We could not load your profile. Please refresh.</p>
      </div>
    );
  }

  return (
    <AppShell profile={profile}>
      <Outlet />
    </AppShell>
  );
}
