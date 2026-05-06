const has = (value?: string) => Boolean(value && value.trim().length > 0);

export const appConfig = {
  supabaseConfigured:
    has(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    has(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    has(process.env.SUPABASE_SERVICE_ROLE_KEY),
  twilioConfigured:
    has(process.env.TWILIO_ACCOUNT_SID) &&
    has(process.env.TWILIO_AUTH_TOKEN) &&
    has(process.env.TWILIO_PHONE_NUMBER),
  openAiConfigured: has(process.env.OPENAI_API_KEY),
  stripeConfigured:
    has(process.env.STRIPE_SECRET_KEY) &&
    has(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

/** App-wide “configured for paid services” signal (Supabase present). */
export const currentMode = () =>
  appConfig.supabaseConfigured ? "live" : "demo";

/** SMS path is only “live” when Twilio is configured; demo otherwise. */
export const relaySmsMode = (): "live" | "demo" =>
  appConfig.twilioConfigured ? "live" : "demo";
