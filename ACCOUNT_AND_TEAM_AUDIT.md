# CareRelay Account And Team Audit

Audit date: 2026-05-11

Scope: account, setup, team, admin, plans, billing, SMS, summaries, export, support, and safety-critical launch flows.

CareRelay is family coordination software. It does not provide medical advice, diagnosis, treatment, monitoring, medication dosage guidance, triage, or emergency response.

## Executive Summary

- Account navigation is auth-aware: logged-out users see Demo, Pricing, Sign in, and Create account; logged-in users see Dashboard, Team, Account, Settings, Sign out, plus Admin only for platform admin/founder users.
- Live dashboard data is care-circle scoped and selected through `careCircleId`; unauthorized care circle selection falls back to a circle the user belongs to.
- Setup creates a live profile, care circle, care recipient, owner membership, and invited members without requiring payment for the free plan.
- Team management supports owner/admin/member roles, removed member status, owner transfer, plan limits, and duplicate phone blocking.
- Admin tools require `profiles.platform_role = 'founder'` or `admin`; normal users redirect away.
- Future features are safely disabled: push notifications, dedicated family numbers, multiple recipients, and PDF generation.
- No `href="#"`, empty `onClick`, service role client export, or live-dashboard "Demo Mode" leakage was found in static scans.

## Page Audit

| Page | Access | Data mode | Buttons/forms | Failure state | Status |
| --- | --- | --- | --- | --- | --- |
| `/` | Public | Marketing/demo copy only | Demo, pricing, signup links | Static page | OK |
| `/demo` | Public demo | Demo store only | Mock SMS/demo dashboard controls | Demo endpoint rejects live circle mutation | OK |
| `/pricing` | Public | Plan copy and Stripe checkout CTA | Checkout links/buttons | Stripe route returns safe config/price errors | OK |
| `/sign-up` | Public unless logged in | Live Supabase Auth | Auth form | Supabase-not-configured message; logged-in redirect to `/dashboard` | OK |
| `/sign-in` | Public unless logged in | Live Supabase Auth | Auth form, forgot password | Supabase-not-configured message; logged-in redirect to `/dashboard` | OK |
| `/forgot-password` | Public | Supabase reset email | Email form | Clear configured/unconfigured states | OK |
| `/reset-password` | Public recovery flow | Supabase session/password update | Password form | Clear configured/unconfigured states | OK |
| `/setup` | Auth required when Supabase configured | Live writes; demo fallback only when Supabase absent | Multi-step setup form | Specific setup error codes surfaced in UI | OK |
| `/dashboard` | Auth required | Live Supabase data, or no-circle setup CTA | Care circle switcher when needed, daily/weekly summaries, mock tester only in demo | No-circle CTA; live "Demo Mode" hidden | OK |
| `/account` | Auth required | Live profile, plan, care circle access | Profile form, care circle switcher | Redirects unauthenticated; profile API returns safe errors | OK |
| `/team` | Auth required | Live family_members | Add/remove/role/transfer owner controls by role | Read-only member view; service-role missing state; no-circle CTA | OK |
| `/settings` | Auth required | Live plan/account/team links | Billing portal, account/team/support links, disabled future cards | Portal unavailable message; no fake push/dedicated number buttons | OK |
| `/support` | Public | Static support content/env email | Support email link when configured | Placeholder/env guidance when email missing | OK |
| `/admin` | Founder/admin only | Service-role operational data | User lookup/admin actions | Redirect normal users; no hard-delete user flow | OK |
| `/privacy` | Public | Static legal | Links only | Static page | OK |
| `/terms` | Public | Static legal/safety | Links only | Static page | OK |
| `/founder` | Public | Founder/demo explanation | Marketing CTA | Static page; demo wording limited to founder/demo page | OK |

## Consumer Must-Have Review

| Must-have | Status | Notes |
| --- | --- | --- |
| Clear sign-up | OK | `/sign-up` creates Supabase account and redirects logged-in users. |
| Clear login/logout | OK | `/sign-in`; sign out calls Supabase `signOut`, clears session bridge, redirects home. |
| Simple setup | OK | Free users can create one basic care circle. |
| Add family members | OK | `/team` owner/admin add people; setup can add initial invited members. |
| Remove family members | OK | Removed users lose access; owner removal guarded. |
| Know who has access | OK | `/team` and `/account` list roles/status/access. |
| Recent updates | OK | Dashboard message feed from `inbound_messages`. |
| Open tasks | OK | Dashboard task list and task status API. |
| Supplies needed | OK | Dashboard supply list and status API. |
| Appointments | OK | Dashboard appointment list. |
| Medication confirmations | OK | Dashboard medication log from messages/logs. |
| Concerns | OK | Dashboard concerns and acknowledgement API. |
| Daily summary | OK | Daily summary panel and generation endpoint. |
| Emergency disclaimer | OK | Setup, summaries, SMS concern reply, support/legal copy. |
| Profile/contact info | OK | `/account` plus `/api/profile/update`. |
| Billing/plan clarity | OK | `/settings`, pricing, current plan helper, portal safe disabled/errors. |
| Support link | OK | Header/footer routes and settings card link to `/support`. |

