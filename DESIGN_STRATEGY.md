# CareRelay: Execution Blueprint & Design Strategy

## 1. Product Scope Correction

**Core Mission:** An SMS-based caregiver command center for families caring for a loved one.

CareRelay is a family caregiver coordination tool designed to help families stay organized when caring for an aging parent, sick relative, disabled loved one, or someone recovering from surgery. Families text a shared number with daily updates, and the platform organizes these messages into a cohesive dashboard.

**Strict Boundaries (What CareRelay is NOT):**
*   **NOT** a medical OCR product or clinical data extraction tool.
*   **NOT** diagnostic software or an AI treatment recommendation engine.
*   **NOT** a hospital workflow tool, triage system, or provider-facing platform.
*   **NOT** a replacement for doctors, nurses, emergency services, or professional caregivers.
*   **NOT** a provider of medical advice or medication dosage recommendations.

**Core Scope (What CareRelay IS):**
*   Care coordination and shared care notes.
*   Family updates via SMS.
*   Medication confirmation logs (who gave what and when).
*   Appointment reminders and tracking.
*   Grocery, supply, and task tracking.
*   Concern flagging for the family's attention.
*   Daily and weekly family summaries.
*   Human-reviewed information organization.

---

## 2. Corrected Business Model

CareRelay is a B2C SaaS product targeting families who need a centralized way to manage the logistics of caregiving without the friction of app downloads for every participant (especially older family members).

*   **Target Customer:** Adult children, spouses, siblings, and family members actively coordinating care for a loved one.
*   **Buyer Pain:** Scattered texts, missed updates, unclear responsibilities, forgotten appointments, and general family confusion leading to duplicated effort or missed care.
*   **Core Promise:** One shared number to keep the whole family on the same page.
*   **Revenue Model:** Monthly family subscription.
*   **Primary Conversion:** Start free demo -> Create care circle -> Invite family members.
*   **Main Trust Requirement:** Clear privacy boundaries, data safety, and absolute clarity that the tool provides NO medical advice.

| Business Area | Correct Direction |
| :--- | :--- |
| **Target Audience** | Families, adult children, spouses coordinating care |
| **Core Value** | Organization, communication, peace of mind |
| **Pricing Tiers** | Starter ($9/mo), Family ($19/mo), Family Plus ($39/mo) |
| **Acquisition** | Organic search, caregiver support groups, word-of-mouth |
| **Onboarding** | Low-friction SMS demo, simple web dashboard setup |
| **Retention** | Daily habit formation via SMS summaries and centralized task management |

---

## 3. Corrected Feature Roadmap

Focus exclusively on features that help families coordinate logistics and share updates.

| Feature | Keep / Remove / Later | Why | MVP Version |
| :--- | :--- | :--- | :--- |
| Shared SMS Number | Keep | Core mechanic for frictionless updates | One shared Twilio number for MVP |
| Inbound Message Logging | Keep | The foundation of the shared timeline | Chronological feed with sender ID |
| Message Categorization | Keep | Makes the feed readable and actionable | Basic rule-based tagging (Meds, Supplies, etc.) |
| Medication Confirmation Log | Keep | Critical family coordination need | Simple "Given at [time] by [person]" log |
| Appointment Tracking | Keep | Prevents missed visits | List view of upcoming dates/times |
| Grocery/Supply List | Keep | Everyday logistics | Checkbox list aggregated from SMS |
| Task List | Keep | Distributing the load | Assignable to-do items |
| Concern Flags | Keep | Highlighting issues for family review | Pinned messages requiring attention |
| Daily/Weekly Summaries | Keep | Keeps peripheral family members informed | Automated digest of the day's SMS log |
| Demo Mode | Keep | Crucial for conversion | Interactive web-based phone mockup |
| Clinical OCR | **Remove** | Violates core product boundaries | None |
| Medical Record Parsing | **Remove** | Out of scope, high risk | None |
| Diagnostic AI | **Remove** | High liability, not a medical product | None |
| Hospital Integrations | **Remove** | B2B focus, distraction from family use case | None |

---

## 4. Corrected 7-Day Sprint

**Goal:** Deliver a fully functional MVP dashboard that receives mock SMS messages, categorizes them, and displays them in a clear, organized family command center.

### Day 1: Stabilize Data Model and Core Care Circle Flow
*   **Objective:** Set up the database foundation for users, care circles, and basic message storage.
*   **Tasks:** Define Supabase schema (Users, Care Circles, Members, Messages, Tasks). Set up Row Level Security. Build basic Care Circle creation UI.
*   **Owner:** Engineering.
*   **KPI Affected:** Backend Readiness.
*   **Acceptance Criteria:** A user can sign up, create a Care Circle, and view an empty dashboard. Schema is deployed.

### Day 2: Build/Polish SMS Message Parser
*   **Objective:** Create the logic that categorizes incoming plain text into actionable items.
*   **Tasks:** Write rule-based or basic LLM-assisted parser to detect intent (meds, appointments, supplies, general updates).
*   **Owner:** Engineering.
*   **KPI Affected:** Data Quality.
*   **Acceptance Criteria:** Parser takes a raw string and returns structured JSON (category, confidence, extracted entities).

