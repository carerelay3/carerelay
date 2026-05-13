# CareRelay Product Audit Report

Date: 2026-05-13

## Executive Summary

CareRelay has a credible MVP shape: a caregiver-focused marketing site, demo, Supabase Auth, live care-circle setup, team management, SMS ingestion, dashboard records, summaries, billing hooks, PWA manifest/icons, and safety disclaimers. The strongest product insight is still sound: families already coordinate by text, and CareRelay turns those scattered texts into a shared dashboard.

The beta blocker is not the concept. It is reliability and clarity around live setup, SMS configuration, billing readiness, and demo/live separation. The app must stop implying live SMS, billing, push, dedicated numbers, or summaries are ready unless the backend and environment are actually configured.

## What Works

- Marketing homepage explains the core promise clearly: one shared SMS number for family caregiving coordination.
- Demo route is useful and low-friction; users can test categorization without signup.
- Supabase Auth sign-up, sign-in, forgot-password, reset-password, and HTTP-only session bridge are present.
- Auth-protected `/dashboard`, `/setup`, `/account`, `/team`, `/settings`, and `/admin` use server-side checks.
- Team management supports owner/admin/member roles, plan limits, removal, role changes, and ownership transfer.
- Dashboard shows core caregiving categories: updates, tasks, supplies, appointments, medication confirmations, concerns, summaries.
- SMS inbound route validates Twilio signatures when configured and returns safe TwiML.
- Unknown senders and multi-circle senders get useful SMS replies.
- Medical boundary appears in homepage, terms, privacy, support, dashboard, medication log, concerns, summaries, offline page, and setup.
- PWA install basics exist: manifest, icons, service worker, offline fallback, Apple metadata.
- Stripe checkout, webhook, and billing portal routes are present with configuration diagnostics.
- Admin page has basic operational lookup and role actions, gated by platform role.
- Tests cover auth, team, routing, SMS, summaries, onboarding, billing, mobile/PWA, and launch hardening.

## What Is Broken Or Risky

- Live setup previously sent the demo shared phone number into `/api/setup`. This audit pass fixed that so live setup uses configured Twilio only.
- `/api/members/invite` is demo-only and returns 501 outside demo mode, while live team add happens through `/api/team/add`. This is confusing because the requested API surface includes invite semantics.
- Setup says “Assigned from Twilio config,” but it does not show whether Twilio is configured before submit. The dashboard catches this later with “SMS not configured yet.”
- Stripe pricing buttons are active even when Stripe is not configured; they show an alert after clicking. This is acceptable for MVP diagnostics but clumsy for beta.
- The support page may show “Support email not configured,” which is useful for staging but unacceptable in public beta.
- Password reset copy hardcodes `https://carerelay.xyz/reset-password` even if `NEXT_PUBLIC_APP_URL` differs.
- Summary generation can return generic “Failed to generate summary” from `/api/summaries/generate`; some lower-level OpenAI/config failures may not be clear to users.
- Founder page is demo/pilot operational content but is public. It should be hidden, admin-gated, or reframed before beta.
- Admin page exposes powerful actions and user/circle IDs. It is role-gated, but it needs audit logs before real operations.
- Service worker is intentionally light, but installed PWAs can still require users to relaunch after a deploy depending on browser behavior.
- No visible SMS delivery/status log exists for inbound failures, unknown sender attempts, Twilio signature failures, parser failures, or record creation failures.
- No account deletion/self-serve data export request flow exists, despite privacy copy mentioning deletion requests.

## What Is Confusing

- “Create a Care Circle” on the homepage links to `/setup`, which redirects unauthenticated users to sign in. Better CTA: “Create account” or “Start setup.”
- “One shared number” is central, but live Twilio configuration and shared-number assignment are not explained during setup.
- Team uses “family members,” “members,” “invited,” “active,” “joined,” “not_invited,” and “status” concepts. Users only need “Can text,” “Can manage,” and “Removed.”
- Pricing says “Start in demo mode without a card” but pricing CTAs initiate Stripe checkout, not demo.
- Family Plus says dedicated family number is future-only, while the core product says one shared number. Clarify: beta uses one configured CareRelay number, future add-on may assign dedicated numbers.
- Weekly summary says printable HTML is ready but PDF is not. That is honest but should be positioned as beta.
- Medical disclaimers are strong, but “Health” manifest category may invite app-store medical scrutiny.
- “Care circle keyword” is useful for multi-circle routing but unfamiliar. Setup should show when it matters and when it can be ignored.

## Missing For Beta Launch

