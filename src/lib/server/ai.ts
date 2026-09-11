import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { aiAvailable, chatGrok, parseJsonObject, ttsGrok } from "@/lib/ai/client.server";
import { CHAT_MODES, evalInstruction, learnerSystem, type LearnerCtx } from "@/lib/ai/prompts";
import { BANDS, isBand, type Band } from "@/lib/bands";
import { HELP_KB } from "@/lib/content/help-kb";
import { getSql } from "@/lib/db";
import { clamp, todayKey } from "@/lib/utils";

export type EvalResult = {
  reply: string;
  original_sentence: string;
  corrected_sentence: string;
  natural_sentence: string;
  hindi_explanation: string;
  grammar_errors: { span: string; issue: string; fix: string }[];
  vocabulary_suggestions: string[];
  filler_words: string[];
  scores: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    structure: number;
    naturalness: number;
    confidence: number;
    listening: number;
    professional: number;
  };
  mistake_categories: string[];
  should_interrupt: boolean;
};

const EMPTY_EVAL: EvalResult = {
  reply: "",
  original_sentence: "",
  corrected_sentence: "",
  natural_sentence: "",
  hindi_explanation: "",
  grammar_errors: [],
  vocabulary_suggestions: [],
  filler_words: [],
  scores: {
    grammar: 0,
    vocabulary: 0,
    pronunciation: 0,
    fluency: 0,
    structure: 0,
    naturalness: 0,
    confidence: 0,
    listening: 0,
    professional: 0,
  },
  mistake_categories: [],
  should_interrupt: false,
};

async function learnerCtx(userId: string): Promise<LearnerCtx> {
  const sql = await getSql();
  const rows = await sql.query<{
    display_name: string;
    band: string;
    cefr_level: string;
    goal: string;
    hindi_dependency: number;
  }>("select display_name, band, cefr_level, goal, hindi_dependency from profiles where user_id=$1", [userId]);
  const r = rows[0];
  const mistakes = await sql.query<{ category: string }>(
    "select category from mistakes where user_id=$1 order by count desc limit 5",
    [userId],
  );
  return {
    name: r?.display_name || "Learner",
    band: isBand(r?.band) ? r.band : "C",
    cefr: r?.cefr_level || "A2",
    goal: r?.goal || "general_fluency",
    hindiDependency: r?.hindi_dependency ?? 70,
    commonMistakes: mistakes.map((m) => m.category),
  };
}

async function checkQuota(userId: string): Promise<{ ok: boolean; remaining: number; plan: string }> {
  const sql = await getSql();
  const p = await sql.query<{ plan: string }>("select plan from profiles where user_id=$1", [userId]);
  const plan = p[0]?.plan === "premium" ? "premium" : "free";
  const cap = plan === "premium" ? 200 : 20;
  const day = todayKey();
  const rows = await sql.query<{ calls: number }>("select calls from ai_usage where user_id=$1 and day=$2", [
    userId,
    day,
  ]);
  const used = rows[0]?.calls ?? 0;
  if (used >= cap) return { ok: false, remaining: 0, plan };
  if (rows[0]) {
    await sql.query("update ai_usage set calls = calls + 1 where user_id=$1 and day=$2", [userId, day]);
  } else {
    await sql.query("insert into ai_usage (user_id, day, calls) values ($1,$2,1)", [userId, day]);
  }
  return { ok: true, remaining: cap - used - 1, plan };
}

async function saveMistakes(userId: string, categories: string[], original: string, corrected: string, hindi: string) {
  if (!categories.length || !original) return;
  const sql = await getSql();
  for (const cat of categories.slice(0, 4)) {
    const existing = await sql.query<{ id: number }>(
      "select id from mistakes where user_id=$1 and category=$2 and original=$3",
      [userId, cat.slice(0, 40), original.slice(0, 280)],
    );
    if (existing[0]) {
      await sql.query("update mistakes set count = count + 1, last_seen=now(), corrected=$2 where id=$1", [
        existing[0].id,
        corrected.slice(0, 280),
      ]);
    } else {
      await sql.query(
        "insert into mistakes (user_id, category, original, corrected, hindi_explanation) values ($1,$2,$3,$4,$5)",
        [userId, cat.slice(0, 40), original.slice(0, 280), corrected.slice(0, 280), hindi.slice(0, 400)],
      );
    }
  }
}

