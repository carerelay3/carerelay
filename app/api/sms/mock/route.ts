import { NextResponse } from "next/server";
import { addDemoMessage, demoStore } from "@/lib/demo/data";
import { smsMockSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = smsMockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.careCircleId !== demoStore.careCircleId) {
    return NextResponse.json({ error: "Unknown care circle." }, { status: 404 });
  }
  const result = addDemoMessage({
    sender: parsed.data.fromName,
    fromPhone: parsed.data.fromPhone,
    body: parsed.data.body,
  });
  return NextResponse.json(result);
}
