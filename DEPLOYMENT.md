# CareRelay Launch & Deployment Guide

This document covers the required steps to launch CareRelay MVP+ safely into production. 

## 1. Production Environment Variables

Ensure your production host (Vercel, Render, etc.) has the following variables set. **Never commit these to version control.**

- `NEXT_PUBLIC_APP_URL` (e.g., https://app.carerelay.com)
- `NEXT_PUBLIC_DEMO_MODE=false` (Disable global demo mode defaults)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `OPENAI_API_KEY` (Optional: AI summarization fallback is enabled if empty)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_FAMILY_PRICE_ID`
- `STRIPE_FAMILY_PLUS_PRICE_ID`

## 2. Supabase Setup

1. Run all migrations using the Supabase CLI:
   `supabase db push`
2. Verify Row Level Security (RLS) is active on `care_circles`, `messages`, `tasks`, and `subscriptions`.
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is ONLY available to server-side environments (never prefixed with `NEXT_PUBLIC_`).

## 3. Twilio Webhook Configuration

1. Log into your Twilio Console.
2. Navigate to your purchased `TWILIO_PHONE_NUMBER`.
3. Set the **"A MESSAGE COMES IN"** webhook URL to:
   `https://[YOUR_DOMAIN]/api/sms/inbound`
4. Ensure the HTTP method is set to **POST**.

## 4. Stripe Webhook Configuration

1. Log into your Stripe Dashboard.
2. Go to **Developers > Webhooks** and add a new endpoint.
3. Set the Endpoint URL to:
   `https://[YOUR_DOMAIN]/api/stripe/webhook`
4. Listen for the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the Signing Secret and set it as `STRIPE_WEBHOOK_SECRET` in your hosting provider.

## 5. Security & Privacy Review

CareRelay intentionally avoids all diagnostic, treatment, and emergency workflows. Ensure any external marketing material adheres strictly to the **Family Coordination Tool** boundary. 

- Confirm disclaimers remain visible in `ExportPanel.tsx` and `FamilyPresencePanel.tsx`.
- Ensure the Terms of Service & Privacy pages explicitly disclaim HIPAA coverage and emergency responsiveness.

## 6. Smoke Test Checklist

- [ ] Load the homepage on desktop and mobile.
- [ ] Click "Demo" and ensure it falls back gracefully without an account.
- [ ] Click a Pricing Tier CTA and ensure Stripe Checkout initiates.
- [ ] Perform a mock user sign-up and create a Care Circle.
- [ ] Add a family member and ensure the "Slots used" plan limit increments.
- [ ] Text the Twilio number from a known family member phone and verify dashboard updates.
- [ ] Text the Twilio number from an UNKNOWN phone and verify a safe generic rejection message is sent.
- [ ] Run an export and verify it downloads successfully.