### Day 3: Build Twilio + Mock SMS Inbound Flow
*   **Objective:** Connect the app to the outside world.
*   **Tasks:** Set up Twilio webhook endpoint. Create a mock endpoint for the demo mode. Route messages through the parser and into the database.
*   **Owner:** Engineering.
*   **KPI Affected:** Core Functionality.
*   **Acceptance Criteria:** Sending an SMS (or hitting the mock endpoint) results in a categorized message appearing in the database.

### Day 4: Build Dashboard Panels
*   **Objective:** Visualize the parsed data for the family.
*   **Tasks:** Build UI components: Message Feed, Medication Log, Appointment List, Task List, Supply List, Concern Panel.
*   **Owner:** Front-End / Design.
*   **KPI Affected:** User Experience.
*   **Acceptance Criteria:** All panels populate dynamically based on the messages in the database.

### Day 5: Build Daily Summary System
*   **Objective:** Implement the automated digest feature.
*   **Tasks:** Create a cron job or scheduled function to aggregate daily messages and generate a concise summary. Build UI to display it.
*   **Owner:** Engineering.
*   **KPI Affected:** Retention / Engagement.
*   **Acceptance Criteria:** A readable summary is generated based on a 24-hour message window and displayed on the dashboard.

### Day 6: Improve Mobile UX + Trust/Disclaimer Language
*   **Objective:** Ensure the dashboard is usable on phones and legally safe.
*   **Tasks:** Polish responsive design. Implement strict disclaimer banners across all relevant UI components and legal pages.
*   **Owner:** Front-End / Product.
*   **KPI Affected:** Usability, Risk Mitigation.
*   **Acceptance Criteria:** Dashboard looks great on mobile. Disclaimers are prominent and cannot be missed.

### Day 7: QA, Demo Mode, and Launch Polish
*   **Objective:** Final end-to-end testing and marketing prep.
*   **Tasks:** Build interactive homepage demo mockup. Test all flows. Fix critical bugs.
*   **Owner:** Whole Team.
*   **KPI Affected:** Launch Readiness.
*   **Acceptance Criteria:** Zero critical bugs. Demo mode successfully simulates the core value proposition.

---

## 5. Corrected Developer Tickets

| Ticket | Priority | Owner | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| DB-01 | P0 | Eng | Define Supabase Schema & RLS | Tables exist for Care Circles, Members, Messages. RLS restricts access to circle members. |
| AUTH-01 | P0 | Eng | Care Circle Creation Flow | User can sign up and initialize a new Care Circle entity. |
| API-01 | P0 | Eng | Inbound SMS Webhook (Twilio) | Endpoint receives Twilio POST, authenticates, and saves raw text. |
| API-02 | P0 | Eng | Mock SMS Endpoint (Demo) | Endpoint simulates Twilio webhook for unauthenticated demo mode usage. |
| CORE-01 | P0 | Eng | Rule-based Message Parser | Function takes raw text and categorizes it (e.g., Meds, Groceries, Note). |
| UI-01 | P0 | FE | Main Dashboard Layout | Responsive grid layout for panels (Feed on left, widgets on right). |
| UI-02 | P1 | FE | Message Feed Component | Chronological list of categorized messages with sender names. |
| UI-03 | P1 | FE | Medication Confirmation Panel | Extracts and lists "given" medications from messages. |
| UI-04 | P1 | FE | Tasks & Supply List Panels | Extracts action items and checklist items from messages. |
| CORE-02 | P1 | Eng | Daily Summary Generator | Scheduled task to summarize last 24h of messages. |
| UI-05 | P1 | FE | Prominent Disclaimer Banner | Sticky or highly visible UI warning that this is not medical advice. |
| MKT-01 | P1 | FE | Interactive Demo Phone UI | Homepage component simulating SMS input and dashboard reaction. |

---

## 6. Corrected Homepage Strategy

The homepage must immediately communicate that this is a family coordination tool, not a clinical app.

**Hero Section:**
*   **Headline:** "One shared number to keep the whole family on the same page."
*   **Subheadline:** "CareRelay turns family text updates into a simple shared dashboard for notes, tasks, appointments, medication confirmations, groceries, supplies, and daily summaries."
*   **Primary CTA:** "Try the Demo"
*   **Secondary CTA:** "Create a Care Circle"

**Content Sections:**
1.  **The Problem:** "Stop losing care updates in scattered family group texts." (Visual: chaotic text thread vs. organized CareRelay dashboard).
2.  **How It Works:** "Text one number. We organize the rest."
3.  **What Families Can Track:** Grid highlighting: Daily summaries, Medication confirmation logs, Appointment tracking, Grocery and supply lists, Concern flags.
4.  **Privacy and Safety:** Clear boundaries emphasizing family control and non-medical nature.
5.  **Pricing:** Simple, transparent monthly tiers.
6.  **FAQ:** Addressing common family concerns.
7.  **Final CTA:** "Start coordinating care today."

---

## 7. Corrected Trust and Disclaimer Language

It is paramount to mitigate liability and set correct user expectations. These disclaimers must be omnipresent.

