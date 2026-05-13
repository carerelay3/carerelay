# CircleRelay Mobile App Plan

CircleRelay has a Progressive Web App foundation for installable mobile web usage before native iOS or Android work begins.

## Current PWA Settings

- Manifest path: `/manifest.webmanifest`
- Service worker path: `/sw.js`
- Offline fallback route: `/offline`
- Name: `CircleRelay`
- Short name: `CircleRelay`
- Description: `One shared line for every circle in your life.`
- Theme color: `#171326`
- Background color: `#FAF7F3`
- Display mode: `standalone`
- Start URL: `/dashboard`
- Scope: `/`

## Icon References

The app uses CircleRelay brand icon assets:

- `/brand/icons/circlerelay-app-icon-192.png`
- `/brand/icons/circlerelay-app-icon-512.png`
- `/brand/icons/circlerelay-app-icon-1024.png`

These are referenced by `app/manifest.ts`, `app/layout.tsx`, and `public/sw.js`.

## Install On Android From Chrome

1. Open CircleRelay in Chrome.
2. Sign in if you want the installed app to start at the live dashboard.
3. Open the Chrome menu.
4. Tap **Add to Home screen** or **Install app**.
5. Confirm the install.
6. Launch CircleRelay from the home screen.

Android will use the manifest settings and open CircleRelay in standalone mode when supported.

## Install On iPhone From Safari

1. Open CircleRelay in Safari.
2. Sign in if you want the home-screen app to open toward the dashboard flow.
3. Tap the Safari share button.
4. Tap **Add to Home Screen**.
5. Keep the name as **CircleRelay**.
6. Tap **Add**.
7. Launch CircleRelay from the home screen.

iOS Safari uses the Apple web app metadata and icon reference. Push notifications are not enabled.

## Offline Behavior

The service worker provides a basic navigation fallback to `/offline` when the network is unavailable. It does not cache authenticated dashboard records, team data, billing data, SMS updates, summaries, or Care Mode coordination content.

CircleRelay live functionality still requires network access.

## PWA Update Behavior

The service worker uses a versioned cache name and removes older CircleRelay PWA caches during activation. It precaches only the offline route, manifest, and app icons. It does not runtime-cache `/api/*`, `/dashboard`, `/account`, `/settings`, `/team`, or `/admin` responses.

When a new service worker installs while an existing one controls the page, `PwaRegistrar` shows an update prompt. Choosing **Update** sends `SKIP_WAITING` to the waiting service worker, the worker activates, claims clients, and the app reloads on `controllerchange`. Choosing **Later** leaves the current UI running until the user reloads or another update check occurs.

This is intentionally conservative: users should not remain stuck on stale UI after deploy, but CircleRelay also should not silently cache or replay private circle data offline.

## Clearing PWA Cache During Testing

For Chrome and Edge desktop testing:

1. Open DevTools.
2. Go to **Application**.
3. Open **Service Workers** and click **Unregister** for CircleRelay.
4. Open **Storage** and click **Clear site data**.
5. Reload the app and confirm `/sw.js` registers again.

For installed mobile PWA testing, remove the installed app from the home screen, clear browser site data for the domain, then reinstall from the browser.

## Intentionally Not Cached Offline Yet

- Authenticated Supabase dashboard records.
- SMS updates and inbound message data.
- Team/member data.
- Billing and Stripe state.
- Summaries, exports, handoffs, tasks, concerns, appointments, supplies, or medication confirmations.
- Any Care Mode or family coordination content that could contain sensitive details.

## Native App Wrapper Still Needed

A native app wrapper is still needed for:

- App Store and Play Store distribution.
- Native push notification permissions and delivery.
- Native notification settings and deep links.
- More reliable background behavior.
- Platform-specific onboarding and app update flows.
- Native secure storage decisions, if future features require them.
- Native contact, share, or SMS integrations, if product requirements justify them.

The current PWA is the bridge: installable, mobile-friendly, and safe to deploy without pretending native capabilities exist.
