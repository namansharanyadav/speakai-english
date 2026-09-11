import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { BANDS, isBand, type Band } from "@/lib/bands";
import { getSql } from "@/lib/db";
import { parseJson, publicUserId, todayKey, usernameFrom } from "@/lib/utils";

export type Profile = {
  userId: string;
  displayName: string;
  username: string;
  publicId: string;
  phone: string | null;
  nativeLanguage: string;
  band: Band;
  cefrLevel: string;
  englishLevel: string;
  goal: string;
  dailyMinutes: number;
  topics: string[];
  role: string;
  onboardingComplete: boolean;
  assessmentComplete: boolean;
  hindiDependency: number;
  plan: string;
  bio: string;
  interests: string[];
  availability: string;
  xp: number;
  coins: number;
  streakDays: number;
  lastPracticeDate: string | null;
  practiceMinutes: number;
  wordsLearned: number;
  conversationsCompleted: number;
  voicePref: string;
  voiceSpeed: string;
  accentPref: string;
  email?: string | null;
};

type ProfileRow = {
  user_id: string;
  display_name: string;
  username: string | null;
  public_id: string | null;
  phone: string | null;
  native_language: string;
  band: string;
  cefr_level: string;
  english_level: string;
  goal: string;
  daily_minutes: number;
  topics: string;
  role: string;
  onboarding_complete: boolean;
  assessment_complete: boolean;
  hindi_dependency: number;
  plan: string;
  bio: string;
  interests: string;
  availability: string;
  xp: number;
  coins: number;
  streak_days: number;
  last_practice_date: string | null;
  practice_minutes: number;
  words_learned: number;
  conversations_completed: number;
  voice_pref: string;
  voice_speed: string;
  accent_pref: string;
};

function mapProfile(r: ProfileRow): Profile {
  return {
    userId: r.user_id,
    displayName: r.display_name,
    username: r.username ?? "",
    publicId: r.public_id ?? publicUserId(r.user_id),
    phone: r.phone,
    nativeLanguage: r.native_language,
    band: isBand(r.band) ? r.band : "C",
    cefrLevel: r.cefr_level,
    englishLevel: r.english_level,
    goal: r.goal,
    dailyMinutes: r.daily_minutes,
    topics: parseJson<string[]>(r.topics, []),
    role: r.role,
    onboardingComplete: Boolean(r.onboarding_complete),
    assessmentComplete: Boolean(r.assessment_complete),
    hindiDependency: r.hindi_dependency,
    plan: r.plan,
    bio: r.bio,
    interests: parseJson<string[]>(r.interests, []),
    availability: r.availability,
    xp: r.xp,
    coins: r.coins,
    streakDays: r.streak_days,
    lastPracticeDate: r.last_practice_date,
    practiceMinutes: r.practice_minutes,
    wordsLearned: r.words_learned,
    conversationsCompleted: r.conversations_completed,
    voicePref: r.voice_pref,
    voiceSpeed: r.voice_speed,
    accentPref: r.accent_pref,
  };
}

async function maybePromoteFirstAdmin(userId: string) {
  const sql = await getSql();
  const admins = await sql.query<{ c: number }>("select count(*)::int as c from profiles where role = 'admin'");
  if ((admins[0]?.c ?? 0) === 0) {
    await sql.query("update profiles set role = 'admin' where user_id = $1", [userId]);
  }
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<ProfileRow>("select * from profiles where user_id = $1", [context.userId]);
    if (rows[0]) return mapProfile(rows[0]);
    const pid = publicUserId(context.userId);
    const uname = usernameFrom("learner", context.userId);
    await sql.query(
      `insert into profiles (user_id, display_name, username, public_id)
       values ($1, $2, $3, $4)
       on conflict (user_id) do nothing`,
      [context.userId, "Learner", uname, pid],
    );
    await maybePromoteFirstAdmin(context.userId);
    const again = await sql.query<ProfileRow>("select * from profiles where user_id = $1", [context.userId]);
    return again[0] ? mapProfile(again[0]) : null;
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      displayName: string;
      phone?: string;
      nativeLanguage: string;
      band: Band;
      goal: string;
      dailyMinutes: number;
      topics: string[];
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const band = isBand(data.band) ? data.band : "C";
    const meta = BANDS[band];
    const name = data.displayName.trim().slice(0, 60) || "Learner";
    const pid = publicUserId(context.userId);
    const uname = usernameFrom(name, context.userId);
    await sql.query(
      `insert into profiles (
         user_id, display_name, username, public_id, phone, native_language, band,
         cefr_level, english_level, goal, daily_minutes, topics, hindi_dependency,
         onboarding_complete, updated_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,now())
       on conflict (user_id) do update set
         display_name = excluded.display_name,
         phone = excluded.phone,
         native_language = excluded.native_language,
         band = excluded.band,
         cefr_level = excluded.cefr_level,
         english_level = excluded.english_level,
         goal = excluded.goal,
         daily_minutes = excluded.daily_minutes,
         topics = excluded.topics,
         hindi_dependency = excluded.hindi_dependency,
         onboarding_complete = true,
         updated_at = now()`,
      [
        context.userId,
        name,
        uname,
        pid,
        data.phone?.replace(/\D/g, "").slice(0, 15) || null,
        data.nativeLanguage.slice(0, 40),
        band,
        meta.cefr,
        meta.englishLevel,
        data.goal.slice(0, 40),
        Math.max(5, Math.min(60, data.dailyMinutes)),
        JSON.stringify(data.topics.slice(0, 8)),
        meta.hindiRatio,
      ],
    );
    await maybePromoteFirstAdmin(context.userId);
    await sql.query(
      `insert into activity_log (user_id, action, detail) values ($1,'onboarding',$2)`,
      [context.userId, JSON.stringify({ band, goal: data.goal })],
    );
    const rows = await sql.query<ProfileRow>("select * from profiles where user_id = $1", [context.userId]);
    return rows[0] ? mapProfile(rows[0]) : null;
  });

