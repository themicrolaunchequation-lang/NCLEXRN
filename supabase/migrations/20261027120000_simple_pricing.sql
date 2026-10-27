-- Simple pricing (27 Oct 2026): three things to buy.
--   1. Crown Pass (monthly or yearly, 7-day free trial) - unchanged.
--   2. Gulf Pass: all four Gulf Region exams plus the Crown Pass, paid once, 3 or 6 months.
--   3. Lean Six Sigma Green Belt - sold on its own site, unchanged.
-- Single-app plans and one-exam passes are retired for new buyers. Nobody has paid for them with real
-- money; anyone who already holds one keeps it until it ends (entitlements still read old rows).

-- 1. The Gulf Pass. crown-billing sells any active row in gulf_exam_plans, so no code change is needed there.
insert into public.gulf_exam_plans (id, exam, regulator, months, amount_usd, active, note) values
  ('gulf-all-3m', 'Gulf Pass: all four Gulf Region nursing exams + Crown Pass', 'SCFHS, DHP, DHA, DOH', 3, 50, true, 'Simple pricing 27 Oct 2026'),
  ('gulf-all-6m', 'Gulf Pass: all four Gulf Region nursing exams + Crown Pass', 'SCFHS, DHP, DHA, DOH', 6, 69, true, 'Simple pricing 27 Oct 2026')
on conflict (id) do update set exam = excluded.exam, regulator = excluded.regulator, months = excluded.months,
  amount_usd = excluded.amount_usd, active = true, note = excluded.note;

-- 2. Retire one-exam passes and single-app plans for new buyers.
update public.gulf_exam_plans set active = false where id ~ '^gulf-(saudi|qatar|dubai|abudhabi)-\d+m$';
update public.crown_plans set active = false where product in ('medlex', 'carecraft', 'lumen');

-- 3. Entitlements: a Gulf Pass ('gulf-all-...') opens all four exams and includes the Crown Pass while it lasts.
create or replace function public.crown_entitlements()
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  with owned as (
    select p.product from public.crown_subscriptions s join public.crown_plans p on p.id = s.plan_id
     where s.user_id = auth.uid() and s.status in ('trialing','active','past_due')
       and (s.current_period_end is null or s.current_period_end > now())
    union
    select product from public.crown_grants where user_id = auth.uid() and (until is null or until > now())
    union
    select 'crown' from public.gulf_passes
     where user_id = auth.uid() and plan_id like 'gulf-all-%' and until > now() and not coalesce(refunded, false)
  ),
  gulf as (
    select k.exam_key, max(g.until) as until
      from public.gulf_passes g
     cross join lateral unnest(case when split_part(g.plan_id, '-', 2) = 'all'
                                    then array['saudi','qatar','dubai','abudhabi']
                                    else array[split_part(g.plan_id, '-', 2)] end) as k(exam_key)
     where g.user_id = auth.uid() and g.until > now()
     group by 1
  )
  select case when auth.uid() is null then '{"signed_in":false}'::jsonb else jsonb_build_object(
    'signed_in', true,
    'admin', public.is_admin(),
    'medlex',    case when public.is_admin() or exists(select 1 from owned where product in ('medlex','crown'))    then 'premium' else 'free' end,
    'carecraft', case when public.is_admin() or exists(select 1 from owned where product in ('carecraft','crown')) then 'premium' else 'free' end,
    'serein',    case when public.is_admin() or exists(select 1 from owned where product in ('serein','crown'))    then 'premium' else 'free' end,
    'lumen',     case when public.is_admin() or exists(select 1 from owned where product in ('lumen','crown'))     then 'premium' else 'free' end,
    'crown',     public.is_admin() or exists(select 1 from owned where product = 'crown'),
    'gulf',      coalesce((select jsonb_object_agg(exam_key, until) from gulf), '{}'::jsonb)) end
$function$;
