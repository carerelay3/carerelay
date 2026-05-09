import { NextResponse } from "next/server";
import { addHandoff, demoStore } from "@/lib/demo/data";
import { generateDailySummary } from "@/lib/summaries/generateDailySummary";
import { generateHandoffSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = generateHandoffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
}
