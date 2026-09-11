import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon; hint?: string };

export const PRIMARY_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/speak", label: "Speak", icon: Mic, hint: "AI partner" },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { to: "/games", label: "Games", icon: Swords },
  { to: "/community", label: "Community", icon: Users },
  { to: "/progress", label: "Progress", icon: Trophy },
  { to: "/academy", label: "Academy", icon: GraduationCap },
];

export const MORE_NAV: { to: string; label: string }[] = [
  { to: "/mirror", label: "Mirror Talk" },
  { to: "/round-table", label: "AI Round Table" },
  { to: "/roleplay", label: "Roleplay" },
  { to: "/hindi", label: "Hindi → English" },
  { to: "/thinking", label: "Thinking Mode" },
  { to: "/vocabulary", label: "Vocabulary" },
  { to: "/grammar", label: "Grammar Lab" },
  { to: "/listening", label: "Listening Lab" },
  { to: "/pronunciation", label: "Pronunciation" },
  { to: "/translator", label: "Translator" },
  { to: "/coach", label: "SpeakAI Coach" },
  { to: "/path", label: "Learning path" },
  { to: "/mistakes", label: "Mistake book" },
  { to: "/lesson", label: "Today's lesson" },
  { to: "/calls", label: "Calls" },
  { to: "/messages", label: "Messages" },
  { to: "/pricing", label: "Plans" },
  { to: "/settings", label: "Settings" },
];

export const MOBILE_NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/speak", label: "Speak", icon: Mic },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/games", label: "Games", icon: Swords },
  { to: "/ai-chat", label: "Chat", icon: MessageSquare },
];
