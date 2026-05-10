# CareRelay Deployment Guide

## Required Environment Variables

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEMO_MODE=false`
- `NEXT_PUBLIC_ANALYTICS_ENABLED=false`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_FAMILY_PRICE_ID`
- `STRIPE_FAMILY_PLUS_PRICE_ID`

Demo mode works with empty third-party keys, but live SMS and live billing require the matching provider variables.

## Supabase

1. Create or link the Supabase project.
2. Run migrations with `supabase db push`.
3. Confirm RLS is enabled for care-circle tables.
4. Confirm `family_members.phone_normalized` and `care_circles.sms_keyword` indexes exist.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_`.

## Twilio

1. Use one shared CareRelay Twilio number for the MVP.
2. Set the incoming SMS webhook to `https://YOUR_DOMAIN/api/sms/inbound`.
3. Use HTTP `POST`.
4. Send a test SMS from a known family member phone.
5. Send a test SMS from an unknown phone and confirm the safe rejection response.

## Stripe

1. Configure Stripe price IDs for Starter, Family, and Family Plus.
2. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Configure webhook delivery to `https://YOUR_DOMAIN/api/stripe/webhook`.
4. Listen for subscription create, update, and delete events.
5. Keep Stripe disabled for demo environments unless testing live checkout.

## OpenAI

OpenAI is optional. If `OPENAI_API_KEY` is absent or an output fails safety filtering, CareRelay uses deterministic summaries.

## Smoke Test

- Homepage loads on desktop and mobile.
- `/demo` accepts sample SMS-style updates.
- `/setup` explains shared-number routing and reaches the dashboard.
- `/dashboard` renders messages, tasks, supplies, appointments, medication confirmations, concerns, and summaries.
- Pricing CTAs either start Stripe Checkout or route safely to demo setup.
- Twilio unknown sender does not create records.
- Multi-circle sender without keyword receives the keyword instruction.
- Concern SMS returns the required emergency reminder language.
- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass.

Human legal review is required before public launch.
