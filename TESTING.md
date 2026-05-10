# CareRelay Testing

Run the core checks before each deploy:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Covered Areas

- Phone normalization
- Shared-number routing
- Rule-based message parsing
- Mock SMS and API route behavior
- Daily summary fallback and safety behavior
- Stripe checkout fallback
- Demo snapshot endpoints and dashboard mutations

## Manual Flow Checks

1. Open `/`.
2. Open `/demo` and submit medication, task, supply, appointment, and concern examples.
3. Open `/setup`, add a family phone number, set a keyword, and continue to `/dashboard`.
4. Open `/pricing` and click each plan in demo mode.
5. Open `/privacy` and `/terms` and verify the family-coordination boundary is visible.
6. Test Twilio live mode only after Supabase and Twilio environment variables are configured.
