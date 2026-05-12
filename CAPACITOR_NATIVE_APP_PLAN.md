# CareRelay Capacitor Native App Plan

Date reviewed: 2026-05-12

CareRelay should treat Capacitor as a hosted native wrapper around the deployed web app first. It should not be converted into a static bundled native app yet, and the generated `ios/` and `android/` projects should not be committed until the team explicitly chooses that release workflow.

## 1. Readiness Assessment

Status: ready for a planning/prototype branch, not ready for store submission.

CareRelay is not ready for a full native build-and-submit cycle today. It is close enough to prototype a safe hosted Capacitor shell after the required checks below are handled.

Why:

- `package.json` is a Next.js 16 / React 19 SaaS app with `next build`, `next start`, route handlers, Supabase, Stripe, Twilio, and OpenAI integrations.
- `next.config.ts` does not use `output: "export"` and defines app-wide headers/CSP for a server-hosted deployment.
- The app has many dynamic `app/api/**/route.ts` endpoints for auth, setup, dashboard mutations, summaries, handoffs, team management, Stripe, SMS, and exports.
- Auth is not a purely local browser-only flow. It uses Supabase client auth plus `/api/auth/session` to set an HTTP-only `sb-access-token` cookie for server-rendered pages and route handlers.
- PWA support exists in `app/manifest.ts`, `app/layout.tsx`, `public/sw.js`, `MOBILE_APP_PLAN.md`, and `MOBILE_AND_NOTIFICATIONS_PLAN.md`, but it is intentionally web-only and does not implement native push or background behavior.
- Vercel deployment assumptions remain central: server routes, secure environment variables, Stripe webhooks, Twilio inbound webhooks, and `NEXT_PUBLIC_APP_URL`.

Recommendation: use a hosted Capacitor wrapper that loads `https://carerelay.xyz`. Do not attempt a static Capacitor bundle until CareRelay has a separate static/mobile client architecture.

## 2. Required Changes Before Wrapping

Required before creating native projects:

- Confirm production `NEXT_PUBLIC_APP_URL=https://carerelay.xyz` in Vercel.
- Confirm Supabase Auth redirect allowlist includes `https://carerelay.xyz/reset-password` and local development URLs from `docs/supabase-auth-redirects.md`.
- Decide whether the first native wrapper uses only HTTPS universal links/app links or also registers a fallback custom scheme.
- Add production native icon and splash assets sized for iOS and Android. Current PWA icons reuse brand assets and are not sufficient for store submission.
- Verify mobile safe areas for dashboard, setup, settings, account, team, reset password, Stripe redirects, and error states inside iOS and Android WebViews.
- Review CSP and Capacitor navigation allowlists so the hosted WebView can reach CareRelay, Supabase, and Stripe without widening web security unnecessarily.
- Keep all secrets server-side. Never package `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_AUTH_TOKEN`, or `OPENAI_API_KEY` into native code.
- Create store-ready privacy policy, terms, support, account deletion, and data safety disclosures before submission.
- Verify billing policy. Stripe can remain web-based for SaaS account management, but app review may scrutinize digital feature purchases inside the app.
- Preserve CareRelay positioning: family coordination only, not medical advice or emergency response.

## 3. App Identity

- App name: `CareRelay`
- iOS Bundle ID: `com.carerelay.app`
- Android package: `com.carerelay.app`

## 4. Wrapper Architecture

Use hosted mode first:

- Native shell: Capacitor.
- Web app origin: `https://carerelay.xyz`.
- Backend: existing Next.js deployment on Vercel.
- Auth, API routes, Stripe Checkout/Billing Portal, Twilio webhooks, Supabase SSR, and summaries remain server-backed.

Do not add fake native features. If push, contacts, background sync, native SMS, health data, or secure storage are not implemented and tested, the app should not claim them.

## 5. Deep Link Strategy

Primary strategy: HTTPS universal links on iOS and Android App Links on Android.

Primary domain:

```text
https://carerelay.xyz
```

Initial link routes:

- `/`
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/setup`
- `/dashboard`
- `/team`
- `/settings`
- `/account`

Native setup later:

- iOS: Associated Domains entitlement for `applinks:carerelay.xyz`.
- Android: Digital Asset Links for `carerelay.xyz`.
- Capacitor: add an App URL Open listener only after the native shell exists.

Optional fallback:

- Custom scheme such as `carerelay://` may be added later, but should not replace HTTPS links because Supabase, Stripe, email clients, support workflows, and browsers all work more predictably with HTTPS.

## 6. Auth And Session Handling Strategy

Current auth flow:

- `components/AuthForm.tsx` signs in or signs up through the Supabase browser client.
- After a Supabase session is returned, the app posts the access token to `/api/auth/session`.
- `app/api/auth/session/route.ts` verifies the token with Supabase and sets an HTTP-only `sb-access-token` cookie.
- Server components and API routes resolve the user through `lib/supabase/auth.ts`.
- `lib/supabase/clientAuthFetch.ts` adds bearer tokens to client-side mutation requests where needed.
- `components/ResetPasswordForm.tsx` exchanges recovery codes and then posts the new access token to `/api/auth/session`.
- `components/SignOutButton.tsx` signs out of Supabase and deletes the server cookie.

Capacitor strategy:

