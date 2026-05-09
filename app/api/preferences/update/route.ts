import { NextResponse } from "next/server";
import { updatePreferences } from "@/lib/demo/data";
import { updatePreferencesSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (!appConfig.demoMode) {
    return NextResponse.json({ error: "Live preference updates are not enabled yet." }, { status: 501 });
  }
  const snapshot = updatePreferences(parsed.data);
  return NextResponse.json({ snapshot });
}
