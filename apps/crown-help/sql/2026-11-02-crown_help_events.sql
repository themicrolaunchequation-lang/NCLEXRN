-- Applied to Supabase project ujeofxfbwivjmgrxqdcl on 2 November 2026 (migration "crown_help_events").
-- Anonymous Crown Help events. The table is not readable through the API; the only way in is crown_help_log().
create table if not exists public.crown_help_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('answer','miss','helpful','unhelpful','handover','crisis')),
  app text not null check (char_length(app) <= 24),
  path text check (char_length(path) <= 120),
  intent text check (char_length(intent) <= 16),
  query text check (char_length(query) <= 300)
);
alter table public.crown_help_events enable row level security;
revoke all on public.crown_help_events from anon, authenticated;
create index if not exists crown_help_events_created_idx on public.crown_help_events (created_at);

create or replace function public.crown_help_log(p_kind text, p_app text, p_path text, p_intent text, p_query text)
returns void language plpgsql security definer set search_path = public as $$
declare q text;
begin
  if p_kind not in ('answer','miss','helpful','unhelpful','handover','crisis') then return; end if;
  q := case when p_kind in ('miss','unhelpful') then left(p_query, 300) else null end;
  if q is not null then
    q := regexp_replace(q, '[^\s@]+@[^\s@]+', '[email]', 'g');
    q := regexp_replace(q, '\d[\d\s-]{6,}\d', '[number]', 'g');
  end if;
  if (select count(*) from public.crown_help_events where created_at > now() - interval '1 minute') > 600 then return; end if;
  insert into public.crown_help_events(kind, app, path, intent, query)
  values (p_kind, left(coalesce(p_app,'site'),24), left(p_path,120), left(p_intent,16), q);
end $$;
revoke all on function public.crown_help_log(text,text,text,text,text) from public;
grant execute on function public.crown_help_log(text,text,text,text,text) to anon, authenticated;

select cron.schedule('crown-help-retention', '17 3 * * *', $$delete from public.crown_help_events where created_at < now() - interval '30 days'$$);

-- Weekly review (run in the Supabase SQL editor):
-- select query, count(*) from crown_help_events where kind in ('miss','unhelpful') group by 1 order by 2 desc limit 30;
-- select intent, count(*) filter (where kind='helpful') yes, count(*) filter (where kind='unhelpful') no from crown_help_events group by 1 order by 3 desc;
-- select count(*) filter (where kind='answer') answered, count(*) filter (where kind='miss') missed, count(*) filter (where kind='handover') emailed from crown_help_events;
