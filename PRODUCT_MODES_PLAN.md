# CareRelay Product Modes Plan

Date: 2026-05-13

## Recommendation

Use one app with `circle_type`, not separate apps, for the near term. Keep Care Mode as the only public production mode until caregiver beta is stable. Add Family Mode as a hidden beta after the schema, parser, dashboard labels, onboarding, and pricing limits support modes.

Do not launch Household, Team, or Group modes publicly yet. Treat them as future roadmap or landing-page demand tests.

## Proposed Modes

### 1. Care Mode

Audience: family caregivers.

Categories:

- Medication confirmations.
- Appointments.
- Supplies.
- Tasks.
- Concerns.
- Updates.
- Daily/weekly summaries.

Required safety:

- Full medical boundary disclaimer.
- Concern language framed as family review only.
- No monitoring, diagnosis, treatment, dosage, or emergency promise.

### 2. Family Mode

Audience: busy families and co-parenting groups.

Categories:

- Chores.
- Errands.
- Appointments.
- Groceries.
- School notes.
- Bills/reminders.
- Updates.
- Summaries.

Safety:

- General coordination disclaimer.
- If any health/care terms are used, keep medical boundary.

### 3. Household Mode

Audience: roommates, shared houses, dorm suites.

Categories:

- Rent/bills.
- Chores.
- Groceries.
- Maintenance.
- Events.
- House rules.
- Supplies.
- Summaries.

Safety:

- Consent, opt-out, admin controls, member removal.
- Avoid payment collection unless billing/dues system is built.

### 4. Team Mode

Audience: sports teams and clubs.

Categories:

- Practices.
- Games/events.
- Rides.
- Equipment.
- Announcements.
- Volunteer tasks.
- Payments/dues reminders.
- Summaries.

Safety:

- Minors’ data controls.
- Parent/guardian consent where applicable.
- No safety monitoring or emergency alert claims.

### 5. Group Mode

Audience: trips, clubs, friend groups, fraternities/sororities.

Categories:

- Events.
- Tasks.
- Supplies.
- Announcements.
- Votes/decisions.
- Reminders.
- Summaries.

Safety:

- Strong admin/member controls.
- Abuse reporting/removal.
- Avoid alcohol/party-specific positioning.

## Product Architecture

Add mode fields to `care_circles`:

```sql
circle_type text not null default 'care'
display_name text
shared_number text
category_config jsonb not null default '{}'
enabled_features jsonb not null default '{}'
```

Recommended enum values:

- `care`
- `family`
- `household`
- `team`
- `group`

The existing `name`, `shared_phone_number`, and `sms_keyword` can remain. `display_name` can support mode-specific labels without breaking current care-circle naming.

## Mode Configuration Shape

```json
{
  "category_config": {
    "primary": ["tasks", "appointments", "supplies", "updates"],
    "safetySensitive": ["medication", "concerns"],
    "labels": {
      "supplies": "Groceries and supplies"
    }
  },
  "enabled_features": {
    "dailySummary": true,
    "weeklySummary": true,
    "timelineExport": false,
    "billingReminders": false,
    "polls": false
  }
}
```

## Rollout Plan

1. Add schema fields with default `care`.
2. Backfill all existing care circles as `care`.
3. Create server utility `getCircleModeConfig(circleType)`.
4. Update setup to create only `care` circles initially.
5. Add hidden feature flag for Family Mode.
6. Update parser to select keyword sets by circle type.
7. Update dashboard labels by mode.
8. Add landing pages only after the mode foundation exists.

## What Not To Do Yet

- Do not make the homepage generic.
- Do not add all modes to onboarding.
- Do not mix caregiving medication/concern language into household/team dashboards.
- Do not create separate brands until market demand is proven.
- Do not add payment/dues collection without a full policy and payments design.

