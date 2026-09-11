import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { GRAMMAR, VOCABULARY } from "@/lib/content/curriculum";
import { getSql } from "@/lib/db";
import { parseJson, todayKey } from "@/lib/utils";

export const latestScores = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      grammar: number;
      vocabulary: number;
      pronunciation: number;
      fluency: number;
      structure: number;
      naturalness: number;
      listening: number;
      confidence: number;
      professional: number;
      overall: number;
      source: string;
      created_at: string;
    }>(
      `select grammar, vocabulary, pronunciation, fluency, structure, naturalness, listening, confidence, professional, overall, source, created_at::text
       from speaking_scores where user_id=$1 order by created_at desc limit 60`,
      [context.userId],
    );
    return rows;
  });

export const listMistakes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{
      id: number;
      category: string;
      original: string;
      corrected: string;
      hindi_explanation: string;
      count: number;
    }>(
      "select id, category, original, corrected, hindi_explanation, count from mistakes where user_id=$1 order by count desc limit 40",
      [context.userId],
    );
  });

export const saveVocabProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { word: string; category: string; status: "learning" | "known" | "review" }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into user_vocabulary (user_id, word, category, status, last_reviewed)
       values ($1,$2,$3,$4,now())
       on conflict (user_id, word) do update set status=excluded.status, last_reviewed=now()`,
      [context.userId, data.word.slice(0, 80), data.category.slice(0, 40), data.status],
    );
    if (data.status === "known") {
      await sql.query("update profiles set words_learned = words_learned + 1 where user_id=$1", [context.userId]);
    }
    return { ok: true };
  });

export const myVocab = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{ word: string; status: string; category: string }>(
      "select word, status, category from user_vocabulary where user_id=$1",
      [context.userId],
    );
  });

export const saveGameScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { gameId: string; score: number; xp: number; coins: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      "insert into game_scores (user_id, game_id, score, xp_earned, coins_earned) values ($1,$2,$3,$4,$5)",
      [context.userId, data.gameId.slice(0, 40), data.score, data.xp, data.coins],
    );
    await sql.query("update profiles set xp = xp + $2, coins = coins + $3 where user_id=$1", [
      context.userId,
      data.xp,
      data.coins,
    ]);
    return { ok: true };
  });

export const leaderboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql.query<{ display_name: string; username: string; xp: number; band: string; public_id: string }>(
      "select display_name, username, xp, band, public_id from profiles order by xp desc limit 20",
    );
  });

export const lessonStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{ lesson_id: string; status: string; score: number | null }>(
      "select lesson_id, status, score from lesson_progress where user_id=$1",
      [context.userId],
    );
  });

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { lessonId: string; kind: string; score?: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into lesson_progress (user_id, lesson_id, kind, status, score, completed_at)
       values ($1,$2,$3,'completed',$4,now())
       on conflict (user_id, lesson_id) do update set status='completed', score=excluded.score, completed_at=now()`,
      [context.userId, data.lessonId, data.kind, data.score ?? null],
    );
    await sql.query("update profiles set xp = xp + 15 where user_id=$1", [context.userId]);
    return { ok: true };
  });

