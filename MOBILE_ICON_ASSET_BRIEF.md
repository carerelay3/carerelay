# CircleRelay Mobile Icon Asset Brief

Date updated: 2026-05-13

CircleRelay uses the current brand icon files for PWA install surfaces, browser metadata, and future native app packaging. These are product icons, not screenshots, promo graphics, or wordmarks.

## Current Icon Files

```text
public/brand/icons/circlerelay-app-icon-192.png
public/brand/icons/circlerelay-app-icon-512.png
public/brand/icons/circlerelay-app-icon-1024.png
```

## Current App References

- `app/manifest.ts`
  - `/brand/icons/circlerelay-app-icon-192.png`
  - `/brand/icons/circlerelay-app-icon-512.png`
  - `/brand/icons/circlerelay-app-icon-1024.png`
- `app/layout.tsx`
  - `/brand/icons/circlerelay-app-icon-192.png`
  - `/brand/icons/circlerelay-app-icon-512.png`
- `public/sw.js`
  - `/brand/icons/circlerelay-app-icon-192.png`
  - `/brand/icons/circlerelay-app-icon-512.png`

## Brand Palette

- Dark Purple: `#171326`
- Electric Red: `#F23A3A`
- Warm Gold: `#C97800`
- Soft Rose: `#F7D6D8`
- Off White: `#FAF7F3`
- Deep Charcoal: `#111018`

## Icon Requirements

- PNG format.
- Square, opaque background.
- Readable at `32x32`.
- No wordmark squeezed into the icon.
- No medical cross, hospital imagery, medication imagery, emergency symbolism, or clinical claims.

## Known Asset Gaps

- No editable SVG source for the CircleRelay icon is currently present.
- `public/brand/icons/circlerelay-app-icon-1024.png.png` appears to be an extra duplicate-style export and is not referenced by app metadata.

## Replacement Process

When final artwork is supplied:

1. Replace the three referenced brand icon files in `public/brand/icons`.
2. Keep the existing filenames stable.
3. Confirm `app/manifest.ts`, `app/layout.tsx`, and `public/sw.js` still point to `/brand/icons/...`.
4. Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
