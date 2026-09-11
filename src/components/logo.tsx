import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" className="text-primary" />
      <path
        d="M16 8.5c-1.4 0-2.5 1.2-2.5 2.6v5.2c0 1.4 1.1 2.6 2.5 2.6s2.5-1.2 2.5-2.6v-5.2c0-1.4-1.1-2.6-2.5-2.6Z"
        fill="currentColor"
        className="text-primary-fg"
      />
      <path
        d="M11 16.2a5 5 0 0 0 10 0M16 21.4v2.1"
        stroke="currentColor"
        className="text-primary-fg"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg tracking-tight">
        SpeakAI <span className="text-muted">English</span>
      </span>
    </span>
  );
}
