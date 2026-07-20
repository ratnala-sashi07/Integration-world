-- ============================================================================
--  Course platform schema  (run in Supabase SQL editor, or via `supabase db push`)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'student' check (role in ('student','admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- courses ----------
create table if not exists public.courses (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  subtitle        text,
  description     text,
  thumbnail_url   text,
  price_cents     integer not null default 0,
  currency        text not null default 'usd',
  level           text default 'beginner',
  instructor_name text,
  duration_hours  text,          -- e.g. '50–70 hours'
  highlights      jsonb not null default '[]'::jsonb,  -- [{"label":"Modules","value":"25"}]
  outcomes        jsonb not null default '[]'::jsonb,  -- ["Design and build AI Agents...", ...]
  published       boolean not null default false,
  stripe_price_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- modules ----------
create table if not exists public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  title      text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- lessons ----------
create table if not exists public.lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references public.modules(id) on delete cascade,
  title            text not null,
  description      text,
  mux_playback_id  text,
  mux_asset_id     text,
  duration_seconds integer default 0,
  position         integer not null default 0,
  is_preview       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ---------- enrollments ----------
create table if not exists public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------- lesson progress ----------
create table if not exists public.lesson_progress (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  lesson_id             uuid not null references public.lessons(id) on delete cascade,
  completed             boolean not null default false,
  last_position_seconds integer not null default 0,
  updated_at            timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ---------- quizzes ----------
create table if not exists public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  lesson_id   uuid references public.lessons(id) on delete set null,
  title       text not null,
  description text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id        uuid primary key default gen_random_uuid(),
  quiz_id   uuid not null references public.quizzes(id) on delete cascade,
  prompt    text not null,
  type      text not null default 'single' check (type in ('single','multiple')),
  options   jsonb not null default '[]'::jsonb,   -- ["A","B","C"]
  correct   jsonb not null default '[]'::jsonb,   -- [0,2]  (indices)
  points    integer not null default 1,
  position  integer not null default 0
);

create table if not exists public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  answers      jsonb not null default '{}'::jsonb,
  score        numeric not null default 0,
  max_score    numeric not null default 0,
  submitted_at timestamptz not null default now()
);

-- ---------- assignments ----------
create table if not exists public.assignments (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  title        text not null,
  instructions text,
  due_date     timestamptz,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  content       text,
  file_url      text,
  status        text not null default 'submitted' check (status in ('submitted','graded')),
  grade         numeric,
  feedback      text,
  submitted_at  timestamptz not null default now(),
  graded_at     timestamptz,
  unique (assignment_id, user_id)
);

-- ============================================================================
--  Row Level Security
-- ============================================================================
alter table public.profiles               enable row level security;
alter table public.courses                enable row level security;
alter table public.modules                enable row level security;
alter table public.lessons                enable row level security;
alter table public.enrollments            enable row level security;
alter table public.lesson_progress        enable row level security;
alter table public.quizzes                enable row level security;
alter table public.quiz_questions         enable row level security;
alter table public.quiz_attempts          enable row level security;
alter table public.assignments            enable row level security;
alter table public.assignment_submissions enable row level security;

-- NOTE: each policy is dropped first so this script is safe to re-run.

-- profiles: read/update your own; admins read all
drop policy if exists "profiles read own"   on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles read own"    on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own"  on public.profiles for update using (id = auth.uid());

-- courses: published are public; admins do everything
drop policy if exists "courses read published" on public.courses;
drop policy if exists "courses admin write"    on public.courses;
create policy "courses read published" on public.courses for select using (published = true or public.is_admin());
create policy "courses admin write"    on public.courses for all using (public.is_admin()) with check (public.is_admin());

-- modules & lessons: readable when parent course is published; admins full
drop policy if exists "modules read"        on public.modules;
drop policy if exists "modules admin write" on public.modules;
create policy "modules read" on public.modules for select
  using (public.is_admin() or exists (select 1 from public.courses c where c.id = course_id and c.published));
create policy "modules admin write" on public.modules for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lessons read"        on public.lessons;
drop policy if exists "lessons admin write" on public.lessons;
create policy "lessons read" on public.lessons for select
  using (public.is_admin() or exists (
    select 1 from public.modules m join public.courses c on c.id = m.course_id
    where m.id = module_id and c.published));
create policy "lessons admin write" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

-- enrollments: see your own; admins all. (Inserts happen via service role in the webhook.)
drop policy if exists "enrollments read own" on public.enrollments;
create policy "enrollments read own" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());

-- lesson_progress: full CRUD on your own rows
drop policy if exists "progress own" on public.lesson_progress;
create policy "progress own" on public.lesson_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- quizzes: readable if enrolled or admin
drop policy if exists "quizzes read"        on public.quizzes;
drop policy if exists "quizzes admin write" on public.quizzes;
create policy "quizzes read" on public.quizzes for select
  using (public.is_admin() or exists (
    select 1 from public.enrollments e where e.course_id = course_id and e.user_id = auth.uid()));
create policy "quizzes admin write" on public.quizzes for all using (public.is_admin()) with check (public.is_admin());

-- quiz_questions: ADMIN ONLY (answer key lives here). Students get questions via a
-- server route that strips `correct`. Grading is done server-side with service role.
drop policy if exists "questions admin" on public.quiz_questions;
create policy "questions admin" on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());

-- quiz_attempts: your own
drop policy if exists "attempts own" on public.quiz_attempts;
create policy "attempts own" on public.quiz_attempts for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- assignments: readable if enrolled or admin
drop policy if exists "assignments read"        on public.assignments;
drop policy if exists "assignments admin write" on public.assignments;
create policy "assignments read" on public.assignments for select
  using (public.is_admin() or exists (
    select 1 from public.enrollments e where e.course_id = course_id and e.user_id = auth.uid()));
create policy "assignments admin write" on public.assignments for all using (public.is_admin()) with check (public.is_admin());

-- assignment_submissions: your own; admins read/update (for grading)
drop policy if exists "submissions own"   on public.assignment_submissions;
drop policy if exists "submissions admin" on public.assignment_submissions;
drop policy if exists "submissions grade" on public.assignment_submissions;
create policy "submissions own"   on public.assignment_submissions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "submissions admin" on public.assignment_submissions for select using (public.is_admin());
create policy "submissions grade" on public.assignment_submissions for update using (public.is_admin());

-- Helpful indexes
create index if not exists idx_modules_course     on public.modules(course_id);
create index if not exists idx_lessons_module      on public.lessons(module_id);
create index if not exists idx_enrollments_user    on public.enrollments(user_id);
create index if not exists idx_progress_user       on public.lesson_progress(user_id);
create index if not exists idx_questions_quiz       on public.quiz_questions(quiz_id);
