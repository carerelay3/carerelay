# CareRelay Launch Audit

Status key: Live = production path connected to Supabase/Auth or external service; Demo = intentionally demo-only; Fallback = safe unavailable state; Locked = requires auth/membership in live mode.

## Page Routes

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Live | Marketing page with real CTAs to `/demo` and `/setup`; uses public brand assets. |
| `/demo` | Demo | Public demo, uses in-memory demo data and `/api/sms/mock`. |
| `/pricing` | Live/Fallback | Pricing buttons call checkout; Stripe missing returns safe setup fallback. |
| `/dashboard` | Live/Demo | Demo mode uses sample data; live mode loads Supabase records for authenticated member. |
| `/setup` | Live/Demo | Guided form; live creation handled by authenticated `/api/setup`; demo fallback when Supabase is absent/demo mode. |
| `/settings` | Fallback | Billing settings visible; portal unavailable unless customer lookup is connected. |
| `/sign-in` | Live/Demo | Supabase password auth when configured; demo redirects to dashboard. |
| `/sign-up` | Live/Demo | Supabase signup when configured; demo redirects to setup. |
| `/privacy` | Live | Static legal/privacy content. |
| `/terms` | Live | Static terms/safety content. |
| `/founder` | Demo/Marketing | Uses demo snapshot for product narrative. |
| `/_not-found` | Live | Real links to home/demo. |

## API Routes

| Route | Status | Auth/Membership |
| --- | --- | --- |
| `/api/setup` | Locked/Fallback | Requires authenticated Supabase user in live mode; demo fallback otherwise. |
| `/api/auth/session` | Live | Validates Supabase access token and sets/clears HTTP-only server session cookie. |
| `/api/summaries/generate` | Locked/Demo | Requires auth + care circle membership in live mode. |
| `/api/sms/inbound` | Live | Requires Twilio signature when token exists; routes by normalized sender phone. |
| `/api/sms/mock` | Demo | Public demo endpoint; routes only demo context and does not mutate live records. |
| `/api/tasks/status` | Locked/Demo | Updates Supabase only after record membership; demo store in demo mode. |
| `/api/tasks/assign` | Locked/Demo | Updates Supabase only after record membership; demo store in demo mode. |
| `/api/supplies/status` | Locked/Demo | Updates Supabase only after record membership; demo store in demo mode. |
| `/api/concerns/acknowledge` | Locked/Demo | Updates Supabase only after record membership; demo store in demo mode. |
| `/api/export/timeline` | Locked/Demo | Demo export public in demo; live currently returns explicit unavailable response after membership. |
| `/api/handoffs/generate` | Locked/Demo | Demo handoff public in demo; live unavailable response after membership. |
| `/api/handoffs/review` | Demo/Fallback | Demo-only; live returns unavailable. |
| `/api/members/invite` | Demo/Fallback | Demo-only; live returns unavailable until authenticated invite workflow is connected. |
| `/api/preferences/update` | Demo/Fallback | Demo-only; live returns unavailable until preferences table is connected. |
| `/api/stripe/checkout` | Live/Fallback | Validates plan IDs; creates Stripe checkout when configured or safe setup fallback. |
| `/api/stripe/webhook` | Live | Verifies Stripe signature; uses server-only admin client. |
| `/api/billing/portal` | Locked/Fallback | Requires auth if Stripe configured; returns unavailable until customer lookup is connected. |
| `/api/messages/parse` | Demo/Utility | Public parser utility; no persistence. |
| `/api/demo/seed` | Demo | Public demo snapshot seed. |
| `/api/health` | Live | Health/config status. |

## Visible Buttons / CTAs

| Surface | Button/Link | Status |
| --- | --- | --- |
| Header | Home, Demo, Pricing, Dashboard, Sign in | Real navigation |
| Homepage | Try the Demo, Create a Care Circle | Real navigation |
| Pricing cards | Start with plan | Stripe checkout or safe fallback |
| Demo | Send update, Try examples, Reset demo | Demo actions |
| Auth | Sign in / Continue to setup | Supabase auth when configured; demo redirect otherwise |
| Setup | Continue, Back, Add member, Enter Dashboard | Working form; live submit requires auth |
| Dashboard | Generate summary | Demo public or live membership-locked API |
| Settings | Manage Billing & Invoices | Fallback/unavailable unless portal connected |

## Mock Data Usage

- `lib/demo/data.ts`: canonical in-memory demo store.
- `/demo`, `/api/sms/mock`, `/api/demo/seed`: public demo.
- `/dashboard`: uses demo data only when `NEXT_PUBLIC_DEMO_MODE=true`; live mode uses Supabase loaders.
- `/founder`: marketing/demo narrative only.

## Service Role / Admin Usage

- `lib/supabase/admin.ts`: server-only admin client.
- `lib/supabase/auth.ts`: admin used after user identity for membership/owner checks.
- `lib/routing/resolveCareCircleFromSender.ts`: admin lookup for Twilio sender routing.
- `lib/messages/createLinkedRecords.ts`: admin RPC for atomic inbound + linked record creation.
- `lib/summaries/*`: admin reads/upserts after caller route verifies membership.
- Critical API routes use `requireUser` and membership helpers before live admin writes.

## Client-Accepted `careCircleId`

- `/api/summaries/generate`: membership required in live mode.
- `/api/export/timeline`: membership required before live unavailable response.
- `/api/handoffs/generate`: membership required before live unavailable response.
- `/api/sms/mock`: demo-only context.

## Required Environment Variables

- Demo: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEMO_MODE=true`, `NEXT_PUBLIC_ANALYTICS_ENABLED=false`.
- Live Supabase: `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
- OpenAI: `OPENAI_API_KEY` optional; deterministic fallback if missing.
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_*_PRICE_ID`.

## Remaining Non-Blocking Launch Notes

- Live billing portal customer lookup is intentionally unavailable until Stripe customer ownership is connected.
- Live handoff/export/member-invite/preferences endpoints return explicit unavailable responses where the database workflow is not fully connected.
- Supabase migrations must be applied before using the transactional SMS RPC.
