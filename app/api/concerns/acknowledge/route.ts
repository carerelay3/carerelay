import { NextResponse } from "next/server";
import { acknowledgeConcern } from "@/lib/demo/data";
import { acknowledgeConcernSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = acknowledgeConcernSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const snapshot = acknowledgeConcern(parsed.data.concernId, parsed.data.by, parsed.data.note);
  if (!snapshot) {
    return NextResponse.json({ error: "Concern not found or already acknowledged." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}
