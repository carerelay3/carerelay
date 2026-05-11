# CareRelay Product Limits

CareRelay is family coordination software. It does not provide medical advice, diagnosis, triage, monitoring, medication dosage guidance, or emergency response.

## Plans

| Plan | Care circles | Family members | Daily summaries | Weekly summaries | Timeline export | Multiple care circles |
| --- | ---: | ---: | --- | --- | --- | --- |
| Free | 1 | 2 | Included | Not included | Not included | No |
| Starter | 1 | 3 | Included | Not included | Not included | No |
| Family | 1 | 8 | Included | Included | Not included | No |
| Family Plus | 5 | 50 | Included | Included | Included | Yes |

## Current Feature Status

- Basic onboarding does not require payment.
- A logged-in unpaid user is treated as `free`, not demo.
- Demo mode remains public at `/demo` and is separate from live account data.
- Timeline export is gated to Family Plus.
- Weekly summaries are gated to Family and Family Plus.
- Dedicated family phone numbers are planned for Family Plus but are not provisioned yet.
- Push notifications are planned but are not enabled yet.

## Safety Limits

- CareRelay exports and summaries are family coordination records, not medical records.
- Summaries must stay factual and based on family-reported updates.
- CareRelay should never claim to detect emergencies or replace calling emergency services.
- Live features must not expose data across care circles.

## Launch Audit Notes

- Plan limits are enforced server-side for setup care circle creation and team member additions.
- `getCurrentUserPlan` returns `free` when no subscription row exists.
- Active or trialing paid subscriptions unlock paid plan limits.
- Canceled, incomplete, unpaid, paused, or otherwise unusable subscriptions fall back to free limits while preserving the visible billing status.
- Timeline export is available only when `getPlanLimits(planId).exportTimeline` is true.
- Weekly printable summaries are available only when `getPlanLimits(planId).weeklySummaries` is true.
- Multiple care recipients, push notifications, dedicated family numbers, and weekly PDF generation remain disabled/scaffolded until fully implemented and tested.
