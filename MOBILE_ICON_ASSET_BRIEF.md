# CareRelay Mobile Icon Asset Brief

Date created: 2026-05-12

CareRelay now has purpose-built app icon files for the PWA, Android install surfaces, and future iOS native work. These are product icons, not screenshots, promo graphics, or wordmarks.

## Icon Concept

Use a simple CareRelay mark that stays readable at small sizes:

- Deep Teal `#0D6B63` rounded-square background.
- Ink Navy `#0F1E32` shield body nested inside a Soft Mint `#E6F6F1` shield.
- Simple home outline to signal family/care coordination.
- Chat bubble to signal shared updates and relay behavior.
- Small Warm Amber `#F4B247` heart accent.
- No text, initials, medical cross, clinical claim, or full wordmark inside the icon.

Current source file:

```text
public/icons/carerelay-icon-source.svg
```

## Required Files

The current generated icon set is:

```text
public/icons/favicon-32.png
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/icon-1024.png
public/icons/apple-touch-icon.png
public/icons/maskable-192.png
public/icons/maskable-512.png
public/icons/carerelay-icon-source.svg
```

Platform usage:

- PWA / Android: `icon-192.png`, `icon-512.png`
- Future native iOS / App Store source: `icon-1024.png`
- iOS Safari home screen: `apple-touch-icon.png` at `180x180`
- Maskable Android icon: `maskable-192.png`, `maskable-512.png`
- Browser favicon fallback: existing `app/favicon.ico` plus `public/icons/favicon-32.png`

## Export Specs

- Format: PNG for platform assets, SVG for editable source.
- Color space: sRGB.
- Background: opaque Deep Teal, no transparency for iOS/App Store assets.
- Edge treatment: rounded-square composition in the source, with enough visual padding to survive platform masks.
- Minimum readability: shield/home/chat/heart must remain legible at `32x32`; do not add small labels or detailed text.

Required sizes:

- `32x32` favicon PNG
- `180x180` Apple touch icon
- `192x192` PWA icon
- `512x512` PWA icon
- `1024x1024` iOS/native master icon
- `192x192` maskable icon
- `512x512` maskable icon

## Leonardo / Canva / Figma Prompt

Create a polished mobile app icon for "CareRelay", a family caregiving coordination app. Use a Deep Teal `#0D6B63` background, Ink Navy `#0F1E32`, Soft Mint `#E6F6F1`, and Warm Amber `#F4B247`. The mark should combine a simple shield/home outline with a chat bubble and a small heart accent. Make it friendly, calm, trustworthy, and readable at small sizes. Use a flat vector style with clean geometry, strong contrast, generous padding, and no tiny text. Do not include the full wordmark, medical cross, hospital imagery, medication imagery, emergency symbolism, or clinical claims. Export square PNGs at 192, 512, and 1024 pixels, plus a 180 pixel Apple touch icon and maskable Android variants with safe padding.

## Replacement Process

When a designer supplies final artwork:

1. Replace `public/icons/carerelay-icon-source.svg` with the approved editable source, or place the design source next to it with a clear filename.
2. Export the same PNG filenames listed above so existing metadata references do not change.
3. Keep the file paths stable:
   - `/icons/icon-192.png`
   - `/icons/icon-512.png`
   - `/icons/icon-1024.png`
   - `/icons/apple-touch-icon.png`
   - `/icons/maskable-192.png`
   - `/icons/maskable-512.png`
   - `/icons/favicon-32.png`
4. Re-run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Do not replace these icons with app screenshots, social graphics, store screenshots, or a wordmark squeezed into a square.
