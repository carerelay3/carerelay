# CareRelay Feature Roadmap Recommendations

Date: 2026-05-13

## Now

| Feature | Effort | Revenue impact | Retention impact | Risk | Implementation segment |
|---|---:|---:|---:|---|---|
| Twilio setup/status panel | M | High | High | Low | Segment 1 |
| SMS failure/event log | M | High | High | Medium | Segment 1 |
| Disable/label checkout when Stripe not configured | S | Medium | Medium | Low | Segment 1 |
| Configure support path and deletion request copy | S | Medium | Medium | Low | Segment 1 |
| Setup copy showing live SMS readiness | S | Medium | High | Low | Segment 1 |
| Public founder page gate/remove | S | Low | Medium | Low | Segment 1 |
| Account deletion request flow | M | Medium | Medium | Medium | Segment 1 |
| Better summary errors and rate controls | M | Medium | Medium | Medium | Segment 1 |
| Admin audit log for sensitive changes | M | Medium | High | Medium | Segment 1 |
| Mobile dashboard continued QA | S | Medium | High | Low | Segment 1 |

## Next

| Feature | Effort | Revenue impact | Retention impact | Risk | Implementation segment |
|---|---:|---:|---:|---|---|
| `circle_type` foundation | M | High | Medium | Medium | Segment 2 |
| Mode-specific category config | M | High | Medium | Medium | Segment 3 |
| Family Mode private beta | L | High | High | Medium | Segments 3, 6 |
| Parser templates by mode | L | High | High | Medium | Segment 5 |
| Adaptive dashboards by mode | L | High | High | Medium | Segment 6 |
| Recurring tasks/reminders | L | Medium | High | Medium | Segment 6 |
| Caregiver handoff panel polish | M | Medium | High | Low | Segment 6 |
| Printable timeline export UX | M | Medium | Medium | Low | Segment 1/6 |
| Plan limits by circle type | M | High | Medium | Medium | Segment 7 |
| Growth/admin analytics | M | Medium | Medium | Medium | Segment 8 |

## Later

| Feature | Effort | Revenue impact | Retention impact | Risk | Implementation segment |
|---|---:|---:|---:|---|---|
| Push notifications | L | Medium | High | High | Native/PWA later |
| Dedicated number add-on | L | High | High | Medium | Billing/Twilio later |
| PDF generation | M | Medium | Medium | Low | Export later |
| Household Mode | L | Medium | Medium | Medium | After Family Mode |
| Team Mode | L | Medium | Medium | High | After consent model |
| Shared calendar sync | L | Medium | High | Medium | Later |
| Polls/votes | M | Low | Medium | Medium | Later |
| Dues/payment reminders | M | Medium | Medium | High | Later |
| Organization/admin plan | L | High | Medium | High | Later |

## Avoid For Now

| Feature | Reason |
|---|---|
| Emergency alerting | Conflicts with safety boundary. |
| Health monitoring | Medical/regulatory risk and product mismatch. |
| Medication dosage guidance | Explicitly outside CareRelay boundary. |
| Reading device SMS inbox | Privacy/store-policy risk. |
| Native app projects | PWA needs beta validation first. |
| Frat/group public launch | High misuse/moderation risk and low retention proof. |
| Payment/dues collection | Policy, disputes, and financial complexity. |
| AI medical recommendations | Unsafe and off-positioning. |

## Highest Leverage Next Build

Build an “Operations Readiness” slice:

- SMS config/status.
- Inbound SMS logs.
- Stripe config-aware pricing/checkout.
- Support/deletion request.
- Admin audit log.

This makes the caregiver beta trustworthy before adding new markets.

