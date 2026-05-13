# CircleRelay Mode Strategy

## Why Five Modes

CircleRelay uses one core product pattern: one shared line, one organized dashboard, and one circle of people coordinating around real-life responsibilities. Care, Family, Household, Team, and Group Modes let the product expand beyond caregiving without weakening Care Mode or making medical claims.

## Buyers And Users

- Care Mode: adult children, spouses, siblings, and family caregivers coordinating support for a loved one.
- Family Mode: parents, co-parents, guardians, and extended family members coordinating daily household life.
- Household Mode: roommates, dorm residents, shared houses, and renters coordinating chores, supplies, bills, and maintenance.
- Team Mode: coaches, team parents, captains, club leaders, and activity organizers coordinating practices, games, rides, equipment, and volunteers.
- Group Mode: trip planners, friend groups, fraternities, sororities, clubs, event groups, and informal organizers coordinating events, tasks, supplies, decisions, and responsibilities.

## Must-Have Dashboard Categories

- Care Mode: medication confirmations, appointments, supplies, tasks, concerns, updates, daily summaries, and the medical boundary disclaimer.
- Family Mode: chores, errands, groceries, appointments, school notes, reminders, updates, and summaries.
- Household Mode: chores, groceries, supplies, bills, maintenance, house updates, reminders, and summaries.
- Team Mode: practices, games/events, rides, equipment, announcements, volunteer tasks, reminders, and summaries.
- Group Mode: events, tasks, supplies, announcements, votes/decisions, reminders, responsibilities, and summaries.

## Plan Implications

- Free: 1 circle, up to 2 members.
- Starter: 1 circle, up to 3 members.
- Family: 1 circle, up to 8 members.
- Family Plus: multiple circles, larger teams/groups/households, exports, and a future dedicated number option.
- Do not split Team, Group, Household, or fraternity/sorority pricing until usage patterns justify it.

## Risks By Mode

- Care Mode: highest compliance and trust risk; keep disclaimers, avoid diagnosis or treatment guidance, and preserve caregiver workflows.
- Family Mode: risk of becoming too broad; keep categories practical and daily-life focused.
- Household Mode: risk of rent, bill, or roommate conflict features growing beyond coordination; keep this phase lightweight.
- Team Mode: risk of needing calendar, roster, waiver, and league-specific tooling; defer those until demand is proven.
- Group Mode: risk of becoming a generic chat replacement; keep the shared-line plus responsibilities angle clear.

## Build Now

- Store `circle_type` on `care_circles`.
- Keep Care Mode as the default.
- Add typed mode helpers and category presets.
- Let setup save validated mode choices.
- Update homepage, pricing copy, and light dashboard labels for all five modes.
- Keep demo mode and existing caregiving records working.

## Leave For Later

- Fully mode-specific dashboards.
- Mode-specific parser behavior and record tables.
- Calendar integrations.
- Votes/decisions workflows.
- Dedicated phone number provisioning.
- Separate pricing lines for teams, frats, clubs, or households.
