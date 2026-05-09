export function relaySmsMode(): "demo" | "live" {
  return process.env.NEXT_PUBLIC_SMS_MODE === "live" ? "live" : "demo";
}

export const currentMode = relaySmsMode;

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  demoMode: process.env.NEXT_PUBLIC_SMS_MODE !== "live",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioConfigured: !!process.env.TWILIO_AUTH_TOKEN,
  analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
  openAiKey: process.env.OPENAI_API_KEY,
  openAiConfigured: !!process.env.OPENAI_API_KEY,
  stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
};

export function hasSupabase() {
  return !!(appConfig.supabaseUrl && appConfig.supabaseAnonKey);
}
