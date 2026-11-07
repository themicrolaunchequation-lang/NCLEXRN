-- Correction to 20261107140000_revoke_anon_execute.
--
-- That migration ran and changed almost nothing. `anon` does not hold EXECUTE on
-- these functions directly: it inherits it from PUBLIC. pg_proc.proacl showed a
-- leading "=X/postgres" entry (the empty grantee is PUBLIC), so
-- `revoke execute ... from anon` was a no-op for eleven of the twelve. Only
-- is_payment_tester, which had no PUBLIC grant, was actually closed.
--
-- The fix is to revoke from PUBLIC. All twelve already carried an explicit
-- "authenticated=X/postgres", so revoking PUBLIC does not touch signed-in users;
-- the grant below is belt and braces in case a future rebuild drops it.
--
-- Applied to production 7 November 2026 and verified: 0 of 12 reachable by anon,
-- 12 of 12 reachable by authenticated.

do $$
declare f text;
begin
  foreach f in array array[
    'public.application_checklist(uuid)',
    'public.assign_external(uuid, uuid)',
    'public.audit_decide(uuid, boolean, text)',
    'public.external_decide(uuid, jsonb, text, text)',
    'public.mark_registration_checked(uuid)',
    'public.owner_decide(uuid, boolean, jsonb, text, text)',
    'public.resubmit_application(uuid)',
    'public.verify_file(uuid)',
    'public.verify_queue()',
    'public.crown_check_code(text, text)',
    'public.crown_entitlements()',
    'public.is_payment_tester()'
  ] loop
    if to_regprocedure(f) is not null then
      execute format('grant execute on function %s to authenticated', f);
      execute format('revoke execute on function %s from public, anon', f);
    end if;
  end loop;
end $$;

-- Verify (expect still_anon = 0, authenticated_ok = 12):
--   with t(fn) as (values ('application_checklist'),('assign_external'),('audit_decide'),
--     ('external_decide'),('mark_registration_checked'),('owner_decide'),('resubmit_application'),
--     ('verify_file'),('verify_queue'),('crown_check_code'),('crown_entitlements'),('is_payment_tester'))
--   select count(*) filter (where has_function_privilege('anon', p.oid,'execute')) as still_anon,
--          count(*) filter (where has_function_privilege('authenticated', p.oid,'execute')) as authenticated_ok
--     from pg_proc p join pg_namespace n on n.oid=p.pronamespace join t on t.fn=p.proname
--    where n.nspname='public' and p.prosecdef;
