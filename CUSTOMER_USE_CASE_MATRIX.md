# CareRelay Customer Use Case Matrix

Date: 2026-05-13

| Customer type | Must-have features | Nice-to-have features | What they would text | Dashboard should show | Summary should include | Might pay | Churn triggers | Onboarding should ask |
|---|---|---|---|---|---|---|---|---|
| Adult child caring for parent | Shared SMS line, family member routing, medication confirmations, appointments, supplies, concerns, tasks | Weekly export, handoff notes, printable timeline | “Meds done,” “Need wipes,” “PT Tuesday 2pm,” “Mom seemed confused” | Today overview, open tasks, med log, concerns, appointments | Tasks open, meds confirmed, supplies needed, concerns | $10-$20/mo | Missed SMS, confusing medical boundary, fake numbers | Parent first name, helpers, phone numbers, keyword, Twilio status |
| Spouse caregiver | Fast logging, private circle, appointments, medication confirmations, daily recap | Emergency contacts card, respite handoff | “Gave morning meds,” “Cardiology Friday,” “Need refill” | Simple day view, meds, appointments, supplies | What happened today, open items | $5-$15/mo | Too many features, setup burden | Who is cared for, who helps, preferred summary time |
| Sibling group | Role permissions, owner/admin, task assignment, concerns, summaries | Contribution tracking, export | “I’ll take Dad,” “Can someone call pharmacy?” | Responsibility split, unresolved tasks, concerns | Who did what, what still needs owner | $10-$20/mo | Conflict, unclear ownership, no audit trail | Siblings, roles, shared phone, keyword |
| Co-parenting family | Chores, school reminders, appointments, handoffs, calendar | Neutral records, custody schedule | “School form due,” “Pickup at 4,” “Need cleats” | School notes, tasks, schedule, supplies | Upcoming obligations and open tasks | $5-$15/mo | Feels caregiver/medical, conflict over edits | Children names, adults, schedule style, categories |
| Busy family household | Chores, groceries, appointments, errands, reminders | Recurring tasks, family announcements | “Need milk,” “Trash done,” “Dentist Thursday” | Chores, groceries, appointments | Today/tomorrow tasks and grocery needs | $5-$10/mo | Another app to manage, weak reminders | Family name, members, category preferences |
| Roommates | Chores, groceries, bills, maintenance, house announcements | Chore rotation, quiet hours | “Bought paper towels,” “Rent due,” “Sink leaking” | Chores, bills, maintenance, supplies | What is due, what was bought, unresolved maintenance | $3-$10/mo | Payment disputes, low urgency | Address nickname, roommates, bill categories |
| Dorm suite | Chores, supplies, rules, events | Quiet hours, shared shopping | “Need trash bags,” “Clean bathroom,” “Floor meeting” | Chores, supplies, events | Chores due and supplies low | Low | Minors/privacy, too much admin | Members, dorm rules, opt-in consent |
| Fraternity/sorority house | Chores, events, dues reminders, announcements, supplies | Polls, maintenance log | “Chapter at 7,” “Need cups,” “Dues Friday” | Events, tasks, supplies, dues reminders | Events and obligations | Moderate if paid by house | Misuse, noisy messages, moderation gaps | House admins, member rules, opt-out |
| Sports team coach | Announcements, practices/games, equipment, volunteer tasks | Weather alerts, roster groups | “Practice moved,” “Need snacks,” “Who can drive?” | Schedule, rides, volunteers, equipment | Next game/practice, volunteer gaps | $10-$30/season | Minors privacy, message deliverability | Team name, age group, parent contacts, consent |
| Sports team parent | Schedule, ride coordination, equipment, announcements | Snack signup, weather changes | “Can drive 2 kids,” “Need jersey,” “Game canceled?” | Parent tasks, ride list, schedule | What changed, what to bring | Indirect via coach | Too many texts, unclear source | Child/team, notification preferences |
| Club organizer | Events, tasks, announcements, reminders | Polls, dues reminders | “Meeting Tuesday,” “Bring projector,” “Vote by Friday” | Events, tasks, decisions | Upcoming events and open decisions | $5-$20/mo | Generic tools already enough | Club type, admins, member list |
| Group trip organizer | Itinerary, tasks, supplies, decisions, reminders | Expense tracking, polls | “I booked van,” “Need sunscreen,” “Dinner vote” | Itinerary, tasks, supplies, decisions | Next actions, supplies, decisions | One-time $5-$20 | Trip ends, low repeat use | Trip dates, members, categories |

## Pattern Insights

- SMS is strongest when participants are mixed-age, busy, or unwilling to install an app.
- Caregiving has the strongest emotional urgency and best fit.
- Family Mode is the cleanest expansion because it reuses most infrastructure with lower medical risk.
- Team and youth sports require consent and minors-specific policy work before serious launch.
- Group trips and friend groups are high-churn and should not drive architecture decisions.

