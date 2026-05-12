# CareRelay Capacitor Native App Plan

CareRelay should use Capacitor as a native wrapper around the hosted web app first, not as a fully bundled offline native app yet.

## Readiness Assessment

CareRelay is close to being ready for a safe Capacitor wrapper, but it is not ready to generate and commit native projects as part of normal web development yet.

Recommended status: **plan and prototype only**.

Why:

- The app is a Next.js 16 App Router SaaS app with dynamic routes, server-rendered pages, and API routes.
- Auth depends on Supabase sessions plus a server-set `sb-access-token` cookie from `/api/auth/session`.
- Product-critical flows use Vercel-hosted API routes for setup, dashboard records, team management, summaries, billing, Stripe checkout/portal, SMS parsing, and exports.
- The current PWA foundation is a good mobile web bridge, but it does not replace native push, deep links, app store privacy declarations, or native build signing.
- Static Capacitor bundling would not be safe today because CareRelay is not a static export and should keep live server behavior on Vercel.

The safest first native architecture is a Capacitor shell that loads the production web app URL, with strict allowlists and no fake native features.

## App Identity

- App name: `CareRelay`
- iOS Bundle ID: `com.carerelay.app`
- Android package: `com.carerelay.app`

## Required Changes Before Wrapping

1. Decide the wrapper mode.

   Use hosted mode first:

   - Capacitor shell loads `https://carerelay.xyz`.
   - Next.js stays deployed on Vercel.
   - API routes, auth callbacks, Stripe redirects, Twilio webhooks, and Supabase SSR behavior remain server-backed.

   Avoid static bundled mode until the app has a separate static/mobile client architecture.

2. Add Capacitor dependencies only when ready to prototype.

   Do not add `ios/` or `android/` directories to the repo until the team explicitly wants native project files tracked.

3. Create production app icons and splash assets.

   Current PWA icon references reuse existing brand assets. Native stores need purpose-built icons and launch screens with correct safe areas, no tiny text, and no misleading medical or emergency implication.

4. Confirm auth redirect URLs.

   Supabase Auth should allow:

   - `https://carerelay.xyz/reset-password`
   - `https://carerelay.xyz/dashboard`
   - A future custom scheme or universal/app link callback if native deep links are added.

5. Confirm Stripe redirect behavior.

   Stripe Checkout and Billing Portal should return to HTTPS web URLs first. If native deep links are introduced later, keep HTTPS universal/app links as the primary strategy so the same links work in browser and installed apps.

6. Define environment boundaries.

   Keep secrets on Vercel/server routes. Do not put Supabase service role keys, Stripe secret keys, Twilio auth tokens, or OpenAI API keys into the native app.

7. Review Content Security Policy and native WebView needs.

   Current CSP allows Supabase, Stripe, OpenAI API calls, and Stripe frames. A hosted Capacitor shell may need native allowlist configuration, but the web CSP should remain strict.

8. Validate mobile safe areas.

   The PWA/mobile pass improved phone layouts, but native wrappers need testing for iOS safe areas, Android navigation bars, external keyboard behavior, and WebView viewport differences.

## Deep Link Strategy

Use HTTPS universal links and Android App Links as the long-term default:

- Primary domain: `https://carerelay.xyz`
- Scope routes:
  - `/dashboard`
  - `/setup`
  - `/reset-password`
  - `/team`
  - `/settings`
  - `/account`

Recommended behavior:

- Public links open in the browser when the app is not installed.
- Installed app links open the Capacitor shell and route to the same Next.js path.
- Auth recovery links should continue to work in Safari/Chrome even if the app is absent.

Avoid relying only on a custom URL scheme. A scheme such as `carerelay://` can be useful as a fallback, but HTTPS links are easier to reason about across Supabase, Stripe, email clients, and support workflows.

Native deep link setup later:

- iOS: Associated Domains entitlement for `applinks:carerelay.xyz`.
- Android: Digital Asset Links for `carerelay.xyz`.
- Capacitor: add an App URL Open listener only after a real native shell exists.

## Auth And Session Handling Strategy

Current web auth:

- Browser Supabase client signs in with email/password.
- The app posts the Supabase access token to `/api/auth/session`.
- The server verifies the token and sets an HTTP-only `sb-access-token` cookie.
- Server components and API routes use cookies or bearer tokens to resolve the current user.
- Some client mutations use `authFetch`, which adds a bearer token from the Supabase browser session.

Capacitor strategy:

