-- SpeakAI English — app schema (per-user rows use TEXT user_id)

create table if not exists profiles (
  user_id text primary key,
  display_name text not null default '',
  username text unique,
  public_id text unique,
  phone text,
  native_language text not null default 'Hindi',
  band text not null default 'C',
  cefr_level text not null default 'A2',
  english_level text not null default 'elementary',
  goal text not null default 'general_fluency',
  daily_minutes integer not null default 20,
  topics text not null default '[]',
  role text not null default 'learner',
  onboarding_complete boolean not null default false,
  assessment_complete boolean not null default false,
  hindi_dependency integer not null default 70,
  plan text not null default 'free',
  bio text not null default '',
  interests text not null default '[]',
  availability text not null default 'evenings',
  xp integer not null default 0,
  coins integer not null default 0,
  streak_days integer not null default 0,
  last_practice_date text,
  practice_minutes integer not null default 0,
  words_learned integer not null default 0,
  conversations_completed integer not null default 0,
  voice_pref text not null default 'eve',
  voice_speed text not null default 'normal',
  accent_pref text not null default 'indian',
  theme_pref text not null default 'system',
  notify_prefs text not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists speaking_scores (
  id serial primary key,
  user_id text not null,
  grammar integer not null default 0,
  vocabulary integer not null default 0,
  pronunciation integer not null default 0,
  fluency integer not null default 0,
  structure integer not null default 0,
  naturalness integer not null default 0,
  listening integer not null default 0,
  confidence integer not null default 0,
  professional integer not null default 0,
  overall integer not null default 0,
  source text not null default 'session',
  created_at timestamptz not null default now()
);
create index if not exists speaking_scores_user_idx on speaking_scores (user_id, created_at desc);

create table if not exists conversations (
  id serial primary key,
  user_id text not null,
  kind text not null default 'partner',
  title text not null default 'Conversation',
  mode text not null default 'teacher',
  topic text,
  meta text not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_idx on conversations (user_id, updated_at desc);

create table if not exists messages (
  id serial primary key,
  conversation_id integer not null references conversations(id) on delete cascade,
  user_id text not null,
  role text not null,
  content text not null,
  correction text,
  created_at timestamptz not null default now()
);
create index if not exists messages_convo_idx on messages (conversation_id, id);

create table if not exists mistakes (
  id serial primary key,
  user_id text not null,
  category text not null,
  original text not null,
  corrected text not null,
  hindi_explanation text not null default '',
  count integer not null default 1,
  last_seen timestamptz not null default now()
);
create index if not exists mistakes_user_idx on mistakes (user_id, count desc);

create table if not exists user_vocabulary (
  id serial primary key,
  user_id text not null,
  word text not null,
  category text not null default 'daily',
  status text not null default 'learning',
  ease integer not null default 0,
  last_reviewed timestamptz,
  unique (user_id, word)
);

create table if not exists lesson_progress (
  id serial primary key,
  user_id text not null,
  lesson_id text not null,
  kind text not null,
  status text not null default 'unlocked',
  score integer,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists game_scores (
  id serial primary key,
  user_id text not null,
  game_id text not null,
  score integer not null default 0,
  xp_earned integer not null default 0,
  coins_earned integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists game_scores_user_idx on game_scores (user_id, created_at desc);

create table if not exists daily_lessons (
  id serial primary key,
  user_id text not null,
  day text not null,
  payload text not null,
  completed boolean not null default false,
  unique (user_id, day)
);

create table if not exists groups (
  id serial primary key,
  owner_id text not null,
  name text not null,
  slug text unique not null,
  topic text not null default 'general',
  description text not null default '',
  is_public boolean not null default true,
  level_band text,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id integer not null references groups(id) on delete cascade,
  user_id text not null,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists friend_requests (
  id serial primary key,
  from_id text not null,
  to_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_id, to_id)
);

create table if not exists chats (
  id serial primary key,
  kind text not null default 'direct',
  title text,
  created_at timestamptz not null default now()
);

create table if not exists chat_members (
  chat_id integer not null references chats(id) on delete cascade,
  user_id text not null,
  last_read_id integer not null default 0,
  primary key (chat_id, user_id)
);

create table if not exists chat_messages (
  id serial primary key,
  chat_id integer not null references chats(id) on delete cascade,
  user_id text not null,
  body text not null,
  kind text not null default 'text',
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_idx on chat_messages (chat_id, id);

create table if not exists calls (
  id serial primary key,
  room_code text unique not null,
  from_id text not null,
  to_id text,
  group_id integer,
  status text not null default 'ringing',
  ai_analysis boolean not null default false,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists notifications (
  id serial primary key,
  user_id text not null,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists activity_log (
  id serial primary key,
  user_id text not null,
  action text not null,
  detail text not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists activity_log_user_idx on activity_log (user_id, created_at desc);
create index if not exists activity_log_created_idx on activity_log (created_at desc);

create table if not exists ai_usage (
  user_id text not null,
  day text not null,
  calls integer not null default 0,
  primary key (user_id, day)
);

create table if not exists vocab_catalog (
  id serial primary key,
  word text not null,
  hindi text not null,
  meaning text not null,
  pronunciation text not null default '',
  example text not null,
  hindi_example text not null default '',
  synonyms text not null default '[]',
  antonyms text not null default '[]',
  difficulty text not null default 'beginner',
  category text not null default 'daily',
  usage_note text not null default ''
);

create table if not exists grammar_catalog (
  id serial primary key,
  slug text unique not null,
  title text not null,
  level text not null default 'beginner',
  explanation text not null,
  hindi_explanation text not null,
  examples text not null default '[]',
  mistakes text not null default '[]',
  practice text not null default '[]'
);

create table if not exists reported_users (
  id serial primary key,
  reporter_id text not null,
  target_id text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
