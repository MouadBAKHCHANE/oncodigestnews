-- OncoDigest — initial user schema
-- See docs/DATA-MODEL.md §"Supabase schema" and docs/AUTH-STATES.md for design rationale.

-- ─── Profiles ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields. Status drives content
-- gating; role drives admin panel access.
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text unique not null,
  full_name         text not null,
  rpps_number       text,
  specialty         text,
  hospital          text,
  status            text not null default 'pending'
                      check (status in ('pending', 'approved', 'revoked')),
  role              text not null default 'user'
                      check (role in ('user', 'admin')),
  created_at        timestamptz not null default now(),
  approved_at       timestamptz,
  approved_by       uuid references public.profiles(id),
  revoked_at        timestamptz,
  revoked_by        uuid references public.profiles(id),
  revocation_reason text
);

create index profiles_status_idx on public.profiles(status);
create index profiles_role_idx on public.profiles(role);

-- ─── Approval log ─────────────────────────────────────────────────────────────
-- Audit trail for every admin action on a user.
create table public.approval_log (
  id          bigserial primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  action      text not null check (action in ('approve', 'revoke', 'reset_to_pending')),
  actor_id    uuid not null references public.profiles(id),
  reason      text,
  created_at  timestamptz not null default now()
);

create index approval_log_profile_idx on public.approval_log(profile_id);

-- ─── Newsletter subscribers ───────────────────────────────────────────────────
create table public.newsletter_subscribers (
  email           text primary key,
  subscribed_at   timestamptz not null default now(),
  source          text,                      -- 'footer' | 'cta_section' | 'register'
  unsubscribed_at timestamptz
);

-- ─── Row-level security ───────────────────────────────────────────────────────
alter table public.profiles                enable row level security;
alter table public.approval_log            enable row level security;
alter table public.newsletter_subscribers  enable row level security;

-- Profiles: users read own; admins read all; admins update; users insert own row on signup
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "admins read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins update profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Approval log: admins read+insert; users read own
create policy "admins read all logs" on public.approval_log
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "users read own logs" on public.approval_log
  for select using (profile_id = auth.uid());

create policy "admins insert logs" on public.approval_log
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Newsletter: anyone can subscribe; only admins read
create policy "anyone subscribe" on public.newsletter_subscribers
  for insert with check (true);

create policy "admins read subscribers" on public.newsletter_subscribers
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Trigger: auto-create profile row on signup ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