async function saveScore(userId: string, scores: EvalResult["scores"], source: string) {
  const values = Object.values(scores).map((n) => clamp(Number(n) || 0));
  const overall = Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length));
  const sql = await getSql();
  await sql.query(
    `insert into speaking_scores
      (user_id, grammar, vocabulary, pronunciation, fluency, structure, naturalness, listening, confidence, professional, overall, source)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      userId,
      scores.grammar,
      scores.vocabulary,
      scores.pronunciation,
      scores.fluency,
      scores.structure,
      scores.naturalness,
      scores.listening,
      scores.confidence,
      scores.professional,
      overall,
      source,
    ],
  );
}

export const getAiStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const p = await sql.query<{ plan: string }>("select plan from profiles where user_id=$1", [context.userId]);
    const plan = p[0]?.plan === "premium" ? "premium" : "free";
    const cap = plan === "premium" ? 200 : 20;
    const day = todayKey();
    const rows = await sql.query<{ calls: number }>("select calls from ai_usage where user_id=$1 and day=$2", [
      context.userId,
      day,
    ]);
    const used = rows[0]?.calls ?? 0;
    return { available: aiAvailable(), plan, remaining: Math.max(0, cap - used) };
  });

export const converse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      conversationId?: number;
      kind?: string;
      mode?: string;
      topic?: string;
      history: { role: "user" | "assistant"; content: string }[];
      userText: string;
      evaluate?: boolean;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const quota = await checkQuota(context.userId);
    if (!quota.ok) {
      return {
        ok: false as const,
        error:
          quota.plan === "free"
            ? "You have used today’s free AI conversations. Upgrade to Premium for more practice."
            : "Daily AI limit reached. Please try again tomorrow.",
      };
    }
    const ctx = await learnerCtx(context.userId);
    const mode = data.mode ?? "partner";
    const sys = learnerSystem(ctx, CHAT_MODES[mode] ?? mode);
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: sys + "\n" + evalInstruction() },
      ...data.history.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    ];
    if (data.history.at(-1)?.content !== data.userText) {
      messages.push({
        role: "user",
        content: data.topic ? `[Topic: ${data.topic}]\n${data.userText}` : data.userText,
      });
    }
    const result = await chatGrok(messages, { maxTokens: 800, json: true });
    if (!result.ok) return { ok: false as const, error: result.error };
    const parsed = parseJsonObject<EvalResult>(result.text, { ...EMPTY_EVAL, reply: result.text });
    if (!parsed.reply) parsed.reply = "Could you say that another way?";
    parsed.original_sentence = parsed.original_sentence || data.userText;
    const sql = await getSql();
    let conversationId = data.conversationId;
    if (!conversationId) {
      const inserted = await sql.query<{ id: number }>(
        `insert into conversations (user_id, kind, title, mode, topic) values ($1,$2,$3,$4,$5) returning id`,
        [
          context.userId,
          data.kind ?? "partner",
          (data.topic || "Conversation").slice(0, 80),
          mode,
          data.topic ?? null,
        ],
      );
      conversationId = inserted[0]?.id;
    }
    if (conversationId) {
      await sql.query(
        `insert into messages (conversation_id, user_id, role, content, correction) values ($1,$2,'user',$3,$4)`,
        [conversationId, context.userId, data.userText.slice(0, 4000), parsed.corrected_sentence || null],
      );
      await sql.query(`insert into messages (conversation_id, user_id, role, content) values ($1,$2,'assistant',$3)`, [
        conversationId,
        context.userId,
        parsed.reply.slice(0, 4000),
      ]);
      await sql.query(`update conversations set updated_at=now() where id=$1 and user_id=$2`, [
        conversationId,
        context.userId,
      ]);
    }
    await saveMistakes(
      context.userId,
      parsed.mistake_categories ?? [],
      parsed.original_sentence,
      parsed.corrected_sentence,
      parsed.hindi_explanation,
    );
    if (data.evaluate !== false) await saveScore(context.userId, parsed.scores, data.kind ?? "partner");
    await sql.query(`insert into activity_log (user_id, action, detail) values ($1,'converse',$2)`, [
      context.userId,
      JSON.stringify({ kind: data.kind, mode }),
    ]);
    return { ok: true as const, conversationId, evaluation: parsed, remaining: quota.remaining };
  });

export const askCoach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { prompt: string; mode?: string; history?: { role: "user" | "assistant"; content: string }[] }) => d)
  .handler(async ({ context, data }) => {
    const quota = await checkQuota(context.userId);
    if (!quota.ok) return { ok: false as const, error: "Daily AI limit reached." };
    const ctx = await learnerCtx(context.userId);
    const mode = data.mode ?? "teacher";
    const extra = mode === "guide" ? `\nProduct knowledge:\n${HELP_KB}` : "";
    const result = await chatGrok(
      [
        { role: "system", content: learnerSystem(ctx, CHAT_MODES[mode] ?? mode) + extra },
        ...(data.history ?? []).slice(-16),
        { role: "user", content: data.prompt.slice(0, 4000) },
      ],
      { maxTokens: 900 },
    );
    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, text: result.text, remaining: quota.remaining };
  });

export const translateText = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { text: string; source: "en" | "hi" | "auto"; target: "en" | "hi" }) => d)
  .handler(async ({ context, data }) => {
    const quota = await checkQuota(context.userId);
    if (!quota.ok) return { ok: false as const, error: "Daily AI limit reached." };
    const result = await chatGrok(
      [
        {
          role: "system",
          content:
            "You are a precise English↔Hindi translator for Indian learners. Return JSON {source_lang, translation, transliteration, notes}. Keep meaning. Prefer natural spoken language.",
        },
        {
          role: "user",
          content: `Source hint: ${data.source}. Target: ${data.target}. Text: ${data.text.slice(0, 1500)}`,
        },
      ],
      { maxTokens: 400, json: true },
    );
    if (!result.ok) return { ok: false as const, error: result.error };
    const parsed = parseJsonObject<{
      source_lang?: string;
      translation?: string;
      transliteration?: string;
      notes?: string;
    }>(result.text, { translation: result.text });
    return { ok: true as const, ...parsed };
  });

export const speakText = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { text: string; voice?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const p = await sql.query<{ voice_pref: string }>("select voice_pref from profiles where user_id=$1", [
      context.userId,
    ]);
    const voice = data.voice || p[0]?.voice_pref || "eve";
    const audio = await ttsGrok(data.text, voice);
    if (!audio) return { ok: false as const, error: "Voice is not available. Use device speech instead." };
    let binary = "";
    audio.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    const b64 = btoa(binary);
    return { ok: true as const, audio: b64, mime: "audio/mpeg" };
  });

export const evaluateSpeech = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { transcript: string; prompt: string; kind: string }) => d)
  .handler(async ({ context, data }) => {
    const quota = await checkQuota(context.userId);
    if (!quota.ok) return { ok: false as const, error: "Daily AI limit reached." };
    const ctx = await learnerCtx(context.userId);
    const result = await chatGrok(
      [
        { role: "system", content: learnerSystem(ctx, "Evaluate a speaking attempt. JSON only.") + "\n" + evalInstruction() },
        {
          role: "user",
          content: `Prompt: ${data.prompt}\nLearner said: ${data.transcript.slice(0, 3000)}\nKind: ${data.kind}`,
        },
      ],
      { maxTokens: 700, json: true },
    );
    if (!result.ok) return { ok: false as const, error: result.error };
    const parsed = parseJsonObject<EvalResult>(result.text, { ...EMPTY_EVAL, reply: result.text });
    await saveMistakes(
      context.userId,
      parsed.mistake_categories ?? [],
      parsed.original_sentence || data.transcript,
      parsed.corrected_sentence,
      parsed.hindi_explanation,
    );
    await saveScore(context.userId, parsed.scores, data.kind);
    return { ok: true as const, evaluation: parsed };
  });

export const recommendBand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { answers: { prompt: string; answer: string }[]; chosenBand: Band }) => d)
  .handler(async ({ context, data }) => {
    const quota = await checkQuota(context.userId);
    if (!quota.ok) {
      return {
        ok: true as const,
        band: data.chosenBand,
        note: "AI estimate unavailable. Using the level you selected.",
        rationale: undefined as string | undefined,
        hindi_note: undefined as string | undefined,
        evaluation: EMPTY_EVAL,
      };
    }
    const result = await chatGrok(
      [
        {
          role: "system",
          content: `You estimate English speaking level for Hindi-speaking adults in India.
Bands: C Average (~A2), B Intermediate (~B1/B2), A Professional (~C1).
This is an AI estimate, not official CEFR. Return JSON {band: "A"|"B"|"C", cefr, rationale, hindi_note, scores:{grammar,vocabulary,fluency,structure,naturalness,confidence,pronunciation,listening,professional}, reply}.
Respect the learner's chosen band unless evidence is strongly different.`,
        },
        {
          role: "user",
          content: `Chosen band: ${data.chosenBand} (${BANDS[data.chosenBand].label}). Answers:\n${data.answers
            .map((a) => `Q: ${a.prompt}\nA: ${a.answer}`)
            .join("\n\n")}`,
        },
      ],
      { maxTokens: 500, json: true },
    );
    if (!result.ok) {
      return {
        ok: true as const,
        band: data.chosenBand,
        note: result.error,
        rationale: undefined as string | undefined,
        hindi_note: undefined as string | undefined,
        evaluation: EMPTY_EVAL,
      };
    }
    const parsed = parseJsonObject<{
      band?: string;
      cefr?: string;
      rationale?: string;
      hindi_note?: string;
      scores?: EvalResult["scores"];
      reply?: string;
    }>(result.text, {});
    const band = isBand(parsed.band) ? parsed.band : data.chosenBand;
    return {
      ok: true as const,
      band,
      cefr: parsed.cefr,
      rationale: parsed.rationale,
      hindi_note: parsed.hindi_note,
      reply: parsed.reply,
      note: undefined as string | undefined,
      evaluation: { ...EMPTY_EVAL, scores: parsed.scores ?? EMPTY_EVAL.scores, reply: parsed.reply ?? "" },
    };
  });