export const getDailyLesson = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const day = todayKey();
    const empty = {
      vocab: [] as { word: string; hindi: string; example: string }[],
      grammar: null as { slug: string; title: string; explanation: string; hindi: string } | null,
      speaking: "Introduce yourself in 45 seconds.",
      listening: "beginner",
      completed: false,
      day,
    };
    const existing = await sql.query<{ payload: string; completed: boolean }>(
      "select payload, completed from daily_lessons where user_id=$1 and day=$2",
      [context.userId, day],
    );
    if (existing[0]) {
      const payload = parseJson<typeof empty>(existing[0].payload, empty);
      return { ...empty, ...payload, completed: existing[0].completed, day };
    }
    const p = await sql.query<{ band: string }>("select band from profiles where user_id=$1", [context.userId]);
    const band = p[0]?.band ?? "C";
    const vocab = VOCABULARY.filter((w) =>
      band === "C" ? w.difficulty === "beginner" : band === "B" ? w.difficulty !== "advanced" : true,
    ).slice(0, 5);
    const grammarPick = GRAMMAR.filter((g) =>
      band === "C" ? g.level === "beginner" : band === "A" ? g.level !== "beginner" : true,
    )[new Date().getDate() % Math.max(1, GRAMMAR.length)];
    const payload = {
      vocab: vocab.map((v) => ({ word: v.word, hindi: v.hindi, example: v.example })),
      grammar: grammarPick
        ? { slug: grammarPick.slug, title: grammarPick.title, explanation: grammarPick.explanation, hindi: grammarPick.hindi }
        : null,
      speaking:
        band === "A" ? "Explain a project update to your manager in 60 seconds." : "Introduce yourself in 45 seconds.",
      listening: band === "A" ? "professional" : band === "B" ? "intermediate" : "beginner",
    };
    await sql.query("insert into daily_lessons (user_id, day, payload) values ($1,$2,$3)", [
      context.userId,
      day,
      JSON.stringify(payload),
    ]);
    return { ...payload, completed: false, day };
  });

export const finishDailyLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql.query("update daily_lessons set completed=true where user_id=$1 and day=$2", [context.userId, todayKey()]);
    await sql.query("update profiles set xp = xp + 40, practice_minutes = practice_minutes + 20 where user_id=$1", [
      context.userId,
    ]);
    return { ok: true };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{ id: number; title: string; kind: string; mode: string; updated_at: string }>(
      "select id, title, kind, mode, updated_at::text from conversations where user_id=$1 order by updated_at desc limit 40",
      [context.userId],
    );
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owned = await sql.query<{ id: number }>("select id from conversations where id=$1 and user_id=$2", [
      data.id,
      context.userId,
    ]);
    if (!owned[0]) return { messages: [] as { role: string; content: string }[] };
    const messages = await sql.query<{ role: string; content: string; correction: string | null }>(
      "select role, content, correction from messages where conversation_id=$1 order by id",
      [data.id],
    );
    return { messages };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query("delete from conversations where id=$1 and user_id=$2", [data.id, context.userId]);
    return { ok: true };
  });

export const renameConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; title: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query("update conversations set title=$3 where id=$1 and user_id=$2", [
      data.id,
      context.userId,
      data.title.slice(0, 80),
    ]);
    return { ok: true };
  });

export const notifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{ id: number; title: string; body: string; href: string | null; read: boolean; created_at: string }>(
      "select id, title, body, href, read, created_at::text from notifications where user_id=$1 order by created_at desc limit 30",
      [context.userId],
    );
  });

export const markNotifications = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql.query("update notifications set read=true where user_id=$1", [context.userId]);
    return { ok: true };
  });

export const searchAll = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const q = data.q.trim().toLowerCase();
    if (q.length < 2)
      return { vocab: [] as string[], grammar: [] as string[], users: [] as { name: string; publicId: string }[] };
    const vocab = VOCABULARY.filter(
      (v) => v.word.toLowerCase().includes(q) || v.hindi.includes(data.q) || v.category.toLowerCase().includes(q),
    ).slice(0, 8);
    const grammar = GRAMMAR.filter((g) => g.title.toLowerCase().includes(q) || g.slug.includes(q)).slice(0, 6);
    const sql = await getSql();
    const users = await sql.query<{ display_name: string; public_id: string; username: string }>(
      `select display_name, public_id, username from profiles
       where display_name ilike $1 or username ilike $1 or public_id ilike $1
       limit 8`,
      [`%${q}%`],
    );
    return {
      vocab: vocab.map((v) => v.word),
      grammar: grammar.map((g) => g.title),
      users: users.map((u) => ({ name: u.display_name, publicId: u.public_id, username: u.username })),
    };
  });
