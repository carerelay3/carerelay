import { NextResponse } from "next/server";
import { summaryGenerateSchema } from "@/lib/validation/schemas";
import { generateDailySummary } from "@/lib/summaries/generateDailySummary";
import { createOpenAiSummary } from "@/lib/openai/createSummary";
import { demoStore } from "@/lib/demo/data";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = summaryGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fallback = await generateDailySummary({ careCircleId: parsed.data.careCircleId });
  let aiText: string | null = null;
  try {
    aiText = await createOpenAiSummary({
      notes: demoStore.messages.slice(0, 12).map((m) => `${m.sender}: ${m.body}`),
      concerns: fallback.concernsMentioned,
      context: `${demoStore.careCircleName} for ${demoStore.recipientName}`,
    });
  } catch {
    aiText = null;
  }
  return NextResponse.json({
    ...fallback,
    summaryText: aiText || fallback.summaryText,
    generatedBy: aiText ? "openai" : "fallback",
  });
}
