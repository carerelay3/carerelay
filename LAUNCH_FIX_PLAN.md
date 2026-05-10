# CareRelay Launch Fix Plan

## Page Routes

| Route | Access | Data mode | Current status | Specific fixes still required |
| --- | --- | --- | --- | --- |
| `/` | Public | Marketing | Live CTA page using brand assets | None blocking |
| `/_not-found` | Public | Static | Custom 404 with real links | None blocking |
| `/dashboard` | Auth required when Supabase configured | Live Supabase data | Protected; redirects to `/sign-in`; shows config message if Supabase missing | Live browser QA after deployed Supabase auth |
| `/demo` | Public | Demo only | Public demo uses in-memory demo store and mock SMS route | None blocking |
| `/founder` | Public | Demo/marketing | Reads demo snapshot for narrative | Confirm founder page remains desired before public launch |
| `/pricing` | Public | Stripe fallback/live checkout | Pricing CTA uses checkout route or safe fallback | Add full Stripe customer portal before public billing launch |
| `/privacy` | Public | Static | Safe legal copy | Human legal review required |
| `/settings` | Auth required when Supabase configured | Live account shell + billing fallback | Protected; redirects to `/sign-in`; shows config message if Supabase missing | Connect live subscription lookup |
| `/setup` | Auth required when Supabase configured | Live setup / config fallback | Protected; creates care circle through locked API | Live Supabase auth smoke test |
| `/sign-in` | Public | Supabase auth / demo redirect | Uses browser Supabase client and server session bridge | Validate email auth settings in Supabase project |
| `/sign-up` | Public | Supabase auth / demo redirect | Uses browser Supabase client and server session bridge | Validate email confirmation behavior |
| `/terms` | Public | Static | Safe terms copy | Human legal review required |

## API Routes

| Route | Access | Mutates live data | Current status | Specific fixes still required |
| --- | --- | --- | --- | --- |
| `/api/auth/session` | Public token exchange | Cookie only | Validates Supabase token and sets HTTP-only server cookie | Consider replacing custom bridge with pure SSR cookie flow after auth QA |
| `/api/billing/portal` | Auth required if Stripe configured | No | Safe unavailable response until customer lookup exists | Implement Stripe customer ownership lookup |
| `/api/concerns/acknowledge` | Auth + record membership in live mode | Yes | Updates live concern status only after membership | Add optimistic UI refresh for live mode |
| `/api/demo/seed` | Public | No live mutation | Demo snapshot only | None |
| `/api/export/timeline` | Membership required in live mode | No live mutation | Demo export works; live returns explicit unavailable response | Implement live export query if required |
| `/api/handoffs/generate` | Membership required in live mode | Demo only | Demo works; live returns explicit unavailable response | Implement live handoff persistence if required |
| `/api/handoffs/review` | Demo only | No live mutation | Live returns explicit unavailable response | Implement live handoff table/status if required |
| `/api/health` | Public | No | Reports config flags | None |
| `/api/members/invite` | Demo only | No live mutation | Live returns explicit unavailable response | Implement authenticated invite flow |
| `/api/messages/parse` | Public utility | No | Parser only, no persistence | Consider rate limiting |
| `/api/preferences/update` | Demo only | No live mutation | Live returns explicit unavailable response | Add preferences persistence table if needed |
| `/api/setup` | Auth required when Supabase configured | Yes | Creates profile, owner care circle, recipient, owner member, invited members | Apply migrations and live auth smoke test |
| `/api/sms/inbound` | Twilio signature if token exists | Yes | Strict missing/invalid signature rejection; safe TwiML; routes by sender phone | Test with real Twilio webhook URL |
| `/api/sms/mock` | Public demo | No live mutation | Accepts only `circle-demo-1`; demo-only routing and demo snapshot updates | None |
| `/api/stripe/checkout` | Public | Stripe session only | Validates plan ID; Stripe or safe fallback | Add auth/customer binding for paid launch |
| `/api/stripe/webhook` | Stripe signature | Yes | Uses server-only admin client after Stripe verification | Complete subscription upsert creation path |
| `/api/summaries/generate` | Auth + membership when Supabase configured | Yes | Membership-checked summary generation/upsert; deterministic fallback | Live QA with OpenAI key and without key |
| `/api/supplies/status` | Auth + record membership in live mode | Yes | Updates live supply status only after membership | Add UI refresh for live mode |
| `/api/tasks/assign` | Auth + record membership in live mode | Yes | Updates live task assignee only after membership | Validate assignee belongs to same care circle |
| `/api/tasks/status` | Auth + record membership in live mode | Yes | Updates live task status only after membership | Add UI refresh for live mode |

## Mock Data Usage

- `lib/demo/data.ts`: canonical demo store.
- `/demo`, `/api/demo/seed`, `/api/sms/mock`: public demo only.
- `/founder`: marketing/demo narrative.
- `/dashboard`: no fake live records; only empty/config states or authenticated Supabase data.

## Supabase Client/Admin Usage

- `lib/supabase/client.ts`: browser/RLS client via `@supabase/ssr`.
- `lib/supabase/server.ts`: server/RLS client via `@supabase/ssr` and cookies.
- `lib/supabase/proxy.ts`: request session refresh via `@supabase/ssr`.
- `lib/supabase/admin.ts`: service-role client, server-only.
- `lib/supabase/auth.ts`: user, membership, owner, and record authorization helpers.
- Admin use remains in server-only route handlers/loaders after authorization checks, plus Twilio sender routing.

## Remaining Fixes Before Public Launch

1. Apply migrations to Supabase and verify the transactional SMS RPC.
2. Test sign-up/sign-in/session refresh on the deployed domain.
3. Test real Twilio webhook signatures against production URL.
4. Complete live Stripe customer/subscription ownership mapping.
5. Decide whether live export, handoff, preferences, and invites are beta scope or intentionally unavailable.
6. Add rate limiting for public parser/demo/Twilio surfaces before broader traffic.
