import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SmsEventInput = {
  messageSid?: string | null;
  fromPhone?: string | null;
  toPhone?: string | null;
  body?: string | null;
  bodyPreview?: string | null;
  signatureValid?: boolean | null;
  routingStatus?: string | null;
  careCircleId?: string | null;
  familyMemberId?: string | null;
  parseCategory?: string | null;
  concernFlag?: boolean;
  persistenceStatus?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  requestId?: string | null;
  environment?: string | null;
};

const BODY_PREVIEW_LIMIT = 160;
const ERROR_MESSAGE_LIMIT = 280;

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

export function createSmsRequestId() {
  return crypto.randomUUID();
}

export function bodyPreview(body?: string | null) {
  const normalized = `${body || ""}`.replace(/\s+/g, " ").trim();
  return normalized ? truncate(normalized, BODY_PREVIEW_LIMIT) : null;
}

export async function logSmsEvent(input: SmsEventInput) {
  const admin = getSupabaseAdmin();
  if (!admin) return { logged: false, skipped: true };

  const payload = {
    message_sid: input.messageSid || null,
    from_phone: input.fromPhone || null,
    to_phone: input.toPhone || null,
    body_preview: input.bodyPreview ?? bodyPreview(input.body),
    signature_valid: input.signatureValid ?? null,
    routing_status: input.routingStatus || null,
    care_circle_id: input.careCircleId || null,
    family_member_id: input.familyMemberId || null,
    parse_category: input.parseCategory || null,
    concern_flag: Boolean(input.concernFlag),
    persistence_status: input.persistenceStatus || null,
    error_code: input.errorCode || null,
    error_message: input.errorMessage ? truncate(input.errorMessage, ERROR_MESSAGE_LIMIT) : null,
    request_id: input.requestId || null,
    environment: input.environment || process.env.VERCEL_ENV || process.env.NODE_ENV || null,
  };

  const { error } = await admin.from("sms_events").insert(payload);
  if (error) {
    console.error("Failed to log sms_event", error);
    return { logged: false, error };
  }

  return { logged: true };
}
