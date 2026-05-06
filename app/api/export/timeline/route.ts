import { NextResponse } from "next/server";
import { exportTimeline } from "@/lib/demo/data";
import { exportTimelineSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = exportTimelineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = exportTimeline(parsed.data.format, parsed.data.fromDate, parsed.data.toDate);
  return NextResponse.json(result);
}
