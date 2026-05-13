import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireUser } from "@/lib/supabase/auth";

const privacyRequestTypes = [
  "export_my_data",
  "delete_my_account",
  "delete_care_circle_data",
  "billing_help",
  "other",
] as const;

const privacyRequestSchema = z.object({
  requestType: z.enum(privacyRequestTypes),
  details: z.string().trim().max(4000).optional().default(""),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = privacyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Choose a valid privacy request type." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Privacy request intake is not configured." }, { status: 503 });
    }

    const { data, error } = await admin
      .from("privacy_requests")
      .insert({
        user_id: user.id,
        request_type: parsed.data.requestType,
        details: parsed.data.details || null,
        status: "open",
      })
      .select("id, status, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: "Privacy request could not be created." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      request: data,
      message: "Privacy request received. CircleRelay will review it before any data action is taken.",
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
