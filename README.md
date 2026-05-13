# CircleRelay

CircleRelay is a shared-number coordination platform for groups and circles. One shared CircleRelay line receives text updates, routes each message by the sender phone number, and organizes the result into a shared dashboard. The original caregiving product now lives as CircleRelay Care Mode.

## What It Does

- Shared SMS update feed
- Sender phone number routing
- Care notes, tasks, appointments, groceries, and supplies
- Family-reported medication confirmation logs
- Concern flags for family review
- Daily and weekly summaries
- Shared family dashboard and export-ready timeline structure

## What It Is Not

CircleRelay Care Mode is for family coordination only. It is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services. In an emergency, call 911 or your local emergency number.

## Tech Stack

- Next.js 16 App Router
- React 19
- Supabase for database/auth when configured
- Twilio for inbound SMS when configured
- OpenAI summaries when configured, with deterministic fallback
- Stripe Checkout-ready billing when configured
- Vitest and ESLint

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs in demo mode without third-party credentials.

## Environment Variables

See `.env.example` for the complete list:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
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
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEMO_MODE`
- `NEXT_PUBLIC_ANALYTICS_ENABLED`

## Demo Mode

Missing Supabase, Twilio, OpenAI, Stripe, or analytics keys do not block local use. Demo mode uses seeded in-memory care circle data and deterministic summaries.

## Shared-Number Routing

CircleRelay MVP uses one shared Twilio number. Each sender phone number is normalized to E.164 and matched against `family_members.phone_normalized`. If a sender belongs to one care circle, CircleRelay routes automatically. If a sender belongs to more than one care circle, the message must start with that care circle keyword, such as `GRANDMA Meds: took night pills at 8pm`.

## Commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Production Notes

Run Supabase migrations before enabling live mode. Configure the Twilio webhook to `POST /api/sms/inbound`. Set `APP_BASE_URL` to the public HTTPS app origin, such as `https://carerelay.xyz`, because Twilio signature validation uses it to reconstruct the exact webhook URL server-side. `NEXT_PUBLIC_APP_URL` remains available for browser-facing links and local non-production fallback only. Configure Stripe webhook delivery to `POST /api/stripe/webhook` if billing is enabled.

Human legal review is required before public launch.
