# CareRelay MVP

CareRelay is an SMS-first caregiver command center for families supporting a loved one.

## What CareRelay Is

- Family coordination for updates, tasks, appointments, supplies, and summary logs.
- A shared SMS intake number with dashboard organization.
- A calm coordination layer for caregivers.

## What CareRelay Is Not

- Not a doctor, nurse, emergency service, diagnostic system, treatment tool, or dosage advisor.
- Not a replacement for professional care.

## Product Boundary

- CareRelay is for family coordination only.
- Do not use CareRelay for emergencies. Call 911 or your local emergency number.
- CareRelay does not provide medical advice, diagnosis, treatment, or medication dosage recommendations.
- CareRelay helps organize family updates but does not monitor health or guarantee safety.

## Local Setup

1. Copy `.env.example` to `.env.local`
2. Install dependencies: `npm install`
3. Start app: `npm run dev`
4. Visit `http://localhost:3000`

## Demo Mode

- Works immediately with zero external credentials.
- Trigger demo seed via `GET /api/demo/seed`.
- Simulate inbound messages with `POST /api/sms/mock`.
- If services are missing, app gracefully falls back to demo behavior.

## Supabase Setup

- Create Supabase project and run migration `supabase/migrations/20260505073000_init.sql`.
- Optional seed file: `supabase/seed.sql`.
- Configure:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Twilio Webhook Setup

- Set:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- Point Twilio webhook to `POST /api/sms/inbound`.
- Twilio form payloads return TwiML responses.

## OpenAI Daily Summary Setup

- Set `OPENAI_API_KEY`.
- `POST /api/summaries/generate` uses OpenAI only when key is present.
- Without a key, deterministic fallback summaries are used.

## Stripe Setup Notes

- Set:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
- Pricing buttons call `POST /api/stripe/checkout`.
- Without Stripe keys, demo checkout completes and routes to setup.

## Run Tests

- `npm run test`

## Known MVP Limitations

- Demo state is in-memory and resets on server restart.
- RLS policies are baseline and should be expanded for production membership logic.
- SMS endpoint includes hardening notes; production rate limiting should be added.
- Weekly summary is preview-level in this MVP.

## Privacy and Medical Boundary Notes

- SMS is not ideal for highly sensitive information.
- Avoid sharing unnecessary sensitive details.
- Users can request deletion of care-circle data.
- This MVP is not a HIPAA-covered clinical system unless separately configured and contracted appropriately.
