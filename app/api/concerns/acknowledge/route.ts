import { NextResponse } from "next/server";
import { acknowledgeConcern } from "@/lib/demo/data";
import { acknowledgeConcernSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireRecordMembership, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = acknowledgeConcernSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (admin && !appConfig.demoMode) {
      const user = await requireUser(req);
      await requireRecordMembership(user.id, "concerns", parsed.data.concernId);
      const { error } = await admin
        .from("concerns")
        .update({
          status: "acknowledged",
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.concernId);
      if (error) return NextResponse.json({ error: "Concern could not be acknowledged." }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const snapshot = acknowledgeConcern(parsed.data.concernId, parsed.data.by, parsed.data.note);
    if (!snapshot) {
      return NextResponse.json({ error: "Concern not found or already acknowledged." }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (error) {
    return authErrorResponse(error);
  }
}
