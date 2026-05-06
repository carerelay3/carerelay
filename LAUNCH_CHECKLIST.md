# CareRelay Launch Checklist

## Pre-Launch Verification

### Environment & Configuration
- [ ] `.env.example` file is complete with all required variables
- [ ] README clearly explains demo mode and environment variable requirements
- [ ] All API routes validate required environment variables gracefully
- [ ] No client-side exposure of secrets (service keys, OpenAI key, Twilio auth token, Stripe secret key)

### Core Functionality
- [ ] SMS inbound webhook handles:
  - Valid messages from known numbers
  - Unknown senders (stored as "Unknown sender")
  - Unknown To numbers (returns safe error)
  - Empty bodies (returns 400 error)
  - All SMS command formats (Task:, Need:, Appointment:, Meds:, Done:, Bought:, Delivered:, Assign:, Summary, Help, Stop, Yes)
  - Concern flagging with appropriate disclaimers
  - TwiML and JSON response formats

- [ ] Message parser correctly categorizes:
  - Medication confirmations
  - Appointments
  - Tasks
  - Supplies
  - Concerns (with medical safety boundaries)
  - General updates
  - SMS commands take precedence when appropriate

- [ ] Summary generation:
  - Works with demo data
  - Works with no data
  - Works without OpenAI key (falls back to deterministic summary)
  - Never provides medical advice, diagnosis, or treatment suggestions
  - Includes appropriate emergency disclaimers when concerns are present

- [ ] Handoff generation:
  - Creates readable handoff text from summary data
  - Includes appropriate disclaimers
  - Can be marked as reviewed

- [ ] Export functionality:
  - Exports JSON and CSV formats correctly
  - Includes disclaimer that export is not a medical record
  - Properly escapes CSV data

### Safety & Privacy Boundaries
- [ ] All concern responses include: "CareRelay does not provide medical advice. For emergencies, call 911 or your local emergency number."
- [ ] No medical advice, diagnosis, treatment, or dosage recommendations appear in:
  - Parser output
  - Summary generation
  - Handoff generation
  - SMS responses
  - UI components
- [ ] Privacy page clearly states:
  - What data is stored
  - Who can access it
  - SMS limitations for sensitive information
  - Emergency disclaimer
  - Data deletion process
  - HIPAA limitations
- [ ] Terms page clearly states:
  - Coordination-only use
  - No medical advice
  - No emergency use
  - User responsibility for message accuracy
  - Service availability disclaimer
  - Data deletion process

### Demo Mode
- [ ] App works immediately with zero external credentials
- [ ] Demo seed data loads correctly
- [ ] All UI components display demo data appropriately
- [ ] Demo mode is clearly indicated where appropriate
- [ ] API routes return safe fallback behavior when services missing
- [ ] Reset demo functionality works

### UI/UX
- [ ] All pages load without errors:
  - Landing page (/)
  - Demo page (/demo)
  - Sign-in page (/sign-in)
  - Sign-up page (/sign-up)
  - Setup flow (/setup)
  - Dashboard (/dashboard)
  - Settings (/settings)
  - Privacy (/privacy)
  - Terms (/terms)
- [ ] Mobile layouts are usable
- [ ] Loading states work appropriately
- [ ] Error states are user-friendly
- [ ] Empty states provide helpful guidance
- [ ] Form validation works correctly
- [ ] Button states (loading, disabled, active) work correctly
- [ ] Focus indicators are visible

### Dependencies & Build
- [ ] `npm install` completes successfully
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm test` passes with all tests (currently 66 tests)
- [ ] `npm run build` completes successfully
- [ ] Production build exports correctly

### Deployment Readiness
- [ ] No local-only assumptions in code
- [ ] API routes compatible with serverless runtime (Vercel)
- [ ] Environment variable names match deployment platform expectations
- [ ] Next.js configuration is valid
- [ ] Tailwind configuration is valid
- [ ] TypeScript configuration is valid

## Pilot Checklist (First 5 Families)

### Founder Preparation
- [ ] Founder manually onboards first 5 families
- [ ] Twilio webhook URL is kept private and secure
- [ ] Families informed about demo data reset limitation
- [ ] Founder has tested the complete flow as a family member would experience it

### Family Onboarding
- [ ] Each family receives clear instructions about:
  - The shared CareRelay number
  - How to use SMS commands (or just text normally)
  - That no app installation is required
  - The purpose is coordination only, not medical advice or emergency monitoring
- [ ] Each family has at least one designated coordinator who can access the dashboard
- [ ] Families know how to opt-out (STOP) and opt-back-in (YES)

### Monitoring & Feedback
- [ ] Founder monitors `/api/health` during pilot period
- [ ] Concern flagging is reviewed weekly for false positives
- [ ] Pilot feedback interviews conducted at week 1 and week 2
- [ ] Any confusing or problematic flows are documented for improvement

### Success Metrics
- [ ] Families report reduced communication burden
- [ ] Critical updates are not missed
- [ ] Task completion tracking improves follow-through
- [ ] Families feel more organized and less stressed about communication
- [ ] No safety incidents related to misinterpretation of CareRelay output

## Production Hardening (Post-Pilot)

### Infrastructure
- [ ] Migrate in-memory store to Supabase for persistence
- [ ] Implement proper authentication with Supabase
- [ ] Expand RLS policies beyond basic owner-only access
- [ ] Set up proper backup and recovery procedures

### Security
- [ ] Implement Twilio webhook signature validation
- [ ] Add rate limiting to SMS endpoint to prevent abuse
- [ ] Redact or omit PHI from OpenAI prompts if used
- [ ] Add OpenAI request timeouts and cost caps
- [ ] Replace Stripe ad-hoc pricing with real Price IDs and customer portal
- [ ] Implement proper error logging without exposing sensitive data
- [ ] Add input validation and sanitization for all API endpoints

### Reliability
- [ ] Implement proper error boundaries and fallback UIs
- [ ] Add monitoring for API error rates and latency
- [ ] Set up deployment rollback procedures
- [ ] Implement proper logging for audit trails (without PHI)