# Circle Types Implementation Plan

## Database Changes

- `care_circles` remains the canonical circle table.
- `care_recipients` remains in place for Care Mode compatibility.
- Migration `supabase/migrations/20260513000000_add_circle_types.sql` adds:
  - `circle_type text not null default 'care'`
  - `category_config jsonb`
  - `enabled_features jsonb`
  - a check constraint for `care`, `family`, `household`, `team`, and `group`
  - an index on `circle_type`
- Existing circles default to Care Mode.
- `supabase/carerelay_master_schema.sql` mirrors the new columns for full schema rebuilds.

## Circle Type Definitions

- Mode definitions live in `lib/circles/circleTypes.ts`.
- Supported values are `care`, `family`, `household`, `team`, and `group`.
- Helpers include labels, descriptions, category presets, normalization, and mode checks.
- `lib/circleTypes.ts` remains a compatibility wrapper for older imports.

## Setup Behavior

- Setup defaults to Care Mode.
- Users can choose Care, Family, Household, Team, or Group Mode.
- `/api/setup` validates `circleType` with Zod and rejects unsupported values with `validation_failed`.
- `/api/setup` stores `circle_type` and the selected category preset on `care_circles`.
- Free users remain limited to one circle and up to two members through plan limits.
- Error copy is mode-neutral where possible while preserving existing table names internally.

## Dashboard Behavior

- This phase keeps the current dashboard layout.
- The dashboard header renders the selected mode label.
- Care Mode keeps medication confirmations, concerns, appointments, supplies, tasks, daily summaries, and the medical boundary disclaimer.
- Family, Household, Team, and Group Mode use light mode-aware labels and avoid medication, emergency, or medical claims in dashboard copy.
- Non-care modes do not render the Care Mode disclaimer.

## What Was Intentionally Not Implemented

- No table rename from `care_circles` to `circles`.
- No rename of `care_recipients`, `family_members`, Supabase policies, Stripe routes, Twilio routes, or API route names.
- No separate pricing for teams, groups, frats, or households.
- No fully separate dashboard per mode.
- No mode-specific SMS parser yet.
- No dedicated phone-number provisioning flow.
- No medical claims, monitoring claims, diagnosis, treatment guidance, or emergency response claims.
