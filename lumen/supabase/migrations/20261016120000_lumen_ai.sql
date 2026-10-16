-- Academy AI for Lumen: per-member daily allowance, an Academy-wide daily ceiling, and a shared
-- answer cache. Only the lumen-ai Edge Function (service role) writes to these tables.

create table if not exists public.lumen_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (timezone('utc', now()))::date,
  requests integer not null default 0,
  primary key (user_id, day)
);
create index if not exists lumen_ai_usage_day on public.lumen_ai_usage (day);
alter table public.lumen_ai_usage enable row level security;
drop policy if exists "Members read their own AI usage" on public.lumen_ai_usage;
create policy "Members read their own AI usage" on public.lumen_ai_usage
  for select to authenticated using (user_id = (select auth.uid()));

-- Generated answers keyed by a hash of the exact request. No user id is stored here.
create table if not exists public.lumen_ai_cache (
  key text primary key,
  text text not null,
  provider text,
  model text,
  created_at timestamptz not null default now()
);
create index if not exists lumen_ai_cache_created on public.lumen_ai_cache (created_at);
alter table public.lumen_ai_cache enable row level security;
-- No policies: only the service role can read or write the cache.

-- Takes one request. Returns what is left today, -1 when the member's allowance is used up,
-- or -2 when the Academy-wide ceiling for today is reached.
create or replace function public.lumen_ai_take(p_user uuid, p_limit integer, p_ceiling integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (timezone('utc', now()))::date;
  used integer;
  total integer;
begin
  select coalesce(sum(requests), 0) into total from lumen_ai_usage where day = today;
  if total >= p_ceiling then return -2; end if;
  insert into lumen_ai_usage as u (user_id, day, requests) values (p_user, today, 1)
  on conflict (user_id, day) do update set requests = u.requests + 1 where u.requests < p_limit
  returning u.requests into used;
  if used is null or used > p_limit then return -1; end if;
  return p_limit - used;
end;
$$;

-- Gives a request back when no provider could answer.
create or replace function public.lumen_ai_refund(p_user uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update lumen_ai_usage set requests = greatest(requests - 1, 0)
  where user_id = p_user and day = (timezone('utc', now()))::date;
$$;

revoke all on function public.lumen_ai_take(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.lumen_ai_refund(uuid) from public, anon, authenticated;
grant execute on function public.lumen_ai_take(uuid, integer, integer) to service_role;
grant execute on function public.lumen_ai_refund(uuid) to service_role;

-- Housekeeping: old usage rows and cached answers older than 30 days.
create or replace function public.lumen_ai_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from lumen_ai_usage where day < (timezone('utc', now()))::date - 60;
  delete from lumen_ai_cache where created_at < now() - interval '30 days';
$$;
revoke all on function public.lumen_ai_cleanup() from public, anon, authenticated;
grant execute on function public.lumen_ai_cleanup() to service_role;
