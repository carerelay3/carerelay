import { NextResponse } from "next/server";
import { parseMessageSchema } from "@/lib/validation/schemas";
import { parseCareMessage } from "@/lib/parser/careMessageParser";

export async function POST(req: Request) {
  const data = await req.json().catch(() => ({}));
  const parsed = parseMessageSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid message";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ result: parseCareMessage(parsed.data.message) });
}
