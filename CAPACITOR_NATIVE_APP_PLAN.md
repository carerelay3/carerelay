# CircleRelay Capacitor Native App Plan

Date reviewed: 2026-05-12

CircleRelay's PWA foundation is complete enough to support installable mobile web usage. The next safe step is a Capacitor native wrapper plan, not a full native app build. Do not generate or commit `ios/` or `android/` projects until the team intentionally starts a native prototype branch.

## 1. Native Readiness Assessment

CircleRelay is ready to plan and prototype a Capacitor wrapper, but it is not ready for App Store or Google Play submission yet.

What is ready:

- The app has a PWA foundation through `app/manifest.ts`, `app/layout.tsx`, `public/sw.js`, and `MOBILE_APP_PLAN.md`.
- The product is already mobile-oriented enough to test as a hosted WebView.
- Vercel-hosted Next.js routes can continue to serve the app and API surface.
- The approved medical disclaimer language already appears across important product surfaces.

What is not ready for native store submission:

- Native app icons, splash screens, screenshots, feature graphic, store copy, privacy labels, and data safety answers are not finalized.
- Universal Links / Android App Links are not configured.
- Supabase reset-password and email confirmation behavior has not been tested inside iOS and Android WebViews.
- Stripe Checkout and Billing Portal return behavior has not been validated from a native shell.
- Cookie/session persistence has not been tested across WebView restarts.
- Account deletion and support flows need store-review-ready documentation.
- Billing policy needs review before selling digital subscription features inside native apps.

What can ship first as PWA:

- Installable mobile web app from Safari and Chrome.
- Mobile dashboard, setup, settings, account, team, billing, and reset-password web flows.
- Basic offline navigation fallback to `/offline`.
- SMS-first coordination through the existing Twilio server webhook.

Recommendation: ship/iterate the PWA first, then prototype a hosted Capacitor wrapper, then move through Android internal testing, iOS TestFlight, and public store release.

## 2. Recommended App Identity

- App name: `CircleRelay`
- iOS Bundle ID: `com.carerelay.app`
- Android package name: `com.carerelay.app`
- Subtitle: `Family caregiving coordination`
- App category: evaluate `Health & Fitness` versus `Productivity` / `Lifestyle`.

Category guidance:

- `Health & Fitness` may fit caregiving context but increases medical-review sensitivity.
- `Productivity` or `Lifestyle` may better match the actual product claim: family coordination, not clinical care.
- Store copy must avoid implying medical advice, monitoring, diagnosis, treatment, medication dosage guidance, emergency response, or guaranteed safety.

## 3. Capacitor Setup Commands

Run these only in a native prototype branch:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init CircleRelay com.carerelay.app
npx cap add ios
npx cap add android
npm run build
npx cap sync
npx cap open ios
npx cap open android
```

Do not commit generated `ios/` or `android/` projects until the team decides that native project files should be source-controlled.

## 4. Build Strategy

Safest current approach: hosted web app inside Capacitor.

CircleRelay should load the live Vercel app from the Capacitor shell:

```text
https://carerelay.xyz
```

Why hosted mode is safest:

- `next.config.ts` does not use static export.
- The app depends on dynamic Next.js App Router pages and many `app/api/**/route.ts` endpoints.
- Supabase auth, server cookies, Stripe, Twilio, summaries, exports, team management, setup, and dashboard mutations require server behavior.
- Vercel environment variables keep secrets out of client and native bundles.

Static export is not recommended now:

- CircleRelay is not a static-only app.
- Static export would not support the current API routes, auth bridge, Stripe webhooks, Twilio inbound SMS webhook, or server-rendered authenticated pages.

Hybrid approach:

- Use hosted mode for the product app.
- Keep PWA caching for web fallback only.
- Consider a small native-only shell layer later for deep links, app lifecycle events, push registration, and external browser handoff.
- Do not add native features until each has a real backend and UX.

Example intended Capacitor config after `npx cap init`:

```ts
const config = {
  appId: "com.carerelay.app",
  appName: "CircleRelay",
  webDir: "out-or-unused-for-hosted-mode",
  server: {
    url: "https://carerelay.xyz",
    cleartext: false,
  },
};
```

## 5. Auth Strategy

Current web auth behavior:

- `components/AuthForm.tsx` uses Supabase browser auth for sign-in and sign-up.
- On successful session creation, the app posts the Supabase access token to `/api/auth/session`.
- `app/api/auth/session/route.ts` verifies the token and sets the HTTP-only `sb-access-token` cookie used by server-rendered pages and route handlers.
- `components/ResetPasswordForm.tsx` handles Supabase recovery links with `exchangeCodeForSession`.
- `components/SignOutButton.tsx` signs out of Supabase and deletes the server session cookie.

Required Supabase redirect URLs:

```text
https://carerelay.xyz/reset-password
http://localhost:3000/reset-password
```

Recommended future redirect/link URLs for native testing:

```text
https://carerelay.xyz/sign-in
https://carerelay.xyz/sign-up
https://carerelay.xyz/setup
https://carerelay.xyz/dashboard
```

Deep link strategy:

- Primary: HTTPS Universal Links on iOS and Android App Links on Android.
- Domain: `carerelay.xyz`.
- Initial routes: `/`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/setup`, `/dashboard`, `/team`, `/settings`, `/account`.
- Optional fallback: `carerelay://`, but do not rely on it as the only auth redirect path.

