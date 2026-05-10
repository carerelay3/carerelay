import { NextResponse } from "next/server";
import { reviewHandoff } from "@/lib/demo/data";
import { reviewHandoffSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = reviewHandoffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (!appConfig.demoMode) {
    return NextResponse.json({ error: "Live handoff review is not enabled yet." }, { status: 501 });
  }
  const snapshot = reviewHandoff(parsed.data.handoffId);
  if (!snapshot) {
    return NextResponse.json({ error: "Handoff not found." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}
