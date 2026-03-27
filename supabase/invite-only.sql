create table if not exists public.invited_emails (
  email text primary key,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now()
);

alter table public.invited_emails enable row level security;

-- No authenticated or anonymous policies are added on purpose.
-- This table is intended to be managed only by the server using the service role key.
