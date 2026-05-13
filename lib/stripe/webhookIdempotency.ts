import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReserveResult =
  | { reserved: true; duplicate: false }
  | { reserved: false; duplicate: true }
  | { reserved: false; duplicate: false; error: unknown };

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export async function reserveStripeWebhookEvent(stripeEventId: string, eventType: string): Promise<ReserveResult> {
  const admin = getSupabaseAdmin();
  if (!admin) return { reserved: false, duplicate: false, error: new Error("Database not configured") };

  const { error } = await admin.from("stripe_webhook_events").insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
    status: "processing",
  });

  if (!error) return { reserved: true, duplicate: false };
  if (isUniqueViolation(error)) return { reserved: false, duplicate: true };

  console.error("Failed to reserve Stripe webhook event", error);
  return { reserved: false, duplicate: false, error };
}

export async function markStripeWebhookEvent(stripeEventId: string, status: "processed" | "ignored" | "failed", errorMessage?: string | null) {
  const admin = getSupabaseAdmin();
  if (!admin) return;

  const { error } = await admin
    .from("stripe_webhook_events")
    .update({
      status,
      error_message: errorMessage || null,
      processed_at: new Date().toISOString(),
    })
    .eq("stripe_event_id", stripeEventId);

  if (error) {
    console.error("Failed to update Stripe webhook event", error);
  }
}