- Keep the hosted HTTPS web session model for the prototype.
- Use secure HTTPS URLs so production cookies work normally in the WebView.
- Test iOS and Android WebView cookie persistence across app restarts.
- Test reset-password links opened from Mail, Gmail, Safari, Chrome, and the installed app.
- Test sign out clears both the Supabase browser session and `sb-access-token`.
- Do not move service credentials into native storage.
- Consider Capacitor Preferences or secure storage only if a real native requirement appears, and only for non-service-role session support after threat modeling.

## 7. Push Notification Future Strategy

Do not add push notifications in the initial wrapper.

Future push requirements:

- Use a real native push implementation such as `@capacitor/push-notifications`.
- Request permission only after sign-in and clear user intent.
- Register APNs/FCM device tokens to an authenticated user and care circle.
- Store notification preferences per user and care circle.
- Send notifications only from trusted server-side code.
- Avoid sensitive care details in notification previews unless policy, settings, and review guidance explicitly support it.
- Include unsubscribe, device token cleanup, quiet hours, and audit logging.
- Do not show fake permission success states or fake delivery states.

## 8. App Store Review Risks

Apple review risks:

- Caregiving content may be interpreted as medical or health guidance.
- Medication confirmations, concern flags, summaries, and SMS updates may look like monitoring or care management.
- Any wording suggesting emergency response, guaranteed safety, diagnosis, treatment, dosage guidance, or medical advice is high risk.
- User-generated care updates may include sensitive health information.
- Web-based Stripe billing inside a native app may trigger review questions depending on what is sold and how it is presented.
- Missing account deletion, privacy, support, or data-use disclosures can block review.

Mitigations:

- Keep disclaimers visible in app and store copy.
- State that CareRelay is for family coordination only.
- Do not claim medical advice, emergency response, monitoring, diagnosis, treatment, dosage guidance, or guaranteed safety.
- Use screenshots and listing copy that show coordination tasks without implying clinical authority.
- Provide privacy policy, terms, support contact, and account deletion instructions.

## 9. Google Play Review Risks

Google Play risks:

- Health-adjacent claims may require careful Data Safety and content declarations.
- SMS-related positioning may be scrutinized even though CareRelay uses server-side Twilio inbound SMS rather than reading device SMS.
- Sensitive user-generated care content requires accurate data collection, sharing, and deletion disclosures.
- Background behavior and push claims must match actual implementation.
- Billing/subscription descriptions must match how Stripe subscriptions work.

Mitigations:

- Be explicit that the app does not access device SMS inboxes.
- Describe Twilio/server SMS routing accurately.
- Complete Play Data Safety based on actual data collection and sharing.
- Avoid health outcome claims and emergency claims.
- Keep test accounts and reviewer instructions ready.

## 10. Apple And Google Privacy Requirements

Likely data categories to disclose:

- Account data: name, email, user ID.
- Contact data: phone numbers and invited family member details.
- User content: care updates, tasks, supplies, appointments, medication confirmations, concerns, summaries, handoffs, and exports.
- Purchase data: Stripe customer and subscription state.
- Communications: SMS content routed through CareRelay's Twilio number.
- Diagnostics: logs, errors, and operational telemetry if enabled.
- Usage data or analytics only if `NEXT_PUBLIC_ANALYTICS_ENABLED=true` or another analytics tool is added.

Required before submission:

- Public privacy policy URL.
- Public terms URL.
- Support contact.
- Account deletion path and data deletion support process.
- Apple App Privacy nutrition labels.
- Google Play Data Safety form.
- Age rating questionnaire.
- Encryption/export compliance answers for HTTPS/auth usage.
- Legal review before any HIPAA-related statement. Do not claim HIPAA compliance unless the legal, operational, vendor, and BAA requirements are actually in place.

## 11. Exact Setup Commands

Run these only in a prototype branch when the team is ready to create native project files:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init CareRelay com.carerelay.app
npx cap add ios
npx cap add android
npm run build
npx cap sync
npx cap open ios
npx cap open android
```

After `npx cap init`, configure hosted mode before syncing. The exact generated `capacitor.config.*` format depends on the installed Capacitor version, but the intended settings are:

```ts
const config = {
  appId: "com.carerelay.app",
  appName: "CareRelay",
  webDir: "out-or-unused-for-hosted-mode",
  server: {
    url: "https://carerelay.xyz",
    cleartext: false,
  },
};
```

Do not point the native app at localhost for release builds. Do not rely on `webDir` as a real bundled app until CareRelay supports static export or a separate static mobile client.

## Platform Requirements

iOS requires:

- macOS.
- Xcode.
- Apple Developer account.
- App Store Connect access.
- Signing certificates and provisioning profiles.

Android requires:

- Android Studio.
- JDK and Android SDK tooling.
- Google Play Console account.
- Release keystore and signing process.

## Verification Checklist For First Prototype

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit --omit=dev`
- Sign in.
- Sign out.
- Sign up with email confirmation behavior.
- Forgot password and reset password.
- Setup flow.
- Dashboard load and mutation actions.
- Team management.
- Settings and account pages.
- Stripe Checkout and Billing Portal redirects.
- Twilio inbound webhook remains server-only and unaffected by native wrapper.
- Offline fallback remains limited to the PWA `/offline` route and does not imply live offline data.
- iOS WebView restart preserves or correctly refreshes session.
- Android WebView restart preserves or correctly refreshes session.

## Current Recommendation

Proceed with a Capacitor prototype branch only after confirming hosted-wrapper mode. CareRelay should not be submitted to App Store or Google Play until deep links, auth persistence, native assets, privacy disclosures, billing policy, review copy, and WebView regression testing are complete.
