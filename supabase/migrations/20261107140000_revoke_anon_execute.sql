-- Close the anonymous EXECUTE grant on twelve public functions that need a
-- signed-in caller.
--
-- Supabase's security advisor reports 82 SECURITY DEFINER functions in
-- `public` reachable through the Data API: 32 by the `anon` role and 50 by
-- `authenticated`. This migration deals only with the subset of the `anon`
-- list that has no business being callable by someone who is not signed in.
--
-- Why this is safe to apply at any time: every function below already reads
-- auth.uid(), is_admin(), is_staff(), is_external_for() or is_payment_tester()
-- and therefore cannot do anything useful for an anonymous caller today. It
-- fails inside the function instead of at the door. Removing the grant moves
-- the refusal to the door and stops the endpoints answering at all, which also
-- stops them being used to probe for valid ids and codes. No call that works
-- today stops working.
--
-- Checked against production on 7 November 2026. Functions that do not exist
-- in a given database are skipped, so this is safe on a local test copy.

do $$
declare f text;
begin
  foreach f in array array[
    -- Evinca review desk: reviewer and admin operations
    'public.application_checklist(uuid)',
    'public.assign_external(uuid, uuid)',
    'public.audit_decide(uuid, boolean, text)',
    'public.external_decide(uuid, jsonb, text, text)',
    'public.mark_registration_checked(uuid)',
    'public.owner_decide(uuid, boolean, jsonb, text, text)',
    'public.resubmit_application(uuid)',
    'public.verify_file(uuid)',
    'public.verify_queue()',
    -- Crown Suite: account and billing helpers
    'public.crown_check_code(text, text)',
    'public.crown_entitlements()',
    'public.is_payment_tester()'
  ] loop
    if to_regprocedure(f) is not null then
      execute format('revoke execute on function %s from anon', f);
    end if;
  end loop;
end $$;

-- crown_check_code is the one worth calling out. With the anon grant in place
-- anybody could post candidate codes at /rest/v1/rpc/crown_check_code without
-- an account and read back which ones are live, so a discount code only has to
-- leak once to be found by guessing around it.

-- Deliberately left anonymous, because logged-out pages depend on them:
--   crown_verify, get_record, public_records, get_org, org_is_active,
--   integrity_stats, payment_availability, app_review_policies, subscribe,
--   check_invite, crown_help_log, and the token-addressed email-link flows
--   confirm_contribution(_v2), confirm_info(_v2), nominee_info,
--   verify_confirmer_email, get_assignment, submit_review.
--
-- Also deliberately untouched, and tracked separately:
--   * submit_dossier(jsonb) must stay anonymous because the Evinca intake form
--     is a public page. It is gated by an invite code only when
--     settings.invite_only = 'true', and that is currently 'false', so anyone
--     can insert dossiers without an account. That needs a rate limit or
--     invite_only, not a grant change.
--   * The 50 `authenticated` warnings are not addressed here. Administrators
--     are ordinary authenticated users, so revoking the role's EXECUTE would
--     lock them out of their own tools. Every one of those functions already
--     carries its own check; the advisor flags the grant, not a hole.

-- After applying, this should return no rows:
--   select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.prosecdef
--      and has_function_privilege('anon', p.oid, 'execute')
--      and p.proname in ('application_checklist','assign_external','audit_decide',
--        'external_decide','mark_registration_checked','owner_decide',
--        'resubmit_application','verify_file','verify_queue','crown_check_code',
--        'crown_entitlements','is_payment_tester');
