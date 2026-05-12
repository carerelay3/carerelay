# Mobile Compliance Checklist

This checklist is for CareRelay mobile web, PWA, and future native app launch review. It is not legal advice. Human legal, privacy, and app store review are required before public launch.

## Product Boundary

- [ ] App name is `CareRelay`.
- [ ] Subtitle is `Family caregiving coordination`.
- [ ] Short description is `One shared number to keep the whole family on the same page.`
- [ ] Store copy says CareRelay helps families coordinate care-related updates.
- [ ] Store copy does not claim medical advice, diagnosis, treatment, dosage guidance, monitoring, emergency response, or guaranteed safety.
- [ ] Medication language says `family-reported medication confirmations` or `organization logs`, not adherence, dosage, or safety assurance.
- [ ] Concerns are described as `for family review`, not medical triage or emergency detection.

## Required Medical Boundary

Use this exact boundary in store copy, onboarding, support, terms, and review notes:

CareRelay is for family coordination only. It is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services. In an emergency, call 911 or your local emergency number.

## Links And Public Pages

- [ ] Privacy policy URL is live: `https://carerelay.xyz/privacy`.
- [ ] Terms URL is live: `https://carerelay.xyz/terms`.
- [ ] Support URL is live: `https://carerelay.xyz/support`.
- [ ] Support page includes a working support email before store submission.
- [ ] Privacy page names relevant service providers such as Supabase, Twilio, OpenAI, Stripe, hosting, and analytics providers if enabled.
- [ ] Terms page states service availability is not guaranteed and CareRelay is not an emergency notification system.

## App Categories

Recommended:

- Apple primary category: Productivity
- Apple secondary category: Lifestyle
- Google Play category: Productivity
- Secondary positioning: Lifestyle / family organization

Avoid medical category placement unless legal and product review intentionally approve it.

## Data Safety And Privacy

Review whether the app collects or processes:

- [ ] Name.
- [ ] Email address.
- [ ] Phone number.
- [ ] Care circle membership and roles.
- [ ] Care recipient name or details.
- [ ] SMS message content.
- [ ] Tasks.
- [ ] Appointment notes.
- [ ] Supply notes.
- [ ] Medication confirmation logs.
- [ ] Concerns.
- [ ] Daily or weekly summaries.
- [ ] Billing and subscription data.
- [ ] Analytics events, if enabled.
- [ ] Diagnostics or logs, if enabled.

Confirm these data purposes:

- [ ] App functionality.
- [ ] Account management.
- [ ] Care circle access control.
- [ ] SMS routing.
- [ ] Customer support.
- [ ] Billing and subscriptions, if enabled.
- [ ] Analytics, if enabled.
- [ ] Diagnostics and abuse prevention, if enabled.

Vendor review:

- [ ] Supabase data processing reviewed.
- [ ] Twilio SMS data processing reviewed.
- [ ] OpenAI summary processing reviewed, if summaries are enabled.
- [ ] Stripe billing data reviewed, if payments are enabled.
- [ ] Analytics provider reviewed, if analytics are enabled.
- [ ] Hosting/logging retention reviewed.

Important:

- [ ] Do not claim HIPAA compliance unless legal, vendor, security, and operational requirements are actually complete.
- [ ] Confirm data deletion request process.
- [ ] Confirm account deletion guidance if accounts can be created in app.
- [ ] Confirm demo mode warns users not to enter highly sensitive information.

## Age Rating Notes

- [ ] App is not directed to children.
- [ ] User-generated care-related notes may appear.
- [ ] No medical advice functionality.
- [ ] No diagnosis or treatment functionality.
- [ ] No emergency response functionality.
- [ ] No medication dosage recommendation functionality.
- [ ] No unrestricted web browsing.
- [ ] Complete Apple age rating questionnaire based on final app behavior.
- [ ] Complete Google Play content rating questionnaire based on final app behavior.

## Screenshot And Creative Review

Needed screenshots:

- [ ] Dashboard overview.
- [ ] Shared SMS update to dashboard item.
- [ ] Team/care circle access.
- [ ] Daily summary with family-reported language.
- [ ] Supplies and open tasks.
- [ ] Safety boundary / not for emergencies.

Creative restrictions:

- [ ] Do not show real phone numbers, names, care details, or message content.
- [ ] Do not show emergency wording or 911-like UI as a feature.
- [ ] Do not imply medical monitoring.
- [ ] Do not imply professional clinical review.
- [ ] Do not imply medication safety assurance.
- [ ] Do not imply guaranteed caregiver response.

## Review Notes

- [ ] Provide reviewer demo credentials with sample data only, if login is required.
- [ ] Provide clear explanation that the app is family coordination software.
- [ ] Explain shared SMS number behavior.
- [ ] Explain that updates are family-reported.
- [ ] Explain that CareRelay is not for emergencies.
- [ ] Make billing behavior clear if Stripe subscriptions are enabled.
- [ ] Confirm no fake push notification prompts are present.

## What Not To Say

Do not use:

- Medical advice.
- Diagnosis.
- Treatment.
- Medication dosage recommendations.
- Monitoring.
- Emergency services.
- Emergency alerts.
- Patient monitoring.
- Prevents falls.
- Prevents medication mistakes.
- Ensures safety.
- Ensures adherence.
- Clinical.
- HIPAA compliant, unless formally validated.

Use instead:

- Family coordination.
- Family-reported updates.
- Shared dashboard.
- Care-related organization.
- Medication confirmations for organization only.
- Concerns for family review.
- Not for emergencies.

## Launch Gate

Before app store submission:

- [ ] Legal review complete.
- [ ] Privacy review complete.
- [ ] App store copy reviewed against medical boundary.
- [ ] Screenshots reviewed for sensitive data and claim risk.
- [ ] Demo account created with sample data only.
- [ ] Support email configured.
- [ ] Data deletion path documented.
- [ ] App icons and store assets finalized.
- [ ] Billing policy reviewed for Apple and Google.
- [ ] Push notification claims removed unless real push is implemented and reviewed.