**Core Disclaimer Copy:**
*   "CareRelay is a communication tool for family coordination only."
*   "CareRelay is not a medical provider and does not provide medical advice, diagnosis, treatment, or medication dosage recommendations."
*   "Do not use CareRelay for emergencies. Call 911 or your local emergency number immediately if you have a medical emergency."
*   "Medication logs are provided solely for family confirmation and organizational purposes. Always follow the explicit instructions and dosages provided by licensed medical professionals."

**Placement Requirements:**
*   **Global Footer:** Standard legal disclaimer.
*   **Signup Flow:** Checkbox requirement acknowledging non-medical use.
*   **Dashboard Header:** Small, persistent badge or banner.
*   **Medication/Concern Panels:** Contextual tooltips or subtext reinforcing that data is user-reported, not clinical truth.
*   **Terms & Privacy Pages:** Comprehensive legal indemnification sections.

---

## 8. Corrected Marketing Positioning

*   **One-Line Statement:** The SMS command center for families caring for a loved one.
*   **Primary Audience:** Adult children, spouses, and family members coordinating eldercare, post-op recovery, or chronic illness management at home.
*   **Main Pain Points:** Miscommunication, duplicated effort (e.g., giving meds twice), forgotten tasks, and the stress of managing logistics across multiple households.
*   **Emotional Hook:** Gain peace of mind knowing exactly what’s happening with your loved one, without the anxiety of a chaotic group chat.
*   **Practical Hook:** You already know how to text. No new apps for grandma to learn.
*   **Differentiation:** Frictionless input (SMS) combined with structured output (Dashboard).
*   **Competitor Alternatives:** WhatsApp groups, messy iMessage threads, shared Apple Notes, complex specialized caregiving apps that require everyone to download and log in.
*   **Why SMS Matters:** 100% adoption rate. Zero learning curve for older or less tech-savvy family members.
*   **Why Pay Monthly:** Eliminates the stress of miscommunication, which is easily worth the price of a streaming service.

---

## 9. Corrected Build Order

Strict adherence to this sequence ensures the core value is realized before extraneous features are added.

1.  **Database & Schema Setup (Priority: Critical)**
    *   *What:* Supabase tables and RLS for core entities.
    *   *Why:* The foundation of all state.
    *   *Files:* `supabase/migrations/*`, `lib/types.ts`
    *   *Acceptance Criteria:* Database migrations run cleanly; basic row-level security is active.

2.  **Mock Inbound Endpoint & Parser (Priority: Critical)**
    *   *What:* The API that receives text and categorizes it.
    *   *Why:* Proves the core mechanic works before wiring up Twilio.
    *   *Files:* `app/api/sms/mock/route.ts`, `lib/parser/careMessageParser.ts`
    *   *Acceptance Criteria:* Sending a POST with a message string successfully parses and saves a categorized record.

3.  **Core Dashboard Layout & Feed (Priority: High)**
    *   *What:* The main UI wrapper and the chronological message list.
    *   *Why:* Gives users immediate visual feedback of their data.
    *   *Files:* `app/dashboard/page.tsx`, `components/DashboardClient.tsx`, `components/MessageFeed.tsx`
    *   *Acceptance Criteria:* Messages from the database are displayed chronologically with correct categorization styling.

4.  **Specialized Panels (Meds, Tasks, Supplies) (Priority: High)**
    *   *What:* The widgets that filter and display specific message types.
    *   *Why:* Transforms a feed into an actionable command center.
    *   *Files:* `components/MedicationLog.tsx`, `components/TaskList.tsx`, `components/SupplyList.tsx`
    *   *Acceptance Criteria:* Panels accurately reflect the filtered state of the message feed.

5.  **Global Disclaimers & Trust UI (Priority: High)**
    *   *What:* Banners and text warning about non-medical use.
    *   *Why:* Absolute requirement for launch safety.
    *   *Files:* `components/DisclaimerBanner.tsx`, `app/layout.tsx`
    *   *Acceptance Criteria:* Disclaimers are visible on every secure page.

6.  **Interactive Demo Mode (Priority: Medium)**
    *   *What:* Homepage phone simulator.
    *   *Why:* Primary conversion driver; shows instead of tells.
    *   *Files:* `app/(marketing)/demo/page.tsx`, `components/PhoneMockup.tsx`
    *   *Acceptance Criteria:* User can type a text into the mockup and see the dashboard update in real-time.

7.  **Twilio Integration (Priority: Medium)**
    *   *What:* Real SMS webhook setup.
    *   *Why:* Required for real-world usage beyond the demo.
    *   *Files:* `app/api/sms/inbound/route.ts`, `lib/twilio/client.ts`
    *   *Acceptance Criteria:* Real SMS messages hit the endpoint, are verified, parsed, and stored.

8.  **Daily Summaries (Priority: Low - Post-MVP)**
    *   *What:* Automated digest generation.
    *   *Why:* Good for retention, but not critical for first test.
    *   *Files:* `app/api/summaries/generate/route.ts`, `lib/summaries/generateDailySummary.ts`
    *   *Acceptance Criteria:* System aggregates 24h of messages into a short readable text.