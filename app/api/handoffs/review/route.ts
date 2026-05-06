import { NextResponse } from "next/server";
import { reviewHandoff } from "@/lib/demo/data";
import { reviewHandoffSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = reviewHandoffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const snapshot = reviewHandoff(parsed.data.handoffId);
  if (!snapshot) {
    return NextResponse.json({ error: "Handoff not found." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}
