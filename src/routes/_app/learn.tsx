import { Link, createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/learn")({ component: Learn });

const ITEMS = [
  { to: "/lesson", title: "Today’s lesson", body: "Vocab, grammar, listening, speaking." },
  { to: "/path", title: "Learning path", body: "Beginner to professional, unlock as you grow." },
  { to: "/vocabulary", title: "Vocabulary", body: "Hindi meaning, examples, your own sentence." },
  { to: "/grammar", title: "Grammar Lab", body: "Explanation, Hindi, drills, speaking." },
  { to: "/listening", title: "Listening Lab", body: "Slow English to meeting speed." },
  { to: "/hindi", title: "Hindi → English", body: "Think in English from a Hindi prompt." },
  { to: "/thinking", title: "Thinking Mode", body: "Six levels that drop Hindi support." },
  { to: "/pronunciation", title: "Pronunciation", body: "v/w, th, and other traps." },
];

function Learn() {
  return (
    <div>
      <h1 className="font-display text-3xl">Learn</h1>
      <p className="mt-1 text-sm text-muted">A full academy path — not only chat.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ITEMS.map((i) => (
          <Link key={i.to} to={i.to}>
            <Card>
              <h2 className="font-medium">{i.title}</h2>
              <p className="mt-1 text-sm text-muted">{i.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