Sign-in/sign-up inside app:

- Keep the current embedded web flow inside the hosted WebView for first prototype.
- Use HTTPS production URLs so secure cookies and Supabase browser session storage behave as close to web production as possible.
- Test email confirmation flows in Mail and Gmail. If an email link opens Safari/Chrome first, it should still land on the same HTTPS route and allow the user to continue.

Password reset inside app:

- Keep `/reset-password` as the canonical reset URL.
- Test recovery links opened from email into browser and installed app.
- Avoid broken redirects by using HTTPS routes as the source of truth and handling app links only as a routing layer.

Session risks to test:

- iOS WebView cookie persistence after app restart.
- Android WebView cookie persistence after app restart.
- Supabase browser session and `sb-access-token` staying in sync.
- Sign out clearing both Supabase session and server cookie.

## 6. Stripe Strategy

Current Stripe behavior:

- `app/api/stripe/checkout/route.ts` creates Stripe Checkout Sessions in subscription mode.
- Checkout success URL is `${NEXT_PUBLIC_APP_URL}/setup?checkout=success`.
- Checkout cancel URL is `${NEXT_PUBLIC_APP_URL}/`.
- `app/api/billing/portal/route.ts` creates Stripe Billing Portal sessions and returns to `${NEXT_PUBLIC_APP_URL}/settings`.
- Client code currently redirects with `window.location.href`.

Recommended native behavior:

- For the first wrapper, open Stripe Checkout and Billing Portal in an external system browser or approved in-app browser surface, not an embedded WebView that may trigger payment/session issues.
- Return users through HTTPS Universal Links / Android App Links.
- Keep success and cancel URLs on `https://carerelay.xyz` so the same URLs work on web, PWA, and native.

Success/cancel URL strategy:

- Success: `https://carerelay.xyz/setup?checkout=success`
- Cancel: `https://carerelay.xyz/`
- Portal return: `https://carerelay.xyz/settings`
- Ensure `NEXT_PUBLIC_APP_URL=https://carerelay.xyz` in production Vercel.

Apple/Google billing risks:

- Stripe is appropriate for many SaaS subscriptions and real-world services, but Apple/Google may scrutinize subscriptions that unlock digital-only features inside the native app.
- Before submission, confirm whether CircleRelay subscription tiers are considered digital goods, real-world service coordination, or a mixed SaaS offering under current store policies.
- Do not mention bypassing in-app purchase in app review notes or UI.
- Keep pricing, entitlement, and cancellation language consistent across web, app, Stripe, and store metadata.

## 7. Push Notification Strategy

Push notifications are not required for the first mobile wrapper.

Current notification channel:

