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

  const summary = await generateDailySummary({ careCircleId: parsed.data.careCircleId });

  // Build handoff text from summary sections
  const lines = [
    `Daily Handoff — ${demoStore.careCircleName}`,
    "",
    "What happened today:",
    ...summary.generalNotes.slice(0, 5).map((n) => `- ${n}`),
    summary.generalNotes.length === 0 ? "- No general updates today." : "",
    "",
    "Completed items:",
    summary.completed.length > 0 ? summary.completed.map((c) => `- ${c}`).join("\n") : "- None reported.",
    "",
    "Still open:",
    summary.openTasks.length > 0 ? summary.openTasks.map((t) => `- ${t}`).join("\n") : "- Nothing currently open.",
    "",
    "Supplies needed:",
    summary.suppliesNeeded.length > 0 ? summary.suppliesNeeded.map((s) => `- ${s}`).join("\n") : "- None reported.",
    "",
    "Appointments coming up:",
    summary.upcoming.length > 0 ? summary.upcoming.map((a) => `- ${a}`).join("\n") : "- None in the next period.",
    "",
    "Medication confirmations:",
    summary.medicationConfirmations.length > 0 ? summary.medicationConfirmations.map((m) => `- ${m}`).join("\n") : "- None logged.",
    "",
    "Concerns mentioned:",
    summary.concernsMentioned.length > 0
      ? summary.concernsMentioned.map((c) => `- ${c}`).join("\n")
      : "- No concerns mentioned.",
    "",
    "Suggested family follow-up:",
    summary.openTasks.length > 0 ? "- Confirm who is handling open tasks." : "- Nothing specific to follow up.",
    summary.concernsMentioned.length > 0 ? "- Review flagged concerns together." : "",
    "",
    "CareRelay does not provide medical advice. For emergencies, call 911 or your local emergency number.",
  ];

  const handoffText = lines.filter(Boolean).join("\n");
  const snapshot = addHandoff(handoffText);

  return NextResponse.json({ snapshot, handoffText, summary });
}
