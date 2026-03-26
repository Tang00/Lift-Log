create extension if not exists pgcrypto;

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  position integer not null,
  name text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.template_sets (
  id uuid primary key default gen_random_uuid(),
  template_exercise_id uuid not null references public.template_exercises(id) on delete cascade,
  position integer not null,
  min_reps integer,
  max_reps integer,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.workout_templates(id) on delete set null,
  title text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  template_exercise_id uuid references public.template_exercises(id) on delete set null,
  position integer not null,
  name text not null,
  template_note text not null default '',
  session_note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  position integer not null,
  min_reps integer,
  max_reps integer,
  reps integer,
  weight numeric(8,2),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workout_templates enable row level security;
alter table public.template_exercises enable row level security;
alter table public.template_sets enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.session_sets enable row level security;

create policy "users_manage_own_templates"
on public.workout_templates
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users_manage_own_template_exercises"
on public.template_exercises
for all
using (
  exists (
    select 1
    from public.workout_templates t
    where t.id = template_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_templates t
    where t.id = template_id and t.user_id = auth.uid()
  )
);

create policy "users_manage_own_template_sets"
on public.template_sets
for all
using (
  exists (
    select 1
    from public.template_exercises e
    join public.workout_templates t on t.id = e.template_id
    where e.id = template_exercise_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.template_exercises e
    join public.workout_templates t on t.id = e.template_id
    where e.id = template_exercise_id and t.user_id = auth.uid()
  )
);

create policy "users_manage_own_sessions"
on public.workout_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users_manage_own_session_exercises"
on public.session_exercises
for all
using (
  exists (
    select 1
    from public.workout_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

create policy "users_manage_own_session_sets"
on public.session_sets
for all
using (
  exists (
    select 1
    from public.session_exercises e
    join public.workout_sessions s on s.id = e.session_id
    where e.id = session_exercise_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.session_exercises e
    join public.workout_sessions s on s.id = e.session_id
    where e.id = session_exercise_id and s.user_id = auth.uid()
  )
);
