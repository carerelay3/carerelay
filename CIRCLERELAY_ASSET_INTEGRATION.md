# CircleRelay Asset Integration

## Actual Assets Found

Discovered with `Get-ChildItem public\brand -Recurse | Select-Object FullName`.

- `public/brand/logos/circlerelay-logo-primary.png`
- `public/brand/logos/circlerelay-logo-horizontal.png`
- `public/brand/logos/carerelay-logo-system.png`
- `public/brand/icons/circlerelay-app-icon-192.png`
- `public/brand/icons/circlerelay-app-icon-512.png`
- `public/brand/icons/circlerelay-app-icon-1024.png`
- `public/brand/icons/circlerelay-app-icon-1024.png.png`
- `public/brand/heroe/circlerelay-hero-banner.png`
- `public/brand/heroe/carerelay-hero-main.png`
- `public/brand/heroe/carerelay-hero-family.png`
- `public/brand/stock/care-mode-family-support.png.png`
- `public/brand/stock/household-mode-roommates.png.png`
- `public/brand/stock/team-mode-sports.png.png`
- `public/brand/stock/group-mode-planning.png.png`
- `public/brand/ads/carerelay-feature-promo.png`
- `public/brand/ads/carerelay-social-square.png`
- `public/brand/ads/carerelay-social-vertical-caregiving.png`
- `public/brand/banners/carerelay-wide-banner.png`

## Actual Paths Used

- Header logo: `/brand/logos/circlerelay-logo-horizontal.png`
- Manifest icons: `/brand/icons/circlerelay-app-icon-192.png`, `/brand/icons/circlerelay-app-icon-512.png`, `/brand/icons/circlerelay-app-icon-1024.png`
- Apple/icon metadata: `/brand/icons/circlerelay-app-icon-192.png`, `/brand/icons/circlerelay-app-icon-512.png`
- Open Graph/Twitter image: `/brand/heroe/circlerelay-hero-banner.png`
- Homepage hero: `/brand/heroe/circlerelay-hero-banner.png`
- Care Mode image: `/brand/stock/care-mode-family-support.png.png`
- Family Mode image: `/brand/stock/household-mode-roommates.png.png`
- Household Mode image: `/brand/stock/household-mode-roommates.png.png`
- Team Mode image: `/brand/stock/team-mode-sports.png.png`
- Group Mode image: `/brand/stock/group-mode-planning.png.png`

## Where Assets Are Used

- `components/SiteHeader.tsx`: horizontal CircleRelay logo with React state text fallback.
- `app/manifest.ts`: PWA manifest icons and app identity.
- `app/layout.tsx`: app metadata, icon metadata, Open Graph, and Twitter image.
- `public/sw.js`: precaches brand app icons used by the manifest.
- `app/(marketing)/page.tsx`: hero banner and product mode stock images.

## Missing Assets

- No separate Family Mode image exists. Family Mode currently reuses `household-mode-roommates.png.png`.
- No clean non-duplicated stock filenames exist. Current stock files include `.png.png`.
- No SVG logo source is present for the CircleRelay wordmark.
- No dedicated social sharing image separate from the hero banner is present.

## Old Assets Safe To Remove Later

Do not delete these blindly; remove them only after a deployed QA pass confirms no external campaigns or docs still reference them.

- `public/brand/logos/carerelay-logo-system.png`
- `public/brand/heroe/carerelay-hero-main.png`
- `public/brand/heroe/carerelay-hero-family.png`
- `public/brand/ads/carerelay-feature-promo.png`
- `public/brand/ads/carerelay-social-square.png`
- `public/brand/ads/carerelay-social-vertical-caregiving.png`
- `public/brand/banners/carerelay-wide-banner.png`
- `public/brand/icons/circlerelay-app-icon-1024.png.png`

## Replaced User-Facing References

- Homepage hero changed from `/brand/heroes/carerelay-hero-main.png` to `/brand/heroe/circlerelay-hero-banner.png`.
- Homepage support visual changed from `/brand/heroes/carerelay-hero-family.png` to `/brand/heroe/circlerelay-hero-banner.png`.
- Homepage Care Mode promo changed from `/brand/ads/carerelay-feature-promo.png` to `/brand/stock/care-mode-family-support.png.png`.
- Homepage CTA banner changed from `/brand/banners/carerelay-wide-banner.png` to `/brand/heroe/circlerelay-hero-banner.png`.
- Homepage user-facing marketing asset callouts for `/brand/ads/carerelay-social-square.png` and `/brand/ads/carerelay-social-vertical-caregiving.png` were removed.
- Open Graph/Twitter metadata changed from missing `/brand/hero/circlerelay-hero-banner.png` to actual `/brand/heroe/circlerelay-hero-banner.png`.
- PWA manifest and service worker icon references changed away from `/icons/...` to `/brand/icons/circlerelay-app-icon-*.png`.
