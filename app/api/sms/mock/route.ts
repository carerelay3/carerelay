import { NextResponse } from "next/server";
import { addDemoMessage, demoStore, getDemoSnapshot } from "@/lib/demo/data";
import { smsMockSchema } from "@/lib/validation/schemas";
import { resolveCareCircleFromSender } from "@/lib/routing/resolveCareCircleFromSender";
import { parseCareMessage } from "@/lib/parser/careMessageParser";
import { createLinkedRecords } from "@/lib/messages/createLinkedRecords";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = smsMockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { careCircleId, fromName, fromPhone, body: rawBody } = parsed.data;

    if (careCircleId !== demoStore.careCircleId) {
      return NextResponse.json(
        {
          error: "Mock SMS is demo-only. Use the Twilio inbound webhook for live care circles.",
        },
        { status: 403 },
      );
    }

    // Simulate routing
    const routing = await resolveCareCircleFromSender(
      fromPhone, 
      rawBody, 
      undefined, 
      { isDemo: true, careCircleId: demoStore.careCircleId }
    );

    // Parse message using the cleaned body (without the multi-circle keyword if any)
    const parsedMessage = parseCareMessage(routing.cleanedBody);

    // Linked records creation
    let dbResult = null;
    const canCreateRecords =
      routing.routingStatus === "matched_single_circle" ||
      routing.routingStatus === "matched_multiple_keyword_resolved";

    if (canCreateRecords) {
      try {
        dbResult = await createLinkedRecords(
          parsedMessage,
          routing,
          rawBody,
          fromName,
          fromPhone
        );
      } catch (e) {
        console.error("Error creating linked records:", e);
        // Do not crash
      }
    }

    // In demo mode or if it's the demo circle, update the local in-memory store so the UI updates
    if (routing.demoMode) {
      addDemoMessage({
        sender: fromName,
        fromPhone: fromPhone,
        body: routing.cleanedBody,
        category: parsedMessage.category,
        concernFlag: parsedMessage.concernFlag,
      });
    }

    let displayMessage = "CareRelay logged your update.";
    if (parsedMessage.concernFlag) {
      displayMessage = "CareRelay logged this as a concern for the family to review. If this is an emergency, call 911 or your local emergency number.";
    }
    if (routing.routingStatus === "matched_multiple_needs_keyword" || routing.routingStatus === "unknown_sender" || routing.routingStatus === "invalid_phone") {
      displayMessage = routing.safeReply || displayMessage;
    }

    return NextResponse.json({
      success: true,
      category: parsedMessage.category,
      displayMessage,
      routingStatus: routing.routingStatus,
      dashboardUpdateData: dbResult,
      snapshot: getDemoSnapshot(),
    });
  } catch (error) {
    console.error("Error in mock SMS endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
