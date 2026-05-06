import { NextResponse } from "next/server";
import { updateSupplyStatus } from "@/lib/demo/data";
import { updateSupplyStatusSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = updateSupplyStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const snapshot = updateSupplyStatus(parsed.data.supplyId, parsed.data.status, parsed.data.by);
  if (!snapshot) {
    return NextResponse.json({ error: "Supply not found." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}
