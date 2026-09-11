import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function isPersonalVercelHost(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith(".vercel.app");
}

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const socialBlocked = isPersonalVercelHost();

  if (!isPending && user) {
    void navigate({ to: "/dashboard" });
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    try {
      const mail = email.trim().toLowerCase();
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email: mail,
          password,
          name: name.trim() || mail.split("@")[0] || "Learner",
        });
        if (error) throw new Error(error.message);
        toast.success("Account created. Welcome in.");
        if (phone) sessionStorage.setItem("speakai-phone", phone);
      } else {
        const { error } = await authClient.signIn.email({ email: mail, password });
        if (error) throw new Error(error.message);
      }
      window.location.href = "/onboarding";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  async function onSocial(providerId: string) {
    if (socialBlocked) {
      toast.error("Gmail / X is not connected on this live URL yet. Use email and password — that works now.");
      return;
    }
    try {
      await signIn(providerId, { callbackURL: "/onboarding", errorCallbackURL: "/login" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not start Google/X sign-in. Use email and password.",
      );
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="dark hidden flex-col justify-between bg-bg p-10 text-fg lg:flex">
        <Wordmark />
        <div>
          <h1 className="font-display text-4xl leading-tight">Think English. Speak confidently.</h1>
          <p className="mt-4 max-w-md text-muted">
            Choose Average, Intermediate, or Professional. The whole academy — AI partner, games, rooms —
            shifts to your level.
          </p>
        </div>
        <p className="text-sm text-faint">Hindi explanations. Indian workplace English. Real speaking.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Wordmark />
          </div>
          <h2 className="font-display text-3xl">Welcome</h2>
          <p className="mt-1 text-sm text-muted">
            {socialBlocked
              ? "Use email and password to sign in. Gmail/X on this live URL is being connected."
              : "Sign in with email, Google, or X. Phone is saved on your profile."}
          </p>
          {socialBlocked ? (
            <p className="mt-2 text-sm text-muted">
              Is live site par Gmail abhi connect nahi hai. Email aur password se login karein — woh chal raha
              hai.
            </p>
          ) : null}

          {authEnabled ? (
            <>
              {socialBlocked ? null : (
                <>
                  <div className="mt-6 space-y-2">
                    {GROK_PROVIDERS.map((p) => (
                      <Button
                        key={p.providerId}
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => void onSocial(p.providerId)}
                      >
                        Continue with {p.label}
                      </Button>
                    ))}
                  </div>
                  <p className="my-5 text-center text-xs text-muted">or email and password</p>
                </>
              )}
              <Tabs className={socialBlocked ? "mt-6" : undefined} value={mode} onValueChange={(v) => setMode(v as "in" | "up")}>
                <TabsList className="w-full">
                  <TabsTrigger value="in" className="flex-1">
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger value="up" className="flex-1">
                    Create account
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={mode} className="mt-4">
                  <form className="space-y-3" onSubmit={onEmail}>
                    {mode === "up" ? (
                      <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                    ) : null}
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    {mode === "up" ? (
                      <div className="space-y-1">
                        <Label htmlFor="phone">Mobile number (optional)</Label>
                        <Input
                          id="phone"
                          inputMode="tel"
                          placeholder="10-digit Indian mobile"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    ) : null}
                    <div className="space-y-1">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete={mode === "up" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <button
                type="button"
                className="mt-3 text-xs text-muted underline-offset-4 hover:underline"
                onClick={() =>
                  toast.message(
                    socialBlocked
                      ? "Password reset needs email delivery. Create a new account with the same email if you are stuck."
                      : "Password reset needs email delivery, which is not configured here. Use Google, X, or create a new account.",
                  )
                }
              >
                Forgot password?
              </button>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
          )}
          <p className="mt-8 text-xs text-muted">
            By continuing you agree to practise in good faith and never secretly record other learners.
          </p>
          <p className="mt-3 text-xs">
            <Link to="/" className="text-muted underline-offset-4 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
