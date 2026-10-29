-- Test-mode purchases unlock nothing for the public. Only admins and approved testers get access from them.
create table if not exists public.payment_testers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text,
  added_at timestamptz not null default now()
);
alter table public.payment_testers enable row level security; -- no policies: managed by the owner in SQL only

create or replace function public.is_payment_tester() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select public.is_admin() or exists (select 1 from public.payment_testers where user_id = auth.uid())
$$;
revoke all on function public.is_payment_tester() from public;
grant execute on function public.is_payment_tester() to authenticated;

create or replace function public.crown_entitlements() returns jsonb
language sql stable security definer set search_path to 'public', 'pg_temp' as $function$
  with owned as (
    select p.product from public.crown_subscriptions s join public.crown_plans p on p.id = s.plan_id
     where s.user_id = auth.uid() and s.status in ('trialing','active','past_due')
       and (s.current_period_end is null or s.current_period_end > now())
       and (s.livemode or public.is_payment_tester())
    union
    select product from public.crown_grants where user_id = auth.uid() and (until is null or until > now())
    union
    select 'crown' from public.gulf_passes
     where user_id = auth.uid() and plan_id like 'gulf-all-%' and until > now() and not coalesce(refunded, false)
       and (livemode or public.is_payment_tester())
  ),
  gulf as (
    select k.exam_key, max(g.until) as until
      from public.gulf_passes g
     cross join lateral unnest(case when split_part(g.plan_id, '-', 2) = 'all'
                                    then array['saudi','qatar','dubai','abudhabi']
                                    else array[split_part(g.plan_id, '-', 2)] end) as k(exam_key)
     where g.user_id = auth.uid() and g.until > now() and (g.livemode or public.is_payment_tester())
     group by 1
  )
  select case when auth.uid() is null then '{"signed_in":false}'::jsonb else jsonb_build_object(
    'signed_in', true,
    'admin', public.is_admin(),
    'tester', public.is_payment_tester(),
    'medlex',    case when public.is_admin() or exists(select 1 from owned where product in ('medlex','crown'))    then 'premium' else 'free' end,
    'carecraft', case when public.is_admin() or exists(select 1 from owned where product in ('carecraft','crown')) then 'premium' else 'free' end,
    'serein',    case when public.is_admin() or exists(select 1 from owned where product in ('serein','crown'))    then 'premium' else 'free' end,
    'lumen',     case when public.is_admin() or exists(select 1 from owned where product in ('lumen','crown'))     then 'premium' else 'free' end,
    'crown',     public.is_admin() or exists(select 1 from owned where product = 'crown'),
    'gulf',      coalesce((select jsonb_object_agg(exam_key, until) from gulf), '{}'::jsonb)) end
$function$;
