# CareRelay Safety And Positioning Review

Date: 2026-05-13

## Medical Boundary

CareRelay must remain family coordination software. It should consistently say:

CareRelay is for family coordination only. It is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services. In an emergency, call 911 or your local emergency number.

Safe words:

- Organize.
- Coordinate.
- Family-reported.
- For family review.
- Summary of reported updates.
- Shared notes.

Avoid:

- Monitor.
- Detect.
- Diagnose.
- Treat.
- Prevent emergencies.
- Medication guidance.
- Keeps your loved one safe.
- Real-time alerting.

## Emergency Disclaimers

Emergency language should appear in:

- Homepage.
- Demo.
- Setup acknowledgment.
- Dashboard safety card.
- Concern panel.
- Medication log.
- Daily/weekly summaries.
- Terms.
- Privacy.
- Support.
- Store listing/app review notes.

## Caregiver-Specific Risk

- Medication confirmations can be mistaken for clinical medication administration records. Keep “family-reported logs for organization only.”
- Concern flags can be mistaken for monitoring. Keep “for family review only.”
- Summaries can be mistaken for medical interpretation. Keep factual counts and user-reported notes only.
- SMS can be delayed or undelivered. Do not promise timeliness.

## SMS Privacy Concerns

- SMS is not ideal for highly sensitive information.
- Users should be warned not to text emergencies or sensitive clinical details.
- CareRelay should explain that it uses a Twilio number and does not read device SMS inboxes.
- Unknown sender attempts should not reveal care circle details.
- Opt-out and member removal should be easy.

## Family Consent

- Onboarding should ask owners to confirm they have permission to add each family member’s phone number.
- Invited users should receive clear language about what texting the number does.
- Removed members should lose access and SMS routing.

## Phone Number Access

- Phone number is both identity and routing key. Treat it as sensitive.
- Prevent duplicate phone numbers within a circle, already present.
- For one phone number in multiple circles, keyword routing is necessary and should be explained.
- Consider a verification step before accepting live updates from a phone number.

## Minors, Dorms, Sports Teams

If expanding:

- Avoid collecting unnecessary birth dates, health details, school IDs, or sensitive minor info.
- Require parent/guardian consent for youth team use.
- Give admins clear member removal tools.
- Provide opt-out and message frequency controls.
- Avoid safety/weather/emergency claims for sports.
- Avoid alcohol/party/fraternity risk positioning.

## Admin Misuse Risks

- Owners/admins can add/remove members and view sensitive content.
- Platform admins can alter roles. Add audit logs before beta operations.
- Provide clear “who can see this” explanations.
- Make ownership transfer explicit and logged.

## Data Retention

- Privacy page says users can request deletion. Product needs an actual request path.
- Define retention for inbound SMS, parsed payloads, summaries, exports, billing records, and admin logs.
- Exports should be admin/owner-gated and logged.

## Exports And Privacy

- Timeline exports can contain sensitive family content.
- Gate exports by plan and admin/owner role, already started.
- Add export audit events.
- Include disclaimer in exported summaries.

## App Store Language

Use:

- “Family caregiving coordination.”
- “Organizes family-reported SMS updates.”
- “Shared dashboard for tasks, appointments, supplies, medication confirmations, concerns, and summaries.”

Avoid:

- Medical app.
- Patient monitoring.
- Medication management.
- Emergency alerts.
- Safety monitoring.
- Clinical record.

For broader modes, avoid implying child safety, team safety, or emergency communication.

