# CareRelay MVP+

CareRelay is an SMS-first caregiver command center for families supporting a loved one.

## What CareRelay Is

- Family coordination for updates, tasks, appointments, supplies, medication logs, concerns, and daily summaries.
- A shared SMS intake number with dashboard organization.
- A calm coordination layer for caregivers.
- SMS command shortcuts for quick updates.
- Daily handoff generation for caregiver shift changes.
- Exportable family coordination timeline.

## What CareRelay Is Not

- Not a doctor, nurse, emergency service, diagnostic system, treatment tool, or dosage advisor.
- Not a replacement for professional care.
- Not a HIPAA-covered clinical system unless separately configured and contracted appropriately.

## Product Boundary

- CareRelay is for family coordination only.
- Do not use CareRelay for emergencies. Call 911 or your local emergency number.
- CareRelay does not provide medical advice, diagnosis, treatment, or medication dosage recommendations.
- CareRelay helps organize family updates but does not monitor health or guarantee safety.

## MVP+ Feature List

### Core
- Shared SMS number for family updates
- Automatic message categorization (medication, appointment, task, supply, concern, general update)
- Real-time dashboard with multiple views
- Zero-config demo mode

### Dashboard Views
- **Overview** — Full message feed, tasks, appointments, supplies, medications, concerns, daily summary
- **Today** — Filtered to today's messages, tasks, medications, and concerns
- **Needs Attention** — Unreviewed concerns, unassigned tasks, needed supplies, unconfirmed appointments
- **Family** — Member cards with roles, assignments, completion counts, invite status
- **Activity** — Full audit trail of messages, tasks, supplies, concerns, handoffs, exports
- **Handoff** — Generate and review daily handoff notes
- **Export** — JSON or CSV timeline export

### SMS Commands
Families can text simple commands:
- `Task: [description]` — Create a task
- `Need: [item]` — Add a supply need
- `Appointment: [details]` — Add an appointment
- `Meds: [note]` — Log medication confirmation
- `Done: [task]` — Mark a task complete
- `Bought: [item]` — Mark supply purchased
- `Delivered: [item]` — Mark supply delivered
- `Assign: [name] [task]` — Assign a task
- `Summary` — Get a quick status summary
- `Help` — List supported commands
- `Stop` — Opt out
- `Yes` — Opt back in

### Safety & Privacy
- Neutral concern flagging (never diagnoses or triages)
- Explicit emergency disclaimers on every concern
- Acknowledge workflow for concerns with optional family notes
- No medical advice in any generated text
- No sensitive medical data collection during setup

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
- In-memory demo state resets on server restart.

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
- SMS commands are handled deterministically.

## OpenAI Daily Summary Setup

- Set `OPENAI_API_KEY`.
- `POST /api/summaries/generate` uses OpenAI only when key is present.
- Without a key, deterministic fallback summaries are used.
- System instructions explicitly prohibit diagnosis, treatment advice, and emergency claims.

## Stripe Setup Notes

- Set:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
- Pricing buttons call `POST /api/stripe/checkout`.
- Without Stripe keys, demo checkout completes and routes to setup.

## Run Tests

```bash
npm run test
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | App status and service config flags |
| `/api/demo/seed` | GET | Demo snapshot with all data |
| `/api/messages/parse` | POST | Parse a message and detect category/command |
| `/api/sms/mock` | POST | Simulate inbound SMS |
| `/api/sms/inbound` | POST | Real Twilio inbound webhook |
| `/api/summaries/generate` | POST | Generate daily summary |
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/concerns/acknowledge` | POST | Acknowledge a concern |
| `/api/tasks/assign` | POST | Assign/reassign a task |
| `/api/tasks/status` | POST | Update task status |
| `/api/supplies/status` | POST | Update supply status |
| `/api/handoffs/generate` | POST | Generate daily handoff |
| `/api/handoffs/review` | POST | Mark handoff reviewed |
| `/api/export/timeline` | POST | Export timeline JSON/CSV |
| `/api/members/invite` | POST | Invite or add member |
| `/api/preferences/update` | POST | Update notification preferences |

## Known MVP+ Limitations

- Demo state is in-memory and resets on server restart.
- RLS policies are baseline and should be expanded for production membership logic.
- SMS endpoint includes hardening notes; production rate limiting should be added.
- Weekly summary is preview-level in this MVP.
- Setup flow steps 2–3 are visual placeholders for guided onboarding.

## Privacy and Medical Boundary Notes

- SMS is not ideal for highly sensitive information.
- Avoid sharing unnecessary sensitive details.
- Users can request deletion of care-circle data.
- This MVP is not a HIPAA-covered clinical system unless separately configured and contracted appropriately.
- Exports are family coordination records, not medical records.

## Production Hardening (still required)

- **In-memory demo state** does not survive server restarts and is wrong for multi-instance hosting; move to Supabase (or another DB) for real pilots.
- **Twilio**: validate webhook signatures, add rate limits, and avoid logging raw message bodies.
- **OpenAI**: redact or omit PHI from prompts; add timeouts, retries, and cost caps.
- **Stripe**: replace ad-hoc `price_data` with real Price IDs and customer portal.
- **Auth**: wire Supabase session to RLS; demo login is not a security model.
- **Rate limiting**: implement on `/api/sms/inbound` before public exposure.

## Pilot Checklist

- [ ] Founder manually onboards first 5 families
- [ ] Twilio webhook URL is kept private
- [ ] Families informed about demo data reset
- [ ] `/api/health` monitored during pilot
- [ ] Concern false positives reviewed weekly
- [ ] Pilot feedback interviews at week 1 and week 2

## Production Hardening Checklist

- [ ] Migrate in-memory store to Supabase
- [ ] Implement Twilio webhook signature validation
- [ ] Add rate limiting to SMS endpoint
- [ ] Redact PHI from OpenAI prompts
- [ ] Add OpenAI timeouts and cost caps
- [ ] Replace Stripe ad-hoc pricing with real Price IDs
- [ ] Expand RLS policies beyond owner-only
- [ ] Add real auth with Supabase
- [ ] Implement SMS delivery for invites
- [ ] Add email notification integration
