create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nickname text,
  phone text,
  is_goalkeeper boolean not null default false,
  is_guest boolean not null default false,
  is_active boolean not null default true,
  role text not null default 'player' check (role in ('admin', 'player')),
  created_at timestamptz not null default now()
);

create table if not exists public.player_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_by_player_id uuid references public.players(id) on delete set null,
  invite_type text not null default 'link' check (invite_type in ('qr', 'link')),
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique,
  label text not null
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete set null,
  match_date date not null,
  location text,
  start_time time,
  target_players integer not null default 14,
  fallback_players integer not null default 12,
  format_label text not null default '7v7',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'open', 'closed', 'played', 'cancelled', 'suspended')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.availability_responses (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  response text not null check (response in ('going', 'not_going', 'backup', 'dropped')),
  responded_at timestamptz not null default now(),
  drop_reason text,
  unique (match_id, player_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  name text not null,
  color text,
  goals integer not null default 0
);

create table if not exists public.match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  role text not null check (role in ('starter', 'substitute', 'guest')),
  attendance_status text not null
    check (attendance_status in ('confirmed', 'played', 'late_cancel', 'no_show')),
  priority_score numeric(8,2) not null default 0,
  priority_note text,
  unique (match_id, player_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  scorer_player_id uuid not null references public.players(id) on delete cascade,
  minute integer,
  is_own_goal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  is_active boolean not null default true
);

create index if not exists idx_matches_match_date on public.matches(match_date desc);
create index if not exists idx_availability_match_id on public.availability_responses(match_id);
create index if not exists idx_availability_player_id on public.availability_responses(player_id);
create index if not exists idx_participants_match_id on public.match_participants(match_id);
create index if not exists idx_goals_match_id on public.goals(match_id);
