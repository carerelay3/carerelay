# CareRelay Implementation Specification

## 1. App Architecture

**Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase (Auth, DB, RLS), Twilio, OpenAI (Optional).

| Area | Files/Folders | Purpose |
|---|---|---|
| **Root** | `/app`, `/components`, `/lib`, `/public`, `/tests` | Standard Next.js structure. |
| **Routes (Web)** | `/app/page.tsx`, `/app/(marketing)/*`, `/app/dashboard/*`, `/app/setup/*` | Next.js App Router paths for marketing, auth, and core application. |
| **Routes (API)** | `/app/api/sms/*`, `/app/api/summaries/*`, `/app/api/tasks/*` | Next.js API Routes for external webhooks and internal data fetching/mutation. |
| **Components** | `/components/*` | Reusable React components (UI, layout, specialized dashboard panels). |
| **Lib/Modules** | `/lib/parser/*`, `/lib/supabase/*`, `/lib/twilio/*`, `/lib/openai/*`, `/lib/types.ts` | Core business logic, parsers, DB clients, and third-party integrations. |
| **DB Migrations** | `/supabase/migrations/*` | SQL files defining schema, relationships, and RLS policies. |
| **Env Vars** | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `OPENAI_API_KEY` (optional), `STRIPE_SECRET_KEY` (optional). |

---

## 2. Supabase Database Schema

Create `supabase/migrations/20260505073000_init.sql` (or similar).

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- 2. care_circles
CREATE TABLE care_circles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE care_circles ENABLE ROW LEVEL SECURITY;
-- RLS: Checked via family_members link

-- 3. care_recipients
CREATE TABLE care_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE care_recipients ENABLE ROW LEVEL SECURITY;

-- 4. family_members
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(care_circle_id, profile_id)
);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can see other members" ON family_members
    FOR SELECT USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- Add policies to care_circles and care_recipients now that family_members exists
CREATE POLICY "Circle members can see circle" ON care_circles
    FOR SELECT USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = id AND fm.profile_id = auth.uid()));
CREATE POLICY "Circle members can see recipients" ON care_recipients
    FOR SELECT USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 5. inbound_messages
CREATE TABLE inbound_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id), -- Could be null if unlinked number
    raw_text TEXT NOT NULL,
    category TEXT CHECK (category IN ('medication', 'appointment', 'task', 'supply', 'general_update', 'concern')),
    concern_flag BOOLEAN DEFAULT FALSE,
    parsed_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE inbound_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can see messages" ON inbound_messages
    FOR SELECT USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 6. tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES profiles(id),
    status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    message_source_id UUID REFERENCES inbound_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can manage tasks" ON tasks
    FOR ALL USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 7. appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    appointment_time TIMESTAMPTZ,
    location TEXT,
    message_source_id UUID REFERENCES inbound_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can manage appointments" ON appointments
    FOR ALL USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 8. supplies
CREATE TABLE supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('needed', 'purchased')) DEFAULT 'needed',
    message_source_id UUID REFERENCES inbound_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can manage supplies" ON supplies
    FOR ALL USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 9. medication_logs
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    given_at TIMESTAMPTZ DEFAULT NOW(),
    given_by UUID REFERENCES profiles(id),
    message_source_id UUID REFERENCES inbound_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can view/add med logs" ON medication_logs
    FOR ALL USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 10. concerns
CREATE TABLE concerns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
    message_source_id UUID REFERENCES inbound_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can manage concerns" ON concerns
    FOR ALL USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 11. daily_summaries
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    summary_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can view summaries" ON daily_summaries
    FOR SELECT USING (EXISTS (SELECT 1 FROM family_members fm WHERE fm.care_circle_id = care_circle_id AND fm.profile_id = auth.uid()));

-- 12. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = profile_id);