export const completeAssessment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      recommendedBand?: Band;
      scores: Record<string, number>;
      transcript: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const band = isBand(data.recommendedBand) ? data.recommendedBand : undefined;
    if (band) {
      const meta = BANDS[band];
      await sql.query(
        `update profiles set band=$2, cefr_level=$3, english_level=$4, hindi_dependency=$5,
         assessment_complete=true, updated_at=now() where user_id=$1`,
        [context.userId, band, meta.cefr, meta.englishLevel, meta.hindiRatio],
      );
    } else {
      await sql.query(`update profiles set assessment_complete=true, updated_at=now() where user_id=$1`, [
        context.userId,
      ]);
    }
    const s = data.scores;
    const overall = Math.round(
      Object.values(s).reduce((a, b) => a + (Number(b) || 0), 0) / Math.max(1, Object.keys(s).length),
    );
    await sql.query(
      `insert into speaking_scores
        (user_id, grammar, vocabulary, pronunciation, fluency, structure, naturalness, listening, confidence, professional, overall, source)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'assessment')`,
      [
        context.userId,
        s.grammar ?? 0,
        s.vocabulary ?? 0,
        s.pronunciation ?? 0,
        s.fluency ?? 0,
        s.structure ?? 0,
        s.naturalness ?? 0,
        s.listening ?? 0,
        s.confidence ?? 0,
        s.professional ?? 0,
        overall,
      ],
    );
    await sql.query(`insert into activity_log (user_id, action, detail) values ($1,'assessment',$2)`, [
      context.userId,
      JSON.stringify({ band, overall, transcript: data.transcript.slice(0, 500) }),
    ]);
    return { ok: true, overall, band };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: Partial<Profile> & { deleteAccount?: boolean }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.deleteAccount) {
      await sql.query("delete from profiles where user_id=$1", [context.userId]);
      return { deleted: true };
    }
    const fields: string[] = [];
    const vals: unknown[] = [];
    const add = (col: string, val: unknown) => {
      vals.push(val);
      fields.push(`${col}=$${vals.length + 1}`);
    };
    if (data.displayName !== undefined) add("display_name", data.displayName.slice(0, 60));
    if (data.phone !== undefined) add("phone", data.phone);
    if (data.bio !== undefined) add("bio", data.bio.slice(0, 280));
    if (data.availability !== undefined) add("availability", data.availability);
    if (data.voicePref !== undefined) add("voice_pref", data.voicePref);
    if (data.voiceSpeed !== undefined) add("voice_speed", data.voiceSpeed);
    if (data.accentPref !== undefined) add("accent_pref", data.accentPref);
    if (data.plan !== undefined && (data.plan === "free" || data.plan === "premium")) add("plan", data.plan);
    if (data.interests) add("interests", JSON.stringify(data.interests));
    if (!fields.length) return { ok: true };
    vals.unshift(context.userId);
    await sql.query(`update profiles set ${fields.join(", ")}, updated_at=now() where user_id=$1`, vals);
    return { ok: true };
  });

export const awardPractice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { minutes?: number; xp?: number; coins?: number; words?: number; conversation?: boolean }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const day = todayKey();
    const rows = await sql.query<{ last_practice_date: string | null; streak_days: number }>(
      "select last_practice_date, streak_days from profiles where user_id=$1",
      [context.userId],
    );
    const last = rows[0]?.last_practice_date;
    let streak = rows[0]?.streak_days ?? 0;
    if (last === day) {
      // already counted today
    } else if (last) {
      const prev = new Date(last + "T00:00:00Z");
      const cur = new Date(day + "T00:00:00Z");
      const diff = (cur.getTime() - prev.getTime()) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
    } else streak = 1;
    await sql.query(
      `update profiles set
         practice_minutes = practice_minutes + $2,
         xp = xp + $3,
         coins = coins + $4,
         words_learned = words_learned + $5,
         conversations_completed = conversations_completed + $6,
         streak_days = $7,
         last_practice_date = $8,
         updated_at = now()
       where user_id=$1`,
      [
        context.userId,
        data.minutes ?? 0,
        data.xp ?? 0,
        data.coins ?? 0,
        data.words ?? 0,
        data.conversation ? 1 : 0,
        streak,
        day,
      ],
    );
    return { streak };
  });