- SMS remains the primary notification and update channel.
- Twilio inbound SMS is handled server-side at `/api/sms/inbound`.
- CircleRelay does not read the user's device SMS inbox.

Future native push path:

- Add real push only when there is a product requirement and backend implementation.
- Candidate package: `@capacitor/push-notifications`.
- Register APNs/FCM device tokens only after sign-in.
- Store push tokens server-side by authenticated user, device, and care circle.
- Support unsubscribe, token cleanup, quiet hours, and per-care-circle notification preferences.
- Send push only from trusted server-side routes.
- Avoid sensitive care details in notification previews unless policy, privacy settings, and review guidance explicitly allow it.

Permission UX:

- Do not prompt on first launch.
- Explain the value before the OS permission dialog.
- Let users continue without push.
- Never show fake push success states.

## 8. App Store / Google Play Compliance Risks

Approved language:

```text
CircleRelay Care Mode is for family coordination only. It is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services. In an emergency, call 911 or your local emergency number.
```

CircleRelay must not claim:

- Medical advice.
- Diagnosis.
- Treatment.
- Medication dosage guidance.
- Emergency response.
- Monitoring.
- Guaranteed safety.

Apple risks:

- Health-adjacent caregiving content may trigger medical app scrutiny.
- Medication confirmations and concern flags must remain family-reported coordination data, not monitoring or clinical guidance.
- Stripe subscription flows may be reviewed for in-app purchase policy fit.
- Account deletion, privacy policy, support, and data use disclosures must be easy to find.

Google Play risks:

- Data Safety answers must accurately describe account data, phone numbers, user content, SMS-routed content, purchases, and diagnostics.
- SMS language must be clear that CircleRelay uses a server-side Twilio number and does not read device SMS.
- Store listing, screenshots, and onboarding must avoid clinical and emergency claims.

## 9. Required App Store Assets

Prepare before submission:

- 1024x1024 app icon.
- iPhone screenshots.
- iPad screenshots if supporting iPad.
- Android phone screenshots.
- Android tablet screenshots if supporting tablets.
- Google Play feature graphic.
- Privacy policy URL.
- Terms URL.
- Support URL.
- App description.
- Keywords.
- Subtitle: `Family caregiving coordination`.
- Age rating answers.
- Apple App Privacy answers.
- Google Play Data Safety answers.
- Reviewer test account and review notes.
- Export compliance/encryption answers for HTTPS/auth usage.

Likely data categories:

- Account data: name, email, user ID.
- Contact data: family member names and phone numbers.
- User content: care updates, tasks, supplies, appointments, medication confirmations, concerns, summaries, handoffs, exports.
- Communications: SMS content routed through CircleRelay's Twilio number.
- Purchase data: Stripe customer/subscription state.
- Diagnostics and usage data if logging or analytics are enabled.

## 10. Development Requirements

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

Recommended testing order:

1. PWA on mobile Safari and Chrome.
2. Android local debug build.
3. Android internal test track.
4. iOS local debug build on device.
5. iOS TestFlight.
6. Public release after policy, privacy, billing, and auth-link validation.

## 11. Risks And Blockers Before Actual Native Build

Fix or decide before building native projects:

- Confirm `NEXT_PUBLIC_APP_URL=https://carerelay.xyz` in production.
- Configure Universal Links and Android App Links.
- Confirm Supabase redirect allowlist for production and local reset-password URLs.
- Decide whether native opens Stripe in external browser or an approved in-app browser plugin.
- Validate Stripe success/cancel/portal return URLs from native.
- Validate WebView session persistence and sign-out behavior.
- Create native-ready icon and splash assets.
- Prepare store screenshots and review notes using non-medical, non-emergency language.
- Confirm privacy policy, terms, support URL, and account deletion process.
- Confirm Apple/Google billing policy fit for subscription tiers.
- Confirm Twilio webhook signature validation uses the exact production app URL.
- Keep push notifications out of v1 unless fully implemented.
- Do not claim HIPAA compliance unless legal, operational, vendor, and BAA requirements are actually complete.

## Verification Commands

Run before and after a native prototype branch:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```