-- Indexes
CREATE INDEX idx_messages_circle ON inbound_messages(care_circle_id);
CREATE INDEX idx_medlogs_circle ON medication_logs(care_circle_id);
CREATE INDEX idx_tasks_circle ON tasks(care_circle_id);
```

---

## 3. Parser Specification

File: `lib/parser/careMessageParser.ts`

```typescript
export interface ParsedMessage {
  category: "medication" | "appointment" | "task" | "supply" | "general_update" | "concern";
  confidence: number;
  extractedTitle: string;
  extractedDetails?: string;
  concernFlag: boolean;
  matchedKeywords: string[];
  suggestedRecord: object; // Contextual e.g. { itemName: "milk" } for supplies
}
```

**Rule-Based Logic:**

*   **Medication Confirmations:**
    *   Keywords: `given, took, meds, pill, dosage, injection, drops`
    *   Safety rule: Just extracts that medication was logged. Must NOT suggest dosage changes.
*   **Appointments:**
    *   Keywords: `doctor, dr, appointment, appt, hospital, clinic, checkup, PT, physical therapy`
*   **Supplies/Groceries:**
    *   Keywords: `buy, need, get, out of, low on, groceries, diapers, wipes, milk, pharmacy`
*   **Tasks:**
    *   Keywords: `can someone, please do, remember to, task, chore, clean, wash`
*   **Concerns:**
    *   Keywords: `fell, fall, pain, fever, emergency, dizzy, confused, bleeding, rash, worse`
    *   Action: Sets `concernFlag: true`.
*   **General Update:**
    *   Default if no other strong match. Keywords: `ate well, slept, good day, visitor`

**Examples (at least 25 needed in tests, here are 5 key ones):**
1. `"Mom took her morning meds at 8am."` -> category: `medication`, matchedKeywords: `['took', 'meds']`.
2. `"Dr. Smith appt tomorrow at 2pm."` -> category: `appointment`, matchedKeywords: `['Dr', 'appt']`.
3. `"We are out of milk and adult diapers."` -> category: `supply`, matchedKeywords: `['out of', 'milk', 'diapers']`.
4. `"Can someone pick up dad's dry cleaning?"` -> category: `task`, matchedKeywords: `['Can someone', 'pick up']`.
5. `"Dad fell in the bathroom but says he is fine."` -> category: `concern`, concernFlag: `true`, matchedKeywords: `['fell']`.

---

## 4. API Routes

| Route | Purpose | Body/Payload | Auth Requirement |
|---|---|---|---|
| `POST /api/sms/mock` | Demo SMS input | `{ from: string, body: string }` | None (Demo mode only) |
| `POST /api/sms/inbound` | Twilio Webhook | Twilio form-data | Twilio Signature validation |
| `POST /api/summaries/generate` | Trigger daily summary | `{ care_circle_id: string }` | Admin/Cron token or Service Role |
| `GET /api/care-circle/current` | Get active circle data | None | Supabase Session |
| `POST /api/care-circle/create` | Init new circle | `{ name: string, recipientFirstName: string }`| Supabase Session |
| `POST /api/family/invite` | Add family member | `{ phone: string, role: string }` | Supabase Session (Admin) |
| `POST /api/tasks/create` | Add task manually | `{ title: string, description?: string }` | Supabase Session |
| `PATCH /api/tasks/update` | Toggle task status | `{ taskId: string, status: string }` | Supabase Session |
| `POST /api/appointments/create` | Add appointment | `{ title: string, time: string }` | Supabase Session |
| `POST /api/supplies/create` | Add supply item | `{ itemName: string }` | Supabase Session |
| `POST /api/medication-log/create` | Log med manually | `{ medicationName: string, givenAt: string }`| Supabase Session |
| `POST /api/concerns/create` | Flag concern manually | `{ description: string }` | Supabase Session |

*   **Error Handling:** All routes return 400 for bad input, 401/403 for unauthorized access.
*   **Safety Disclaimer:** Any route returning medical-adjacent data (meds, concerns) must include a strict UI payload disclaimer or rely on UI layer for disclaimer display.

---

## 5. UI Route Specification

| Path | Purpose | Key Components |
|---|---|---|
| `/` | Landing page | Hero, Features, PhoneMockup, DisclaimerBanner |
| `/demo` | Interactive demo experience | PhoneMockup, DemoMessageTester, DashboardCard |
| `/sign-in` | Auth entry | Supabase Auth UI / Custom form |
| `/sign-up` | Auth registration | Supabase Auth UI / Custom form, Checkbox for non-medical agreement |
| `/setup` | Initial care circle setup | CareCircleSetupForm |
| `/dashboard` | Main command center | MessageFeed, TaskList, SupplyList, AppointmentList, MedicationLog, ConcernPanel, DisclaimerBanner |
| `/settings` | Profile & Care Circle config | InviteFamilyMemberForm, CareRecipientCard, SettingsPanel |
| `/pricing` | Subscription tiers | PricingCard |
| `/privacy` | Privacy Policy | Static text |
| `/terms` | Terms of Service | Static text + strong medical disclaimer indemnification |

---

## 6. Component Specification

*   **`DisclaimerBanner`**: Sticky UI banner. Props: `variant: 'global' | 'inline'`. Static text: *"CareRelay is for family coordination only. Not medical advice. Call 911 in emergencies."*
*   **`PricingCard`**: Props: `tier`, `price`, `features`, `ctaText`.
*   **`PhoneMockup`**: Visual phone frame. Props: `messages: array`, `onSend: function`. Used for Demo.
*   **`MessageFeed`**: Renders raw and categorized messages in a timeline format.
*   **`MedicationLog`**: Displays table/list of `medication_logs`. Safe UI: "Given at [Time] by [Person]".
*   **`ConcernPanel`**: Red/Amber tinted panel highlighting messages flagged as concerns.
*   **`DailySummary`**: Card displaying generated markdown summary.
*   **`EmptyState`, `LoadingState`, `ErrorState`**: Standard UX components.

---

## 7. Safe AI Summary Rules

*   **Trigger:** Daily cron or manual UI request.
*   **Fallback:** If `OPENAI_API_KEY` is missing, use deterministic logic (e.g., concatenate the titles of the day's tasks, meds, and concerns).
*   **System Prompt:**
    ```text
    You are an assistant summarizing family updates for a caregiver coordination tool.
    You MUST ONLY summarize the provided messages.
    NEVER diagnose conditions. NEVER recommend treatments. NEVER recommend medication dosages.
    If concerns are mentioned, summarize them objectively as "Family noted: [observation]".
    Do not provide medical advice.
    ```
*   **Output Schema:** JSON with `summary` (string), `highlights` (array of strings), and `disclaimer` (always included).

---

## 8. Demo Mode Requirements

*   **Goal:** App must run locally without `NEXT_PUBLIC_SUPABASE_URL` or `TWILIO_ACCOUNT_SID`.
*   **Implementation:** Check env vars at boot. If missing, activate `DEMO_MODE=true`.
*   **Mocks:** Provide a static `data.ts` with mock profiles, circles, and messages.
*   **UI Indication:** Render a `ModeBadge` in header ("DEMO MODE").
*   **Input:** The `/api/sms/mock` endpoint bypasses Twilio signature checks and writes to in-memory store or local storage (or mock DB response).

---

## 9. Twilio Integration

*   **Webhook:** POST `/api/sms/inbound`
*   **Validation:** Use `twilio.validateRequest()` if not in Demo mode.
*   **Logic:**
    1. Look up `sender_id` in `profiles` by `From` phone number.
    2. If no match, return generic TwiML: *"This number is not linked to a CareRelay care circle. Please ask your family admin to invite you."*
    3. If match, run parser on `Body`.
    4. Save to `inbound_messages`.
    5. Trigger side-effects (e.g., save to `medication_logs` if category is med).
    6. Return TwiML response.
*   **TwiML Responses:**
    *   *Normal:* "CareRelay received your update and added it to the family dashboard."
    *   *Concern:* "CareRelay added this as a concern for family attention. If this is an emergency, call 911 or your local emergency number."

---

## 10. Pricing & Stripe-Ready Plan

*   **Tiers:**
    *   **Starter:** $9/mo (1 circle, 3 members, daily summary, basic logs).
    *   **Family:** $19/mo (1 circle, 8 members, all lists, meds, daily/weekly summaries).
    *   **Family Plus:** $39/mo (multi-circle, unlimited, export, priority).
*   **Stripe Notes:** Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` when ready. In local demo mode, `/pricing` buttons trigger a mock checkout success toast.

