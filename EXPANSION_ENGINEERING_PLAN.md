# CareRelay Expansion Engineering Plan

Date: 2026-05-13

## Segment 1: Fix Mobile/Auth/Dashboard Remaining Issues

- Migrations: optional `sms_events`, `admin_audit_events`, `data_deletion_requests`.
- Files likely changed: `app/setup/page.tsx`, `components/CareCircleSetupForm.tsx`, `app/dashboard/page.tsx`, `components/DashboardClient.tsx`, `app/settings/page.tsx`, `app/admin/page.tsx`, `app/api/sms/inbound/route.ts`, `app/api/stripe/checkout/route.ts`.
- APIs affected: setup, sms inbound, checkout, billing portal, health.
- Tests needed: no demo number in live setup, Twilio missing state, Stripe missing state, support email state, admin audit insert.
- Rollout risk: low to medium.
- Feature flags: `NEXT_PUBLIC_BETA_READY`, `NEXT_PUBLIC_ENABLE_CHECKOUT`.

## Segment 2: Add Circle Type Foundation

- Migration:

```sql
alter table public.care_circles add column if not exists circle_type text not null default 'care';
alter table public.care_circles add column if not exists display_name text;
alter table public.care_circles add column if not exists category_config jsonb not null default '{}';
alter table public.care_circles add column if not exists enabled_features jsonb not null default '{}';
create index if not exists idx_care_circles_circle_type on public.care_circles(circle_type);
```

- Files likely changed: `lib/types.ts`, `lib/supabase/dashboardRecords.ts`, setup route, setup form, dashboard components.
- APIs affected: setup, dashboard data, team/account/settings selectors.
- Tests needed: existing care circles default to care, dashboard unchanged for care mode.
- Rollout risk: medium.
- Feature flags: `ENABLE_CIRCLE_TYPES=false` initially.

## Segment 3: Add Family/Household/Team Category Presets

- Migrations: optional `circle_category_presets` table or static config.
- Files likely changed: new `lib/modes/config.ts`, parser config, dashboard labels.
- APIs affected: setup, parser, summary generation.
- Tests needed: each mode maps categories correctly; care mode unchanged.
- Rollout risk: medium.
- Feature flags: `ENABLE_FAMILY_MODE_BETA`.

## Segment 4: Add Landing Pages For New Markets

- Migrations: none.
- Files likely changed: `app/(marketing)/caregivers/page.tsx`, `families`, `households`, `teams`, `groups`.
- APIs affected: optional waitlist route.
- Tests needed: pages render, disclaimers present, no unavailable feature claims.
- Rollout risk: low.
- Feature flags: hide from nav until ready.

## Segment 5: Add Template-Based SMS Parser By Circle Type

- Migrations: store parser version on inbound messages: `parser_version text`, `circle_type text`.
- Files likely changed: `lib/parser/*`, `app/api/sms/inbound/route.ts`, `app/api/messages/parse/route.ts`.
- APIs affected: SMS inbound, mock SMS, parse.
- Tests needed: care medication still works; family chores; household maintenance; team practice; group event.
- Rollout risk: medium to high.
- Feature flags: parser mode fallback to care.

## Segment 6: Add Dashboards That Adapt By Circle Type

- Migrations: none if using existing generic tables plus labels; new tables only if needed.
- Files likely changed: dashboard components, mode config, summary panels, empty states.
- APIs affected: dashboard snapshot.
- Tests needed: mode-specific labels; care disclaimers preserved; no medication panel in non-care modes unless enabled.
- Rollout risk: high if done broadly; ship one mode at a time.
- Feature flags: per-circle enabled features.

## Segment 7: Monetization/Plan Limits By Circle Type

- Migrations: add plan entitlements by mode or extend `subscription_tiers`.
- Files likely changed: `lib/stripe/getPlanLimits.ts`, pricing pages, checkout metadata, settings billing.
- APIs affected: setup, team add, export, weekly summaries.
- Tests needed: family plan limits, team plan limits, care plan unchanged.
- Rollout risk: medium.
- Feature flags: `ENABLE_MODE_PRICING`.

## Segment 8: Growth/Admin Analytics

- Migrations: analytics/events table or integration.
- Files likely changed: `lib/analytics/track.ts`, admin page, route handlers.
- APIs affected: all high-value events.
- Tests needed: event creation does not block core flows; PII minimization.
- Rollout risk: medium.
- Feature flags: `NEXT_PUBLIC_ANALYTICS_ENABLED`.

## Engineering Principles

- Keep `care` as default forever.
- Avoid changing existing care category names until mode labels are isolated.
- Add mode support server-first, then UI.
- Avoid broad public nav until onboarding can create that mode.
- Store parser version and mode on inbound messages for auditability.
- Do not use feature flags as security boundaries; server authorization remains mandatory.