- Production support email configured and visible.
- Twilio production webhook validation tested against exact deployed URL.
- Clear Twilio status panel in settings/admin.
- SMS event log for inbound success/failure, unknown sender, no keyword, parser category, linked record creation.
- Better setup completion screen: “SMS live,” “SMS not configured,” or “Dashboard ready without SMS.”
- Real invitation flow if email invites are claimed, or copy that phone-number access is manually added.
- Account deletion request flow and admin deletion runbook.
- Privacy/terms human legal review.
- Billing public-readiness: real Stripe price IDs, customer portal config, test purchase, webhook replay, cancellation copy.
- App/PWA mobile QA on 320, 375, 390, 414, 430 px widths after every dashboard/header change.
- Admin audit trail for role changes, owner transfer, platform admin changes, and member removals.
- Rate limiting or abuse controls for public APIs and SMS mock endpoints.
- Monitoring/log review for `/api/sms/inbound`, `/api/stripe/webhook`, `/api/setup`, and summary generation.

## Must Fix Before Beta

1. Configure real support email or hide contact promises.
2. Verify live setup never stores fake/demo numbers. The code fix is in place; add a regression test if not already covered by setup route tests.
3. Add SMS status visibility in settings/admin: configured number, webhook URL, last inbound success, last inbound error.
4. Disable or clearly label checkout buttons when Stripe price IDs are placeholders or Stripe is absent.
5. Gate or remove `/founder` from public navigation/indexing.
6. Add user-facing copy for “SMS not configured yet” during setup, not only on dashboard.
7. Add data deletion request path and support workflow.
8. Confirm Supabase redirect allowlist for production and localhost reset flows.
9. Add app-store-safe language review for manifest category, privacy, terms, and store copy.
10. Add operational logging for SMS failures and admin actions.

## Can Wait

- Native iOS/Android wrapper.
- Push notifications.
- Dedicated number provisioning.
- PDF generation.
- Multi-recipient dashboards.
- Broad family/household/team modes.
- Advanced analytics dashboards.
- Organization/team plan billing.

## Remove Or Simplify

- Remove “Marketing assets” section from homepage before public launch; it reads internal.
- Hide founder pilot page or put it behind admin.
- Replace “Start with Starter/Family/Family Plus” with “Upgrade” only after auth, or “Join beta” until billing is live.
- Replace implementation-facing support copy with customer-facing instructions once environment is configured.
- Avoid showing database IDs to normal users; keep them admin-only.

## Disable Until Ready

- Push notifications: already disabled correctly.
- Dedicated family number provisioning: already disabled correctly.
- PDF weekly summaries: keep as printable HTML beta only.
- Live email invites if no delivery system exists.
- Native app store submission until icons, screenshots, privacy labels, billing policy, and WebView auth are tested.

## Page Audit Notes

- `/`: Strong positioning, but internal marketing-assets block should be removed. CTA to `/setup` should account for auth.
- `/demo`: Good interactive demo. Keep clearly labeled demo-only.
- `/pricing`: Good structure, but checkout buttons need config-aware disabled state for beta.
- `/sign-up` and `/sign-in`: Clear and auth-aware. Redirect signed-in users correctly.
- `/forgot-password` and `/reset-password`: Functional, but redirect URL copy should derive from config.
- `/setup`: Strong guided setup. Needs live SMS config clarity. Fixed demo-number submission during this audit.
- `/dashboard`: Now mobile-friendlier. Needs richer SMS status and actionability.
- `/account`: Useful profile and access view. Needs account deletion path.
- `/team`: Good role model. Needs clearer invite semantics and maybe “can text” labels.
- `/settings`: Good hub. Needs operational SMS status and better billing readiness language.
- `/support`: Good content. Must configure support email before beta.
- `/admin`: Useful but needs audit logging and tighter operational guardrails.
- `/privacy` and `/terms`: Strong MVP boundaries; need legal review.
- `/founder`: Public demo operations page should be hidden or admin-gated.
- `/offline`: Good, honest offline boundary.
- `/manifest.webmanifest`: Exists and includes icon assets. Consider category change from `health` to less medical-sensitive if positioning broadens.

## API Audit Notes

- `/api/auth/session`: Good bridge. Cookie max age is one hour; evaluate session refresh expectations for installed PWA.
- `/api/profile/update`: Good ownership behavior and validation.
- `/api/setup`: Good plan checks and creation path. Live shared phone now uses Twilio config, not client demo value.
- `/api/team/*`: Good permission checks. Needs clearer invite lifecycle.
- `/api/members/invite`: Demo-only; either remove from live expectations or replace with live invite route.
- `/api/stripe/*` and `/api/billing/portal`: Good diagnostics; public UX should avoid failed checkout surprises.
- `/api/sms/inbound`: Good Twilio signature path and safe replies. Needs durable failure logging.
- `/api/sms/mock`: Correctly demo-only for demo circle.
- `/api/summaries/*`: Good safety direction; improve error specificity and cost/rate controls.
- `/api/tasks/*`, `/api/supplies/status`, `/api/concerns/acknowledge`: Good membership checks.
- `/api/export/timeline`: Good plan gating.
- `/api/health`: Useful; avoid exposing more detail than needed publicly.

