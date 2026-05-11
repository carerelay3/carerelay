import { normalizePhone } from "../phone/normalizePhone";
import { getSupabaseAdmin } from "../supabase/admin";

export type RoutingStatus =
  | "matched_single_circle"
  | "matched_multiple_needs_keyword"
  | "matched_multiple_keyword_resolved"
  | "unknown_sender"
  | "invalid_phone";

export interface RoutingResult {
  routingStatus: RoutingStatus;
  careCircleId?: string;
  familyMemberId?: string;
  cleanedBody: string;
  smsKeywordUsed?: string;
  safeReply?: string;
  demoMode?: boolean;
}

export async function resolveCareCircleFromSender(
  senderPhone: string,
  rawMessage: string,
  toNumber?: string,
  demoContext?: { isDemo: boolean; careCircleId?: string; familyMemberId?: string }
): Promise<RoutingResult> {
  const cleanMessage = rawMessage.trim();
  const normalized = normalizePhone(senderPhone);

  if (!normalized && !demoContext?.isDemo) {
    return {
      routingStatus: "invalid_phone",
      cleanedBody: cleanMessage,
      safeReply: "CareRelay could not process this phone number. Please ask the care circle owner to invite a valid phone number.",
    };
  }

  if (demoContext?.isDemo) {
    let body = cleanMessage;
    const firstWord = cleanMessage.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let keywordUsed;
    if (firstWord === "GRANDMA" || firstWord === "MOM" || firstWord === "MIKE" || firstWord === "DAD") {
        body = cleanMessage.substring(cleanMessage.indexOf(' ') + 1).trim();
        keywordUsed = firstWord;
    }
    
    return {
      routingStatus: "matched_single_circle",
      careCircleId: demoContext.careCircleId || "demo-circle-123",
      familyMemberId: demoContext.familyMemberId || "demo-member-123",
      cleanedBody: body,
      smsKeywordUsed: keywordUsed,
      demoMode: true,
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      routingStatus: "unknown_sender",
      cleanedBody: cleanMessage,
      safeReply: "CareRelay could not match this phone number to a care circle. Please ask the care circle owner to invite this number.",
    };
  }

  // 1. Look up all family_members with this phone
  const { data: members, error } = await admin
    .from("family_members")
    .select("id, care_circle_id, care_circles(id, sms_keyword)")
    .eq("phone_normalized", normalized)
    .neq("status", "removed");

  if (error || !members || members.length === 0) {
    return {
      routingStatus: "unknown_sender",
      cleanedBody: cleanMessage,
      safeReply: "CareRelay could not match this phone number to a care circle. Please ask the care circle owner to invite this number.",
    };
  }

  // 2. Exactly one match
  if (members.length === 1) {
    return {
      routingStatus: "matched_single_circle",
      careCircleId: members[0].care_circle_id,
      familyMemberId: members[0].id,
      cleanedBody: cleanMessage,
    };
  }

  // 3. Multiple matches - needs keyword
  // Look at the first word, optionally in brackets like [GRANDMA] or GRANDMA
  const match = cleanMessage.match(/^\[?([a-zA-Z0-9_]+)\]?\s+(.*)/i);
  
  if (!match) {
    return {
      routingStatus: "matched_multiple_needs_keyword",
      cleanedBody: cleanMessage,
      safeReply: "You’re linked to more than one CareRelay circle. Reply with the care circle keyword before your update, like GRANDMA Meds: took night pills at 8pm.",
    };
  }

  const keywordFound = match[1].toUpperCase();
  const remainingBody = match[2].trim();

  // Find the care circle with this keyword
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedMember = members.find((m: any) => {
    const circle = Array.isArray(m.care_circles) ? m.care_circles[0] : m.care_circles;
    const circleKeyword = circle?.sms_keyword?.toUpperCase();
    return circleKeyword === keywordFound;
  });

  if (!resolvedMember) {
    return {
      routingStatus: "matched_multiple_needs_keyword",
      cleanedBody: cleanMessage,
      safeReply: "You’re linked to more than one CareRelay circle. Reply with the care circle keyword before your update, like GRANDMA Meds: took night pills at 8pm.",
    };
  }

  return {
    routingStatus: "matched_multiple_keyword_resolved",
    careCircleId: resolvedMember.care_circle_id,
    familyMemberId: resolvedMember.id,
    cleanedBody: remainingBody,
    smsKeywordUsed: keywordFound,
  };
}
