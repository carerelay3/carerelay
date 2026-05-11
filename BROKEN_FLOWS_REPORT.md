# CareRelay Broken Flows Report

Audit date: 2026-05-11

## Summary

No launch-blocking account, team, admin, or plan flows were found during this pass.

The audit found one routing mismatch to track: the requested audit list names `/api/team/invite`, but the app currently implements live add/invite behavior through `/api/team/add` and has a legacy demo-only `/api/members/invite`. No UI was found calling `/api/team/invite`, so this is documented as a compatibility note rather than fixed by adding another route.

## Broken Flows Found

| Flow | Finding | Severity | Status |
| --- | --- | --- | --- |
| `/api/team/invite` | Route does not exist. Live add/invite behavior is `/api/team/add`; legacy `/api/members/invite` is demo-only and returns 501 outside demo mode. | Low | Documented |
| Stripe price mismatch risk | Checkout returns safe diagnostics when an env price ID does not exist in the active Stripe account. This was previously observed with a live key and a missing price. | Medium operational | Requires Stripe dashboard/env setup |
| PDF weekly summary | PDF is not implemented. | Low | Safely disabled with printable HTML and `pdfAvailable: false` |
| Push notifications | Not implemented. | Low | Safely disabled with no permission request |
| Dedicated family number | Twilio number provisioning is not implemented. | Low | Safely disabled with no purchase/provision button |

## Broken Flows Fixed In Current Codebase

- Logged-in nav hides signup/create account and shows Sign out.
- Sign out clears Supabase auth and server session bridge.
- Logged-in users visiting sign-in/sign-up redirect to dashboard.
- Setup no longer requires payment for the first free care circle.
- Setup returns specific error codes for auth, service role, validation, profile, care circle, recipient, owner member, invited member, and plan limit failures.
- Live dashboard no longer shows Demo Mode for authenticated live users.
- Dashboard shows setup CTA when no care circle exists.
- Team management enforces owner/admin/member roles and removed-member access loss.
- Admin page is founder/admin gated.
- Billing portal is safe-disabled when Stripe portal or customer is unavailable.
- Export and weekly summary endpoints are plan-gated and care-circle scoped.

## Remaining Disabled Features

- Push notifications are planned but disabled.
- Dedicated family numbers are planned for Family Plus but disabled.
- Multiple care recipients are planned for Family Plus but disabled in UI.
- Weekly summary PDF generation is disabled; printable HTML is available.
- `/api/team/invite` is not present; use `/api/team/add` for live team additions.

## Production Manual Setup Needed

1. Supabase Auth URLs:
   - Site URL: `https://carerelay.xyz`
   - Password recovery redirect: `https://carerelay.xyz/reset-password`
2. Supabase environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run Supabase migrations, including profile account fields, team role/status fields, billing subscriptions, and platform role support.
4. Stripe:
   - Set `STRIPE_SECRET_KEY`
   - Set real `STRIPE_PRICE_*` values that belong to the same Stripe mode/account as the secret key
   - Set `STRIPE_WEBHOOK_SECRET`
   - Configure Stripe Customer Portal before enabling portal use
5. Twilio:
   - Set configured inbound SMS webhook to `/api/sms/inbound`
   - Set `TWILIO_AUTH_TOKEN` for signature validation
   - Confirm `NEXT_PUBLIC_APP_URL` matches the public inbound webhook URL used by Twilio signatures
6. Founder/admin:
   - Run `npm run make-owner -- --email "founder@email.com" --care-circle-id "..." --platform-founder true`
   - Confirm `profiles.platform_role` is `founder`
7. Support:
   - Set `NEXT_PUBLIC_SUPPORT_EMAIL`

## Verification

Latest verification command results are recorded in the final assistant response for this audit pass.
