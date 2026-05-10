import { NextResponse } from "next/server";
import { addHandoff, demoStore } from "@/lib/demo/data";
import { generateDailySummary } from "@/lib/summaries/generateDailySummary";
import { generateHandoffSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";
import { authErrorResponse, requireCareCircleMembership, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = generateHandoffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (!appConfig.demoMode && parsed.data.careCircleId !== "circle-demo-1") {
      const user = await requireUser(req);
      await requireCareCircleMembership(user.id, parsed.data.careCircleId);
      return NextResponse.json({ error: "Live handoff generation is not enabled yet." }, { status: 501 });
    }

    const summary = await generateDailySummary(parsed.data.careCircleId);
    const lines = [
      `Daily Handoff - ${demoStore.careCircleName}`,
      "",
      "What happened today:",
      summary.summaryText,
      "",
      "Suggested family follow-up:",
      "- Confirm who is handling open tasks and review any flagged concerns together.",
      "",
      "CareRelay does not provide medical advice. For emergencies, call 911 or your local emergency number.",
    ];

    const handoffText = lines.join("\n");
    const snapshot = addHandoff(handoffText);

    return NextResponse.json({ snapshot, handoffText, summary });
  } catch (error) {
    return authErrorResponse(error);
  }
}
