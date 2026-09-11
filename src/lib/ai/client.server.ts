const MODEL = "grok-4.5";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function key() {
  return process.env.XAI_API_KEY ?? "";
}

export function aiAvailable() {
  return Boolean(key());
}

export async function chatGrok(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number; json?: boolean; timeoutMs?: number } = {},
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = key();
  if (!apiKey) return { ok: false, error: "AI is not available right now. Please try again in a moment." };

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    max_tokens: opts.maxTokens ?? 700,
    temperature: opts.temperature ?? 0.6,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 22000),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[ai] xAI error", res.status, errText.slice(0, 400));
      return { ok: false, error: "The AI tutor is busy. Please try again." };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true, text: json.choices?.[0]?.message?.content ?? "" };
  } catch (err) {
    console.error("[ai] network", err);
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ok: false,
      error: timedOut
        ? "The AI tutor took too long. Please try again."
        : "Network issue while reaching the AI tutor.",
    };
  }
}

export async function streamGrok(messages: ChatMessage[], opts: { maxTokens?: number } = {}) {
  const apiKey = key();
  if (!apiKey) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: opts.maxTokens ?? 900,
      stream: true,
      temperature: 0.65,
    }),
  });
  if (!res.ok || !res.body) return null;
  return res.body;
}

export async function ttsGrok(text: string, voiceId = "eve"): Promise<Uint8Array | null> {
  const apiKey = key();
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text: text.slice(0, 800), voice_id: voiceId }),
    });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf;
  } catch {
    return null;
  }
}

export function parseJsonObject<T>(text: string, fallback: T): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return fallback;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}
