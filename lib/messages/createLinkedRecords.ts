import { getSupabaseAdmin } from "../supabase/admin";
import type { ParsedCareMessage } from "../parser/careMessageParser";
import type { RoutingResult } from "../routing/resolveCareCircleFromSender";

export async function createLinkedRecords(
  parsed: ParsedCareMessage,
  routing: RoutingResult,
  rawMessage: string,
  senderName: string = "Unknown",
  senderPhone: string = "",
  source: string = "sms"
) {
  if (routing.demoMode || !getSupabaseAdmin()) {
    return {
      inboundMessageId: "demo-msg-123",
      linkedRecordId: "demo-record-123",
      demoMode: true,
      category: parsed.category,
      recordType: parsed.suggestedRecord?.type || "note",
    };
  }

  const admin = getSupabaseAdmin()!;
  
  // 1. Save the inbound message first
  const { data: inboundData, error: inboundError } = await admin
    .from("inbound_messages")
    .insert({
      care_circle_id: routing.careCircleId,
      family_member_id: routing.familyMemberId,
      sender_name: senderName,
      sender_phone: senderPhone,
      sender_phone_normalized: routing.routingStatus !== "unknown_sender" ? senderPhone : null,
      raw_body: rawMessage,
      cleaned_body: routing.cleanedBody,
      sms_keyword_used: routing.smsKeywordUsed || null,
      category: parsed.category,
      confidence: parsed.confidence,
      concern_flag: parsed.concernFlag,
      matched_keywords: parsed.matchedKeywords,
      parsed_payload: parsed.suggestedRecord,
      source,
    })
    .select("id")
    .single();

  if (inboundError || !inboundData) {
    console.error("Failed to save inbound message", inboundError);
    throw new Error("Failed to save inbound message");
  }

  const inboundId = inboundData.id;
  let linkedRecordId = null;

  // 2. Create the linked record
  if (parsed.category === "medication") {
    const { data } = await admin
      .from("medication_logs")
      .insert({
        care_circle_id: routing.careCircleId,
        inbound_message_id: inboundId,
        confirmation_text: parsed.suggestedRecord.confirmationText || rawMessage,
        given_by: routing.familyMemberId,
      })
      .select("id")
      .single();
    linkedRecordId = data?.id;
  } else if (parsed.category === "appointment") {
    const { data } = await admin
      .from("appointments")
      .insert({
        care_circle_id: routing.careCircleId,
        inbound_message_id: inboundId,
        title: parsed.suggestedRecord.title || "Appointment",
      })
      .select("id")
      .single();
    linkedRecordId = data?.id;
  } else if (parsed.category === "task") {
    const { data } = await admin
      .from("tasks")
      .insert({
        care_circle_id: routing.careCircleId,
        inbound_message_id: inboundId,
        title: parsed.suggestedRecord.title || "Task",
        status: "open",
      })
      .select("id")
      .single();
    linkedRecordId = data?.id;
  } else if (parsed.category === "supply") {
    const { data } = await admin
      .from("supplies")
      .insert({
        care_circle_id: routing.careCircleId,
        inbound_message_id: inboundId,
        title: parsed.suggestedRecord.item || "Supply needed",
        status: "needed",
      })
      .select("id")
      .single();
    linkedRecordId = data?.id;
  } else if (parsed.category === "concern") {
    const { data } = await admin
      .from("concerns")
      .insert({
        care_circle_id: routing.careCircleId,
        inbound_message_id: inboundId,
        title: "Concern Flagged",
        details: parsed.suggestedRecord.concernText || rawMessage,
        severity: "flagged",
      })
      .select("id")
      .single();
    linkedRecordId = data?.id;
  }

  return {
    inboundMessageId: inboundId,
    linkedRecordId,
    category: parsed.category,
    demoMode: false,
  };
}