1. Hosted WebView should keep the current cookie-based web session model.
2. Use HTTPS production URLs so secure cookies work normally.
3. Keep Supabase browser session storage available inside the WebView.
4. Do not store service secrets in native storage.
5. If app restarts reveal session persistence issues, evaluate Capacitor Preferences or Secure Storage only for non-secret session hints, not service role credentials.
6. Keep `/api/auth/session` as the bridge between browser Supabase auth and server-rendered Next routes.
7. For reset password, prefer HTTPS `/reset-password` links and `exchangeCodeForSession` as currently implemented.

Risk to test early:

- iOS WebView cookie persistence.
- Android WebView cookie persistence.
- Supabase recovery link opened from Mail/Gmail into Safari/Chrome versus installed app.
- Sign out clearing both Supabase client session and server cookie.

## Push Notification Future Strategy

Do not add push notifications during the wrapper prototype.

Future push should be a real product feature:

- Ask permission only after the user is signed in.
- Register device tokens against a user and care circle.
- Support per-care-circle notification preferences.
- Send through APNs and FCM from trusted server routes only.
- Never send PHI-like sensitive message content in notification previews unless policy and user settings explicitly support it.
- Include quiet hours and account-level opt out.
- Add audit logging for notification delivery attempts.

Potential future packages:

- `@capacitor/push-notifications`
- Server-side APNs/FCM provider integration

No fake push notifications should be added.

## App Store Review Risks

CareRelay touches caregiving coordination, so review risk is higher than a generic productivity app.

Risks:

- Appearing to provide medical advice, diagnosis, monitoring, emergency response, or medication instructions.
- Misleading users into thinking CareRelay replaces professional care or emergency services.
- User-generated care updates may contain sensitive health information.
- SMS-based coordination can involve invited family members and phone numbers.
- Stripe billing must match store policy if native digital features are sold in-app.
- Push notifications, if added later, may need careful wording and permission timing.

Mitigations:

- Preserve current medical disclaimers.
- Keep “not for emergencies” visible in onboarding, dashboard, support, and store copy.
- Avoid medical claims in screenshots, app descriptions, keywords, and onboarding.
- Provide privacy policy and terms links in app and store metadata.
- Be clear that updates are family-reported coordination notes.
- Avoid native in-app purchase scope until billing policy is reviewed.

## Apple And Google Privacy Requirements

Prepare store privacy disclosures before submission.

Likely data categories:

- Account identifiers: email, user ID, name.
- Contact info: phone numbers, invited family member details.
- User content: care updates, tasks, supplies, appointments, medication confirmations, concerns, summaries.
- Purchase data: Stripe subscription/customer status.
- Diagnostics: logs and error data if enabled.
- Usage data or analytics if enabled.

Required documents and settings:

- Public privacy policy URL.
- Public terms URL.
- Data deletion/access support path.
- Clear support contact.
- Apple App Privacy nutrition labels.
- Google Play Data Safety form.
- Age rating questionnaire.
- Encryption/export compliance review for HTTPS/auth usage.
- Account deletion guidance if accounts can be created in app.

Important: do not claim HIPAA compliance unless the legal, operational, and vendor requirements are actually in place.

## Exact Setup Commands

Run these only when the team is ready to create a native prototype:

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

Hosted web wrapper configuration should set Capacitor to load the production CareRelay URL rather than assuming a static export. Do not commit generated `ios/` or `android/` directories until the repository policy is decided.

## Platform Requirements

iOS requires:

- macOS.
- Xcode.
- Apple Developer account.
- Signing certificates and provisioning profiles.
- App Store Connect access.

Android requires:

- Android Studio.
- JDK and Android SDK tooling.
- Google Play Console account.
- Release keystore and signing process.

## Recommended Prototype Checklist

1. Add Capacitor dependencies in a branch.
2. Initialize Capacitor with `CareRelay` and `com.carerelay.app`.
3. Configure hosted URL mode for the deployed Vercel app.
4. Verify sign in, sign out, setup, dashboard, team, settings, account, reset password, Stripe checkout, and support routes.
5. Verify no native push prompts appear.
6. Verify offline fallback remains web-only and does not imply live data availability.
7. Test iOS Safari, iOS WebView, Android Chrome, and Android WebView.
8. Decide whether native projects are committed or generated in CI/manual release process.

## Current Recommendation

CareRelay is ready for a **Capacitor planning/prototype branch** after the team confirms hosted-wrapper mode. It is not ready for a committed native app project or store submission until deep links, app icons, privacy disclosures, auth persistence, billing policy, and app review copy are validated.
