import { resolveCareCircleFromSender } from "@/lib/routing/resolveCareCircleFromSender";
import { parseCareMessage } from "@/lib/parser/careMessageParser";
import { createLinkedRecords } from "@/lib/messages/createLinkedRecords";
import { appConfig } from "@/lib/config";
import * as twilio from "twilio";
import { generateTwiML } from "@/lib/twilio/twiml";
import { trackEvent } from "@/lib/analytics/track";
import { createSmsRequestId, logSmsEvent } from "@/lib/sms/smsEvents";
import { markTwilioMessageProcessed, reserveTwilioMessage } from "@/lib/sms/twilioIdempotency";
import { resolveTwilioSignatureValidationUrl } from "@/lib/twilio/signatureValidationUrl";

const XML_HEADERS = { "Content-Type": "text/xml" };

function twiml(message: string, status = 200) {
  return new Response(generateTwiML(message), { status, headers: XML_HEADERS });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") || createSmsRequestId();
  let from = "";
  let to = "";
  let body = "";
  let messageSid = "";
  let signatureValid: boolean | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";
    const isFormEncoded = contentType.includes("application/x-www-form-urlencoded");
    const twilioAuthToken = appConfig.twilioAuthToken;

    if (twilioAuthToken && !isFormEncoded) {
      await logSmsEvent({
        signatureValid: false,
        persistenceStatus: "not_attempted",
        errorCode: "invalid_content_type",
        errorMessage: "Twilio signature validation requires a form-encoded request.",
        requestId,
      });
      return twiml("CircleRelay could not log this update right now. Please try again later.", 403);
    }

    let accountSid = "";

    if (isFormEncoded) {
      const form = await req.formData();
      from = String(form.get("From") || "");
      to = String(form.get("To") || "");
      body = String(form.get("Body") || "");
      messageSid = String(form.get("MessageSid") || "");
      accountSid = String(form.get("AccountSid") || "");

      if (twilioAuthToken) {
        const signature = req.headers.get("x-twilio-signature");
        const validationUrl = resolveTwilioSignatureValidationUrl();
        const params: Record<string, string> = {};
        for (const [key, value] of form.entries()) {
          if (key !== "AccountSid" || value) params[key] = String(value);
        }

        if (!validationUrl.ok) {
          console.warn("Twilio signature validation URL is not configured correctly:", validationUrl.errorCode);
          await logSmsEvent({
            messageSid,
            fromPhone: from,
            toPhone: to,
            body,
            signatureValid,
            persistenceStatus: "not_attempted",
            errorCode: validationUrl.errorCode,
            errorMessage: validationUrl.errorMessage,
            requestId,
          });
          return twiml("CircleRelay could not log this update right now. Please try again later.", 403);
        }

        if (!signature) {
          signatureValid = false;
          await logSmsEvent({
            messageSid,
            fromPhone: from,
            toPhone: to,
            body,
            signatureValid,
            persistenceStatus: "not_attempted",
            errorCode: "signature_missing",
            errorMessage: "Missing Twilio signature header.",
            requestId,
          });
          return twiml("CircleRelay could not log this update right now. Please try again later.", 403);
        }

        signatureValid = twilio.validateRequest(twilioAuthToken, signature, validationUrl.url, params);
        if (!signatureValid) {
          await logSmsEvent({
            messageSid,
            fromPhone: from,
            toPhone: to,
            body,
            signatureValid,
            persistenceStatus: "not_attempted",
            errorCode: "signature_invalid",
            errorMessage: "Invalid Twilio signature.",
            requestId,
          });
          return twiml("CircleRelay could not log this update right now. Please try again later.", 403);
        }
      }
    } else {
      const json = await req.json().catch(() => ({}));
      from = json.From || json.from || "";
      to = json.To || json.to || "";
      body = json.Body || json.body || "";
      messageSid = json.MessageSid || json.messageSid || "";
    }

    if (!from || !body.trim()) {
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        persistenceStatus: "not_attempted",
        errorCode: "empty_or_missing_message",
        errorMessage: "Inbound SMS was missing a sender or non-empty body.",
        requestId,
      });
      return twiml("CircleRelay could not log an empty update. Please send a note, task, appointment, supply need, medication confirmation, or concern.");
    }

    trackEvent("inbound_sms_received", { hasMessageSid: !!messageSid, hasAccountSid: !!accountSid });

    const routing = await resolveCareCircleFromSender(from, body, to);

    if (routing.routingStatus === "unknown_sender" || routing.routingStatus === "invalid_phone") {
      trackEvent("inbound_sms_unknown_sender");
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        routingStatus: routing.routingStatus,
        persistenceStatus: "not_attempted",
        errorCode: routing.routingStatus,
        errorMessage: routing.safeReply,
        requestId,
      });
      return twiml("CircleRelay could not match this phone number to a care circle. Please ask the care circle owner to invite this number.");
    }

    if (routing.routingStatus === "matched_multiple_needs_keyword") {
      trackEvent("inbound_sms_multiple_circle_keyword_needed");
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        routingStatus: routing.routingStatus,
        persistenceStatus: "not_attempted",
        errorCode: "keyword_needed",
        errorMessage: routing.safeReply,
        requestId,
      });
      return twiml("You are linked to more than one CircleRelay circle. Reply with the care circle keyword before your update, like GRANDMA Meds: took night pills at 8pm.");
    }

    trackEvent("inbound_sms_routed", { status: routing.routingStatus });
    if (routing.smsKeywordUsed) {
      trackEvent("inbound_sms_keyword_resolved", { keyword: routing.smsKeywordUsed });
    }

    const reservation = await reserveTwilioMessage(messageSid, routing.careCircleId);
    if (reservation.duplicate) {
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        routingStatus: routing.routingStatus,
        careCircleId: routing.careCircleId,
        familyMemberId: routing.familyMemberId,
        persistenceStatus: "duplicate",
        errorCode: "duplicate_message_sid",
        errorMessage: "Duplicate Twilio MessageSid ignored.",
        requestId,
      });
      return twiml("CircleRelay already logged this update.");
    }

    if (!reservation.reserved) {
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        routingStatus: routing.routingStatus,
        careCircleId: routing.careCircleId,
        familyMemberId: routing.familyMemberId,
        persistenceStatus: "failed",
        errorCode: "idempotency_reservation_failed",
        errorMessage: errorMessage(reservation.error),
        requestId,
      });
      return twiml("CircleRelay could not log this update right now. Please try again later.");
    }

    let parsedMessage;
    try {
      parsedMessage = parseCareMessage(routing.cleanedBody);
    } catch (error) {
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        routingStatus: routing.routingStatus,
        careCircleId: routing.careCircleId,
        familyMemberId: routing.familyMemberId,
        persistenceStatus: "not_attempted",
        errorCode: "parse_failed",
        errorMessage: errorMessage(error),
        requestId,
      });
      await markTwilioMessageProcessed(messageSid, "failed", routing.careCircleId);
      return twiml("CircleRelay could not log this update right now. Please try again later.");
    }

    try {
      await createLinkedRecords(parsedMessage, routing, body, "SMS Sender", from, "twilio_sms");
      trackEvent("inbound_sms_logged");

      if (parsedMessage.concernFlag) trackEvent("concern_flagged");
      if (parsedMessage.category === "medication") trackEvent("medication_confirmation_logged");
      if (parsedMessage.category === "task") trackEvent("task_created");
      if (parsedMessage.category === "appointment") trackEvent("appointment_created");
      if (parsedMessage.category === "supply") trackEvent("supply_created");
    } catch (error) {
      console.error("Failed to create linked records", error);
      await logSmsEvent({
        messageSid,
        fromPhone: from,
        toPhone: to,
        body,
        signatureValid,
        routingStatus: routing.routingStatus,
        careCircleId: routing.careCircleId,
        familyMemberId: routing.familyMemberId,
        parseCategory: parsedMessage.category,
        concernFlag: parsedMessage.concernFlag,
        persistenceStatus: "failed",
        errorCode: "persistence_failed",
        errorMessage: errorMessage(error),
        requestId,
      });
      await markTwilioMessageProcessed(messageSid, "failed", routing.careCircleId);
      return twiml("CircleRelay could not log this update right now. Please try again later.");
    }

    await markTwilioMessageProcessed(messageSid, "processed", routing.careCircleId);

    await logSmsEvent({
      messageSid,
      fromPhone: from,
      toPhone: to,
      body,
      signatureValid,
      routingStatus: routing.routingStatus,
      careCircleId: routing.careCircleId,
      familyMemberId: routing.familyMemberId,
      parseCategory: parsedMessage.category,
      concernFlag: parsedMessage.concernFlag,
      persistenceStatus: "success",
      requestId,
    });

    const responseText = parsedMessage.concernFlag
      ? "CircleRelay logged this as a concern for the family to review. If this is an emergency, call 911 or your local emergency number."
      : "CircleRelay logged your update.";

    return twiml(responseText);
  } catch (error) {
    console.error("Inbound SMS error:", error);
    await logSmsEvent({
      messageSid,
      fromPhone: from,
      toPhone: to,
      body,
      signatureValid,
      persistenceStatus: "failed",
      errorCode: "unexpected_route_error",
      errorMessage: errorMessage(error),
      requestId,
    });
    return twiml("CircleRelay could not log this update right now. Please try again later.");
  }
}
