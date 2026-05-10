# CareRelay Route And Button Audit

Status key: Fixed = real navigation/action/fallback; Disabled = intentionally unavailable with explanation; Demo = public demo-only action.

## Global Navigation

| Surface | Link/Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- | --- |
| Header | CareRelay logo | `/` | Real nav | Fixed |
| Header | Demo | `/demo` | Real nav | Fixed |
| Header | Pricing | `/pricing` | Real nav | Fixed |
| Header | Dashboard | `/dashboard` | Auth-gated live route | Fixed |
| Header | Sign in | `/sign-in` | Supabase auth / demo redirect | Fixed |
| Footer/layout | Privacy | `/privacy` | Real nav | Fixed |
| Footer/layout | Terms | `/terms` | Real nav | Fixed |
| Footer/layout | Founder | `/founder` | Real nav | Fixed |
| 404 | Try the Demo | `/demo` | Real nav | Fixed |
| 404 | Back home | `/` | Real nav | Fixed |

## Homepage CTAs

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Try the Demo | `/demo` | Real nav | Fixed |
| Create a Care Circle | `/setup` | Auth-gated setup route | Fixed |
| Bottom CTA Try the Demo | `/demo` | Real nav | Fixed |
| Bottom CTA Create a Care Circle | `/setup` | Auth-gated setup route | Fixed |

## Pricing CTAs

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Starter card | POST `/api/stripe/checkout` | Stripe checkout or safe `/setup` fallback | Fixed |
| Family card | POST `/api/stripe/checkout` | Stripe checkout or safe `/setup` fallback | Fixed |
| Family Plus card | POST `/api/stripe/checkout` | Stripe checkout or safe `/setup` fallback | Fixed |

## Demo CTAs

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Send update | POST `/api/sms/mock` | Demo-only message parse/update; rejects non-demo care circle ids | Demo |
| Example SMS cards | POST `/api/sms/mock` with sample body | Demo-only; rejects non-demo care circle ids | Demo |
| Reset demo | Reloads `/demo` | Demo-only reset | Demo |
| Create account/care circle links | `/setup` or `/sign-up` where present | Auth-gated/live setup | Fixed |

## Auth Buttons

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Sign In | Supabase password auth, then `/api/auth/session`, then `/dashboard` | Real when configured; demo redirect when not configured | Fixed |
| Continue to setup | Supabase signup, then `/api/auth/session`, then `/setup` | Real when configured; demo redirect when not configured | Fixed |
| Create one | `/sign-up` | Real nav | Fixed |
| Sign in | `/sign-in` | Real nav | Fixed |

## Setup Buttons

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Add member | Client-side normalized phone add | Working client action | Fixed |
| Continue | Advances setup step | Working client action | Fixed |
| Back | Returns previous setup step | Working client action | Fixed |
| Enter Dashboard | POST `/api/setup`, then `/dashboard` | Auth-gated live create or safe error | Fixed |

## Dashboard Buttons

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Generate summary | POST `/api/summaries/generate` | Auth + membership in live mode; demo allowed for demo circle | Fixed |
| Demo message tester | POST `/api/sms/mock` | Visible only in demo mode | Fixed |
| Concern acknowledge | POST `/api/concerns/acknowledge` | Auth + record membership in live mode | Fixed |
| Assign task | POST `/api/tasks/assign` | Auth + record membership in live mode | Fixed |
| Task done/reopen | POST `/api/tasks/status` | Auth + record membership in live mode | Fixed |
| Supply bought/delivered | POST `/api/supplies/status` | Auth + record membership in live mode | Fixed |
| Generate handoff | POST `/api/handoffs/generate` | Demo works; live explicit unavailable after membership | Disabled |
| Review handoff | POST `/api/handoffs/review` | Demo works; live explicit unavailable | Disabled |
| Export JSON/CSV | POST `/api/export/timeline` | Demo works; live explicit unavailable after membership | Disabled |

## Settings Buttons

| Button | Destination/Action | Current status | Fixed status |
| --- | --- | --- | --- |
| Manage Billing & Invoices | POST `/api/billing/portal` | Auth required when Stripe configured; explicit unavailable until customer lookup | Disabled |
| Upgrade Plan | `/pricing` | Real nav | Fixed |

## Dead Button Scan

- No `href="#"` links found.
- No empty `onClick` handlers found.
- No unlabeled “coming soon” CTA remains; unavailable live features return explicit safe messages.
