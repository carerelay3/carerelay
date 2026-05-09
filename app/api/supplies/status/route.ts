import { NextResponse } from "next/server";
import { updateSupplyStatus } from "@/lib/demo/data";
import { updateSupplyStatusSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireRecordMembership, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = updateSupplyStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (admin && !appConfig.demoMode) {
      const user = await requireUser(req);
      await requireRecordMembership(user.id, "supplies", parsed.data.supplyId);
      const { error } = await admin
        .from("supplies")
        .update({
          status: parsed.data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.supplyId);
      if (error) return NextResponse.json({ error: "Supply could not be updated." }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const snapshot = updateSupplyStatus(parsed.data.supplyId, parsed.data.status, parsed.data.by);
    if (!snapshot) {
      return NextResponse.json({ error: "Supply not found." }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (error) {
    return authErrorResponse(error);
  }
}
