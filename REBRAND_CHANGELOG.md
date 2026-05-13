# CircleRelay Rebrand Changelog

## 1. What changed from CareRelay to CircleRelay

This pass made a safe, user-facing soft rebrand. The product now presents **CircleRelay** as the parent brand with the tagline:

One shared line for every circle in your life.

Updated areas include:

- App metadata in `app/layout.tsx`.
- PWA manifest metadata in `app/manifest.ts`.
- Header brand text in `components/SiteHeader.tsx`.
- Homepage positioning, calls to action, and product mode cards in `app/(marketing)/page.tsx`.
- Setup, dashboard, account, settings, admin, support, privacy, terms, offline, demo, export, summary, SMS, and onboarding copy.
- Test expectations for brand copy, PWA metadata, support/admin pages, SMS replies, exports, and summaries.
- README and selected mobile/app-store documentation.

Caregiving-specific safety language now refers to **CircleRelay Care Mode**.

## 2. What intentionally stayed as CareRelay or care_* internally

The rebrand did not rename internal product infrastructure:

- Database tables such as `care_circles`, `care_recipients`, and related columns.
- Existing Supabase migrations.
- Supabase Auth routes and helpers.
- API route paths.
- Stripe checkout, portal, and webhook paths.
- Twilio inbound webhook path and environment variable names.
- Existing `carerelay.xyz` domain references where they describe the current deployment location.
- Icon file paths, brand image file paths, and existing generated assets.
- Package/internal project identifiers unless they are visible user-facing copy.

## 3. Why database tables were not renamed yet

Renaming `care_*` tables during a copy-only rebrand would create avoidable launch risk. The current schema, row-level security policies, API routes, SMS routing, team membership logic, setup flow, dashboard loaders, tests, and migrations all depend on those names.

The safe path is to keep the internal care-oriented schema while introducing `circle_type` and mode-aware labels above it. A future schema migration from `care_circles` to a broader `circles` model should be planned as its own migration with compatibility views, staged API updates, rollback steps, and production data verification.

## 4. Remaining future rebrand steps

- New CircleRelay domain and redirect plan.
- New CircleRelay logo and visual identity system.
- New app icons for PWA, iOS, and Android.
- Stripe business display name and customer-facing billing descriptors.
- App Store and Google Play names, subtitles, screenshots, and review notes.
- Social handles.
- Email/support address.
- Supabase Auth redirect URLs for the future domain.
- Twilio and Stripe webhook URL updates after the domain migration.
- Optional internal schema rename after product modes are stable.

## 5. Risks and QA checklist

Risks:

- Some historical strategy/audit documents may still describe the original CareRelay positioning.
- App icons and image filenames still use existing CareRelay asset names until new CircleRelay artwork exists.
- Search engines and users may see both names during the transition.
- Billing, support email, and domain names can lag behind UI copy if they are not handled in the next rollout.

QA checklist:

- Homepage shows `CircleRelay` and the tagline.
- Header shows `CircleRelay`.
- PWA manifest returns `CircleRelay` for `name` and `short_name`.
- Care Mode disclaimer still states the product is not a medical provider and not for emergencies.
- Sign-in, sign-up, setup, dashboard, support, privacy, and terms pages load.
- Demo mode still works and remains clearly separate from live mode.
- Live SMS replies use CircleRelay copy without changing webhook paths.
- Stripe and Twilio route paths remain unchanged.
- No database tables, migrations, or env vars were renamed.
