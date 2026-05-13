import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReserveResult =
  | { reserved: true; duplicate: false }
  | { reserved: false; duplicate: true }
  | { reserved: false; duplicate: false; error: unknown };

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export async function reserveTwilioMessage(messageSid: string, careCircleId?: string | null): Promise<ReserveResult> {
  if (!messageSid) return { reserved: true, duplicate: false };

  const admin = getSupabaseAdmin();
  if (!admin) return { reserved: true, duplicate: false };

  const { error } = await admin.from("processed_twilio_messages").insert({
    message_sid: messageSid,
    care_circle_id: careCircleId || null,
    status: "processing",
  });

  if (!error) return { reserved: true, duplicate: false };
  if (isUniqueViolation(error)) return { reserved: false, duplicate: true };

  console.error("Failed to reserve Twilio MessageSid", error);
  return { reserved: false, duplicate: false, error };
}

export async function markTwilioMessageProcessed(messageSid: string, status: "processed" | "failed", careCircleId?: string | null) {
  if (!messageSid) return;

  const admin = getSupabaseAdmin();
  if (!admin) return;

  const { error } = await admin
    .from("processed_twilio_messages")
    .update({ status, care_circle_id: careCircleId || null })
    .eq("message_sid", messageSid);

  if (error) {
    console.error("Failed to update Twilio MessageSid status", error);
  }
}
