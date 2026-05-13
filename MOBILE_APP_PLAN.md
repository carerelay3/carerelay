# CareRelay Mobile App Plan

CareRelay now has a Progressive Web App foundation for installable mobile web usage before native iOS or Android work begins.

## Current PWA Settings

- Manifest path: `/manifest.webmanifest`
- Service worker path: `/sw.js`
- Offline fallback route: `/offline`
- Name: `CareRelay`
- Short name: `CareRelay`
- Description: `One shared number to keep the whole family on the same page.`
- Theme color: `#0D6B63`
- Background color: `#E6F6F1`
- Display mode: `standalone`
- Start URL: `/dashboard`
- Scope: `/`

## Icon References

The PWA now uses purpose-built app icon assets instead of social graphics or large logo exports:

- `/icons/icon-192.png`
- `/icons/icon-512.png`
- `/icons/icon-1024.png`
- `/icons/maskable-192.png`
- `/icons/maskable-512.png`
- `/icons/apple-touch-icon.png`
- `/icons/favicon-32.png`
- `/icons/carerelay-icon-source.svg`

Icon concept:

- Deep Teal `#0D6B63` background.
- Ink Navy `#0F1E32`, Soft Mint `#E6F6F1`, and Warm Amber `#F4B247` accents.
- Simple shield/home outline, chat bubble, and small heart accent.
- Readable at small sizes, with no tiny text or wordmark inside the icon.

Required supported/documented sizes:

- `192x192` PWA and Android icon.
- `512x512` PWA and Android icon.
- `1024x1024` native/app-store master icon.
- `180x180` Apple touch icon.
- `192x192` and `512x512` maskable Android icons.
- `32x32` favicon PNG plus the existing `app/favicon.ico` fallback.

See `MOBILE_ICON_ASSET_BRIEF.md` for export specs, source prompt, and replacement instructions.

Do not use notification badges or push assets until real notification behavior is designed and implemented.

## Install On Android From Chrome

1. Open CareRelay in Chrome.
2. Sign in if you want the installed app to start at the live dashboard.
3. Open the Chrome menu.
4. Tap **Add to Home screen** or **Install app**.
5. Confirm the install.
6. Launch CareRelay from the home screen.

Android will use the manifest settings and open CareRelay in standalone mode when supported.

## Install On iPhone From Safari

1. Open CareRelay in Safari.
2. Sign in if you want the home-screen app to open toward the dashboard flow.
3. Tap the Safari share button.
4. Tap **Add to Home Screen**.
5. Keep the name as **CareRelay**.
6. Tap **Add**.
7. Launch CareRelay from the home screen.

iOS Safari uses the Apple web app metadata and icon reference. Push notifications are not enabled.

## Offline Behavior

The service worker only provides a basic navigation fallback to `/offline` when the network is unavailable. It does not cache authenticated dashboard records, team data, billing data, SMS updates, summaries, or medical coordination content.

CareRelay live functionality still requires network access.

## What Still Needs A Native App Wrapper

A native app wrapper is still needed for:

- App Store and Play Store distribution.
- Native push notification permissions and delivery.
- Native notification settings and deep links.
- More reliable background behavior.
- Platform-specific onboarding and app update flows.
- Native secure storage decisions, if future features require them.
- Native contact, share, or SMS integrations, if product requirements justify them.

The current PWA is the bridge: installable, mobile-friendly, and safe to deploy on Vercel without pretending native capabilities exist.
