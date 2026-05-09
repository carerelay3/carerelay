# CareRelay Launch Checklist

## Required Checks

- [ ] `.env.example` is complete.
- [ ] No server secrets are exposed to client components.
- [ ] Demo mode works without Supabase, Twilio, OpenAI, Stripe, or analytics keys.
- [ ] Supabase migrations have been applied and RLS is enabled.
- [ ] Twilio inbound SMS webhook points to `/api/sms/inbound`.
- [ ] Stripe webhook points to `/api/stripe/webhook` if billing is enabled.
- [ ] `NEXT_PUBLIC_APP_URL` matches the deployed URL.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.

## Product Boundary Checks

- [ ] Homepage explains family coordination and shared-number routing.
- [ ] Setup explains that every family member texts the same CareRelay number.
- [ ] Unknown SMS senders cannot create records.
- [ ] Multi-circle helpers must use a care circle keyword.
- [ ] Concern responses use the approved family-review emergency reminder.
- [ ] Medication confirmations are described as family-reported organization logs.
- [ ] Privacy and terms have been reviewed by a human before public launch.

## Smoke Tests

- [ ] `/` loads on mobile and desktop.
- [ ] `/demo` processes sample SMS-style updates.
- [ ] `/setup` reaches `/dashboard`.
- [ ] `/dashboard` renders messages, tasks, supplies, appointments, medication confirmations, concerns, and summaries.
- [ ] `/pricing` buttons either start Stripe Checkout or safely use demo fallback.
- [ ] `/privacy` and `/terms` load.
- [ ] Twilio known sender logs an update.
- [ ] Twilio unknown sender receives a safe rejection.
- [ ] Twilio multi-circle sender without keyword receives keyword instructions.

## Human Review Before Public Launch

- [ ] Legal review of terms and privacy.
- [ ] Security review of production Supabase policies.
- [ ] Review of SMS consent and opt-out language.
- [ ] Review of billing copy and cancellation flow.
