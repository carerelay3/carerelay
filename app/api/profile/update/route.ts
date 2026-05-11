import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone/normalizePhone";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireUser } from "@/lib/supabase/auth";

const profileUpdateSchema = z.object({
  fullName: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  timezone: z.string().trim().max(80).optional().default(""),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Profile fields are invalid." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Profile updates are not configured." }, { status: 503 });
    }

    const phone = parsed.data.phone;
    const phoneNormalized = phone ? normalizePhone(phone) : null;
    if (phone && !phoneNormalized) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    const update = {
      id: user.id,
      email: user.email,
      full_name: parsed.data.fullName || null,
      phone: phone || null,
      phone_normalized: phoneNormalized,
      timezone: parsed.data.timezone || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin.from("profiles").upsert(update, { onConflict: "id" });
    if (error) {
      return NextResponse.json({ error: "Profile could not be updated." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      profile: {
        fullName: update.full_name,
        phone: update.phone,
        phoneNormalized: update.phone_normalized,
        timezone: update.timezone,
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
