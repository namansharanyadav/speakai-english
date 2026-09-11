import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { PUBLIC_ROOMS } from "@/lib/content/curriculum";
import { getSql } from "@/lib/db";

async function ensureRooms() {
  const sql = await getSql();
  const count = await sql.query<{ c: number }>("select count(*)::int as c from groups");
  if ((count[0]?.c ?? 0) > 0) return;
  for (const r of PUBLIC_ROOMS) {
    await sql.query(
      `insert into groups (owner_id, name, slug, topic, description, is_public, level_band)
       values ('system',$1,$2,$3,$4,true,$5)
       on conflict (slug) do nothing`,
      [r.name, r.slug, r.topic, r.topic, r.band],
    );
  }
}

export const listLearners = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{
      user_id: string;
      display_name: string;
      username: string;
      public_id: string;
      band: string;
      goal: string;
      availability: string;
      bio: string;
    }>(
      `select user_id, display_name, username, public_id, band, goal, availability, bio
       from profiles where user_id <> $1 order by updated_at desc limit 40`,
      [context.userId],
    );
  });

export const listRooms = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    await ensureRooms();
    const sql = await getSql();
    return sql.query<{
      id: number;
      name: string;
      slug: string;
      topic: string;
      description: string;
      is_public: boolean;
      level_band: string | null;
      members: number;
    }>(
      `select g.id, g.name, g.slug, g.topic, g.description, g.is_public, g.level_band,
              (select count(*)::int from group_members m where m.group_id = g.id) as members
       from groups g order by g.id`,
    );
  });

export const joinRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { slug: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureRooms();
    const sql = await getSql();
    const g = await sql.query<{ id: number }>("select id from groups where slug=$1", [data.slug]);
    if (!g[0]) return { ok: false as const, error: "Room not found." };
    await sql.query(
      "insert into group_members (group_id, user_id) values ($1,$2) on conflict do nothing",
      [g[0].id, context.userId],
    );
    return { ok: true as const, id: g[0].id };
  });

export const createRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name: string; topic: string; isPublic: boolean; band?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) + "-" + Math.random().toString(36).slice(2, 6);
    const inserted = await sql.query<{ id: number; slug: string }>(
      `insert into groups (owner_id, name, slug, topic, description, is_public, level_band)
       values ($1,$2,$3,$4,$4,$5,$6) returning id, slug`,
      [context.userId, data.name.slice(0, 60), slug, data.topic.slice(0, 80), data.isPublic, data.band ?? null],
    );
    const row = inserted[0];
    if (row) {
      await sql.query("insert into group_members (group_id, user_id, role) values ($1,$2,'owner')", [
        row.id,
        context.userId,
      ]);
    }
    return { ok: true as const, slug: row?.slug };
  });

export const friendAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { toId: string; action: "request" | "accept" | "block" }) => d)
  .handler(async ({ context, data }) => {
    if (data.toId === context.userId) return { ok: false as const };
    const sql = await getSql();
    if (data.action === "request") {
      await sql.query(
        `insert into friend_requests (from_id, to_id) values ($1,$2)
         on conflict (from_id, to_id) do nothing`,
        [context.userId, data.toId],
      );
      await sql.query(
        "insert into notifications (user_id, title, body, href) values ($1,$2,$3,$4)",
        [data.toId, "Friend request", "Someone wants to practise English with you.", "/community"],
      );
    } else if (data.action === "accept") {
      await sql.query(
        "update friend_requests set status='accepted' where from_id=$1 and to_id=$2",
        [data.toId, context.userId],
      );
    }
    return { ok: true as const };
  });

export const startDirectChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { otherId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql.query<{ chat_id: number }>(
      `select c.id as chat_id from chats c
       join chat_members a on a.chat_id=c.id
       join chat_members b on b.chat_id=c.id
       where c.kind='direct' and a.user_id=$1 and b.user_id=$2
       limit 1`,
      [context.userId, data.otherId],
    );
    if (existing[0]) return { chatId: existing[0].chat_id };
    const created = await sql.query<{ id: number }>("insert into chats (kind) values ('direct') returning id");
    const id = created[0]!.id;
    await sql.query("insert into chat_members (chat_id, user_id) values ($1,$2), ($1,$3)", [
      id,
      context.userId,
      data.otherId,
    ]);
    return { chatId: id };
  });

export const listChats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql.query<{ id: number; kind: string; title: string | null }>(
      `select c.id, c.kind, c.title from chats c
       join chat_members m on m.chat_id=c.id
       where m.user_id=$1 order by c.id desc limit 30`,
      [context.userId],
    );
  });

export const sendChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { chatId: number; body: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await sql.query<{ chat_id: number }>(
      "select chat_id from chat_members where chat_id=$1 and user_id=$2",
      [data.chatId, context.userId],
    );
    if (!member[0]) return { ok: false as const };
    await sql.query("insert into chat_messages (chat_id, user_id, body) values ($1,$2,$3)", [
      data.chatId,
      context.userId,
      data.body.slice(0, 2000),
    ]);
    return { ok: true as const };
  });

export const chatMessages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { chatId: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await sql.query<{ chat_id: number }>(
      "select chat_id from chat_members where chat_id=$1 and user_id=$2",
      [data.chatId, context.userId],
    );
    if (!member[0]) return [];
    return sql.query<{ id: number; user_id: string; body: string; created_at: string }>(
      "select id, user_id, body, created_at::text from chat_messages where chat_id=$1 order by id desc limit 80",
      [data.chatId],
    );
  });

export const startCall = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { toId?: string; groupId?: number; aiAnalysis?: boolean }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const code = Math.random().toString(36).slice(2, 8);
    await sql.query(
      "insert into calls (room_code, from_id, to_id, group_id, ai_analysis, status) values ($1,$2,$3,$4,$5,'ringing')",
      [code, context.userId, data.toId ?? null, data.groupId ?? null, Boolean(data.aiAnalysis)],
    );
    if (data.toId) {
      await sql.query("insert into notifications (user_id, title, body, href) values ($1,$2,$3,$4)", [
        data.toId,
        "Incoming call",
        "Someone is calling you on SpeakAI.",
        `/call/${code}`,
      ]);
    }
    return { code };
  });

export const getCall = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      room_code: string;
      from_id: string;
      to_id: string | null;
      status: string;
      ai_analysis: boolean;
    }>("select room_code, from_id, to_id, status, ai_analysis from calls where room_code=$1", [data.code]);
    const call = rows[0];
    if (!call) return null;
    if (call.from_id !== context.userId && call.to_id !== context.userId && call.to_id !== null) return null;
    return call;
  });

export const reportUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { targetId: string; reason: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query("insert into reported_users (reporter_id, target_id, reason) values ($1,$2,$3)", [
      context.userId,
      data.targetId,
      data.reason.slice(0, 240),
    ]);
    return { ok: true };
  });