---

## 11. Tests

*   **Framework:** Vitest.
*   **Files:**
    *   `tests/parser.test.ts`: 25+ assertions for rule-based parser outputs (meds, concerns, supplies, tasks).
    *   `tests/sms.test.ts`: Validate Twilio inbound handler, mock endpoint, and TwiML responses.
    *   `tests/summary.test.ts`: Validate fallback logic and AI prompt safety boundaries.
    *   `tests/disclaimer.test.tsx`: Validate DisclaimerBanner mounts properly.

---

## 12. Acceptance Criteria

1.  App boots and runs locally via `npm run dev` even with missing `.env` keys (Demo Mode).
2.  Users can create an account, create a care circle, and view the dashboard.
3.  The `/demo` mock SMS flow successfully parses text, categorizes it, and updates the UI instantly.
4.  Medication confirmations log safely (no dosage/advice).
5.  Tasks, appointments, and supplies populate accurately from incoming messages.
6.  Concerns trigger the `concernFlag` and display warning messages.
7.  The daily summary generates safely (deterministic fallback if no OpenAI).
8.  `DisclaimerBanner` is visible on all core views.
9.  RLS policies strictly prevent cross-circle data leakage.

---

## 13. Final Build Tickets

| Ticket ID | Title | Priority | Files | Owner | Description | Acceptance Criteria |
|---|---|---|---|---|---|---|
| BUILD-01 | DB Setup | P0 | `supabase/migrations/*`, `lib/types.ts` | Eng | Initialize 12 tables and strictly define RLS. | Migrations run. Users isolated. |
| BUILD-02 | SMS Parser | P0 | `lib/parser/careMessageParser.ts`, `tests/parser.test.ts` | Eng | Write regex/rule-based parser for 6 categories. | Passes 25 test cases. |
| BUILD-03 | Mock SMS API | P0 | `app/api/sms/mock/route.ts` | Eng | Demo endpoint simulating webhook. | Parses and stores message. |
| BUILD-04 | Demo Data Fallback | P1 | `lib/demo/data.ts`, `lib/config.ts` | Eng | Provide mock context if missing DB/Env. | App runs locally offline. |
| BUILD-05 | App Shell & UX | P1 | `app/layout.tsx`, `components/*` | FE | Base layouts, Navigation, DisclaimerBanner. | Strict UI boundaries visible. |
| BUILD-06 | Main Dashboard | P1 | `app/dashboard/page.tsx`, `components/*` | FE | Feed, MedLog, Tasks, Supplies, Concerns. | Data binds and filters correctly. |
| BUILD-07 | Interactive Demo | P1 | `app/(marketing)/demo/page.tsx`, `PhoneMockup.tsx` | FE | Homepage phone simulator UI. | Updates dashboard state instantly. |
| BUILD-08 | Twilio Webhook | P2 | `app/api/sms/inbound/route.ts`, `lib/twilio/*` | Eng | Live SMS integration with validation. | Receives/Parses/Replies via TwiML. |
| BUILD-09 | Auth & Setup UI | P2 | `app/sign-up/*`, `app/setup/*` | FE | Registration, Care Circle setup with DB link. | Users can self-onboard. |
| BUILD-10 | Daily Summaries | P3 | `app/api/summaries/*`, `lib/openai/*` | Eng | Trigger safe AI summary or deterministic fallback. | Summary card populates without medical advice. |
