export function relaySmsMode(): "demo" | "live" {
  if (process.env.NEXT_PUBLIC_SMS_MODE === "live" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return "live";
  }
  return "demo";
}

export const currentMode = relaySmsMode;

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  demoMode: relaySmsMode() === "demo",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseConfigured: !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ),
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
  analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
  openAiKey: process.env.OPENAI_API_KEY,
  openAiConfigured: !!process.env.OPENAI_API_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
};

export function hasSupabase() {
  return !!(appConfig.supabaseUrl && (appConfig.supabasePublishableKey || appConfig.supabaseAnonKey));
}
