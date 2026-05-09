import { NextResponse } from "next/server";
import { generateDailySummary } from "@/lib/summaries/generateDailySummary";
import { generateWeeklySummary } from "@/lib/summaries/generateWeeklySummary";
import { summaryGenerateSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = summaryGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const careCircleId = parsed.data.careCircleId;
    const type = body.type || "daily";

    let result;
    if (type === "weekly") {
      result = await generateWeeklySummary(careCircleId);
    } else {
      result = await generateDailySummary(careCircleId);
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Summary generation error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