## API Audit

| API | Auth | Membership | Role | Demo/live | Safe errors | Tests |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/session` | POST validates token; DELETE clears bridge | No | No | Live auth bridge | Yes | Account tests |
| `/api/profile/update` | Required | Own profile only | User | Live write | Yes | Account tests |
| `/api/setup` | Required when Supabase configured | Creates owner membership | User | Live write or demo fallback when Supabase absent | Detailed codes | Onboarding tests |
| `/api/team/add` | Required | Required | Owner/admin | Live write | Detailed codes | Team tests |
| `/api/team/remove` | Required | Required | Owner/admin | Live write | Detailed codes, last owner guarded | Team tests |
| `/api/team/role` | Required | Required | Owner | Live write | Detailed codes, owner role change blocked | Team tests |
| `/api/team/transfer-owner` | Required | Required | Owner | Live write | Confirmation required | Team tests |
| `/api/team/invite` | N/A | N/A | N/A | Route not present | Use `/api/team/add`; legacy `/api/members/invite` is demo-only | Documented gap |
| `/api/stripe/checkout` | Optional user context | No | No | Live Stripe Checkout | Safe config/price diagnostics; debug hidden in production | SMS/checkout tests |
| `/api/stripe/webhook` | Stripe signature | No | Stripe webhook | Live billing write | Signature/config errors | Covered by build; add webhook integration test later |
| `/api/billing/portal` | Required | Own subscription lookup | User | Live Stripe portal | 503/404 safe messages | Billing tests |
| `/api/sms/inbound` | Twilio signature when token configured | Routes by sender/keyword | Sender membership by routing | Live SMS write | TwiML safe replies | SMS tests |
| `/api/sms/mock` | No | Demo circle only | Demo only | Demo write, rejects live care circles | Safe JSON errors | SMS tests |
| `/api/summaries/generate` | Required for live circles | Required for live circles | Member | Daily/legacy weekly | Safe auth errors; generic generation error | SMS tests |
| `/api/summaries/weekly` | Required | Required | Member | Live printable HTML | Plan gate and PDF-disabled message | Export/weekly tests |
| `/api/tasks/status` | Required in live mode | Record membership | Member | Live write or demo write | Safe errors | SMS tests |
| `/api/tasks/assign` | Required in live mode | Record membership; assignee same circle | Member | Live write or demo write | Safe errors | SMS tests |
| `/api/supplies/status` | Required in live mode | Record membership | Member | Live write or demo write | Safe errors | SMS tests |
| `/api/concerns/acknowledge` | Required in live mode | Record membership | Member | Live write or demo write | Safe errors | SMS tests |
| `/api/export/timeline` | Required for live circles | Required | Owner/admin | Demo export or live Family Plus export | Plan gate and safe export errors | SMS/export tests |
| `/api/health` | Public | No | No | Config status only | No secrets returned | Health tests |

## Static Scan Results

- `href="#"`: none found.
- Empty `onClick`: none found.
- "coming soon" without safe disabled/scaffold state: current occurrences are disabled/scaffolded future features.
- Live dashboard "Demo Mode": tests assert absent.
- Generic setup failure: UI maps setup codes to specific messages; fallback remains only as last resort.
- Public admin access: `/admin` checks current user and `platform_role`; normal users redirect to `/dashboard`.
- Service role in client files: no client export found; server admin helper only reads `SUPABASE_SERVICE_ROLE_KEY`.
- Leaked env vars: no `NEXT_PUBLIC_*SECRET`, raw Stripe secret, or service key leakage found.
- Dead billing portal: settings calls the route only when configured and otherwise shows clear disabled messaging.
- Broken team buttons: controls are gated by actor role and status; owner transfer requires confirmation.
- Broken sign out: sign out calls Supabase, deletes session bridge, redirects to `/`.
- Sign-up shown while logged in: header hides signup for logged-in users; signin/signup pages redirect logged-in users.

## Disabled Or Beta-Safe Features

- Push notifications: settings card only; no permission request or fake success.
- Dedicated family number: Family Plus placeholder only; no Twilio provisioning button.
- Multiple care recipients: informational disabled UI; dashboard stays on one selected care circle recipient.
- Weekly PDF: printable HTML only with `pdfAvailable: false`.
- Hard delete users: not exposed in admin tools.
