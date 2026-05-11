# Mobile And Notifications Plan

## PWA Foundation

CareRelay uses a web app manifest through `app/manifest.ts` and mobile-friendly metadata in `app/layout.tsx`.

Current installability basics:

- App name and short name are defined.
- Start URL is `/dashboard`.
- Display mode is `standalone`.
- Theme and background colors are defined.
- Existing CareRelay brand PNG assets are referenced as app icons.
- iOS web app metadata is present.

No native mobile app is being built in this phase.

## Push Notifications

Status: disabled scaffold.

The settings page displays: “Push notifications are coming soon.”

CareRelay does not currently:

- request browser notification permission
- create service worker push subscriptions
- store push subscription endpoints
- send push notifications
- show fake notification success states

Before enabling push notifications:

- require authenticated users for subscription registration
- store subscriptions with user ownership and care circle scope
- support unsubscribe and endpoint cleanup
- send only care-circle-authorized notifications
- avoid cross-user or cross-care-circle notification leakage
- provide clear browser permission and delivery failure states

## Dedicated Family Phone Number

Status: disabled scaffold.

The settings page displays: “Dedicated family number is planned for Family Plus.”

Today, CareRelay uses the configured shared Twilio number and routes inbound SMS by care circle keyword plus known sender phone numbers.

CareRelay does not currently:

- purchase Twilio numbers
- provision numbers per care circle
- charge for dedicated numbers
- release or recycle dedicated numbers
- route inbound SMS by dedicated Twilio number

Before enabling dedicated numbers:

- call Twilio only from server-side code
- verify plan eligibility and care circle ownership
- associate purchased numbers with a care circle
- route inbound SMS by Twilio destination number and sender
- handle cancellation, number release, and billing failures carefully
- keep existing shared-number routing working
