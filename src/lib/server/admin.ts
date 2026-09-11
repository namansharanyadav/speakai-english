import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ role: string }>("select role from profiles where user_id=$1", [userId]);
  if (rows[0]?.role !== "admin") throw new Error("Admin only");
  return sql;
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    const users = await sql.query<{
      user_id: string;
      display_name: string;
      public_id: string;
      band: string;
      cefr_level: string;
      plan: string;
      xp: number;
      practice_minutes: number;
      conversations_completed: number;
      streak_days: number;
      role: string;
      updated_at: string;
    }>(
      `select user_id, display_name, public_id, band, cefr_level, plan, xp, practice_minutes,
              conversations_completed, streak_days, role, updated_at::text
       from profiles order by updated_at desc limit 100`,
    );
    const counts = await sql.query<{
      learners: number;
      premium: number;
      conversations: number;
      reports: number;
    }>(
      `select
         (select count(*)::int from profiles) as learners,
         (select count(*)::int from profiles where plan='premium') as premium,
         (select count(*)::int from conversations) as conversations,
         (select count(*)::int from reported_users) as reports`,
    );
    const activity = await sql.query<{ user_id: string; action: string; detail: string; created_at: string }>(
      "select user_id, action, detail, created_at::text from activity_log order by created_at desc limit 40",
    );
    const bands = await sql.query<{ band: string; c: number }>(
      "select band, count(*)::int as c from profiles group by band",
    );
    return { users, counts: counts[0], activity, bands };
  });

export const adminUserDetail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    const profile = await sql.query<{
      display_name: string;
      band: string;
      public_id: string;
      plan: string;
      xp: number;
    }>("select display_name, band, public_id, plan, xp from profiles where user_id=$1", [data.userId]);
    const scores = await sql.query<{ overall: number; grammar: number; fluency: number; created_at: string }>(
      "select overall, grammar, fluency, created_at::text from speaking_scores where user_id=$1 order by created_at desc limit 20",
      [data.userId],
    );
    const mistakes = await sql.query<{ category: string; count: number; original: string }>(
      "select category, count, original from mistakes where user_id=$1 order by count desc limit 12",
      [data.userId],
    );
    const log = await sql.query<{ action: string; detail: string; created_at: string }>(
      "select action, detail, created_at::text from activity_log where user_id=$1 order by created_at desc limit 30",
      [data.userId],
    );
    return { profile: profile[0] ?? null, scores, mistakes, log };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string; role: "admin" | "learner"; plan?: "free" | "premium" }) => d)
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    if (data.plan) {
      await sql.query("update profiles set role=$2, plan=$3 where user_id=$1", [data.userId, data.role, data.plan]);
    } else {
      await sql.query("update profiles set role=$2 where user_id=$1", [data.userId, data.role]);
    }
    return { ok: true };
  });

export const adminReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireAdmin(context.userId);
    return sql.query<{ id: number; reporter_id: string; target_id: string; reason: string; created_at: string }>(
      "select id, reporter_id, target_id, reason, created_at::text from reported_users order by created_at desc limit 50",
    );
  });
