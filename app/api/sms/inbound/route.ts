import { resolveCareCircleFromSender } from "@/lib/routing/resolveCareCircleFromSender";
import { parseCareMessage } from "@/lib/parser/careMessageParser";
import { createLinkedRecords } from "@/lib/messages/createLinkedRecords";
import { appConfig } from "@/lib/config";
import * as twilio from "twilio";
import { generateTwiML } from "@/lib/twilio/twiml";
import { trackEvent } from "@/lib/analytics/track";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let from = "";
    let to = "";
    let body = "";
    let messageSid = "";
    let accountSid = "";

    // Parse payload
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      from = String(form.get("From") || "");
      to = String(form.get("To") || "");
      body = String(form.get("Body") || "");
      messageSid = String(form.get("MessageSid") || "");
      accountSid = String(form.get("AccountSid") || "");

      // Validate Twilio Signature if configured
      const twilioAuthToken = appConfig.twilioAuthToken;
      if (twilioAuthToken) {
        const signature = req.headers.get("x-twilio-signature");
        const url = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/api/sms/inbound";
        const params: Record<string, string> = {};
        for (const [key, value] of form.entries()) {
          if (key !== "AccountSid" || value) params[key] = String(value); // Twilio includes all form keys in validation
        }

        if (!signature) {
          return new Response(generateTwiML("CareRelay could not log this update right now. Please try again later."), {
            status: 403,
            headers: { "Content-Type": "text/xml" },
          });
        }

        const isValid = twilio.validateRequest(
          twilioAuthToken,
          signature,
          url,
          params
        );
        if (!isValid) {
          return new Response(generateTwiML("CareRelay could not log this update right now. Please try again later."), {
            status: 403,
            headers: { "Content-Type": "text/xml" },
          });
        }
      }
    } else {
      const json = await req.json().catch(() => ({}));
      from = json.From || json.from || "";
      to = json.To || json.to || "";
      body = json.Body || json.body || "";
    }

    if (!from || !body.trim()) {
      return new Response(generateTwiML("CareRelay could not log an empty update. Please send a note, task, appointment, supply need, medication confirmation, or concern."), {
        headers: { "Content-Type": "text/xml" },
        status: 200,
      });
    }

    trackEvent("inbound_sms_received", { hasMessageSid: !!messageSid, hasAccountSid: !!accountSid });

    // 1. Route message
    const routing = await resolveCareCircleFromSender(from, body, to);
    
    if (routing.routingStatus === "unknown_sender" || routing.routingStatus === "invalid_phone") {
      trackEvent("inbound_sms_unknown_sender");
      return new Response(generateTwiML("CareRelay could not match this phone number to a care circle. Please ask the care circle owner to invite this number."), { headers: { "Content-Type": "text/xml" } });
    }

    if (routing.routingStatus === "matched_multiple_needs_keyword") {
      trackEvent("inbound_sms_multiple_circle_keyword_needed");
      return new Response(generateTwiML("You’re linked to more than one CareRelay circle. Reply with the care circle keyword before your update, like GRANDMA Meds: took night pills at 8pm."), { headers: { "Content-Type": "text/xml" } });
    }

    trackEvent("inbound_sms_routed", { status: routing.routingStatus });
    if (routing.smsKeywordUsed) {
      trackEvent("inbound_sms_keyword_resolved", { keyword: routing.smsKeywordUsed });
    }

    // 2. Parse Message
    const parsedMessage = parseCareMessage(routing.cleanedBody);
    
    // 3. Persist securely using "twilio_sms" source flag
    try {
      await createLinkedRecords(parsedMessage, routing, body, "SMS Sender", from, "twilio_sms");
      trackEvent("inbound_sms_logged");
      
      if (parsedMessage.concernFlag) trackEvent("concern_flagged");
      if (parsedMessage.category === "medication") trackEvent("medication_confirmation_logged");
      if (parsedMessage.category === "task") trackEvent("task_created");
      if (parsedMessage.category === "appointment") trackEvent("appointment_created");
      if (parsedMessage.category === "supply") trackEvent("supply_created");
      
    } catch (err) {
      console.error("Failed to create linked records", err);
      return new Response(generateTwiML("CareRelay could not log this update right now. Please try again later."), { headers: { "Content-Type": "text/xml" } });
    }

    // 4. Return Safe TwiML
    const responseText = parsedMessage.concernFlag 
      ? "CareRelay logged this as a concern for the family to review. If this is an emergency, call 911 or your local emergency number." 
      : "CareRelay logged your update.";

    return new Response(generateTwiML(responseText), { headers: { "Content-Type": "text/xml" } });

  } catch (error) {
    console.error("Inbound SMS error:", error);
    return new Response(generateTwiML("CareRelay could not log this update right now. Please try again later."), {
      headers: { "Content-Type": "text/xml" },
      status: 200, // Return 200 so Twilio doesn't retry endlessly on our error
    });
  }
}
