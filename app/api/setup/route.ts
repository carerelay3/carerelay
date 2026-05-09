import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone/normalizePhone";
import { appConfig, hasSupabase } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireUser } from "@/lib/supabase/auth";

const setupSchema = z.object({
  firstName: z.string().min(1),
  keyword: z.string().min(2).max(24),
  sharedPhone: z.string().optional(),
  members: z
    .array(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(7),
      }),
    )
    .default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const members = parsed.data.members.map((member) => ({
      ...member,
      phoneNormalized: normalizePhone(member.phone),
    }));

    const admin = getSupabaseAdmin();
    if (hasSupabase()) {
      const user = await requireUser(req);
      if (!admin) {
        return NextResponse.json({ error: "Supabase service role is required for live setup." }, { status: 503 });
      }
      await admin.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email || "CareRelay user",
        updated_at: new Date().toISOString(),
      });

    const { data: circle, error: circleError } = await admin
      .from("care_circles")
      .insert({
        owner_id: user.id,
        name: `${parsed.data.firstName}'s Care Circle`,
        sms_keyword: parsed.data.keyword.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        shared_phone_number: parsed.data.sharedPhone || appConfig.twilioPhoneNumber || null,
        demo_mode: false,
      })
      .select("id")
      .single();

    if (circleError || !circle) {
      return NextResponse.json({ error: "Could not create care circle." }, { status: 500 });
    }

    await admin.from("care_recipients").insert({
      care_circle_id: circle.id,
      first_name: parsed.data.firstName,
    });

      await admin.from("family_members").insert({
        care_circle_id: circle.id,
        user_id: user.id,
        name: user.user_metadata?.full_name || user.email || "Owner",
        phone: null,
        phone_normalized: null,
        role: "owner",
        invite_status: "joined",
        permission_level: "admin",
      });

      const validMembers = members.filter((member) => member.phoneNormalized);
      if (validMembers.length > 0) {
      await admin.from("family_members").insert(
        validMembers.map((member) => ({
          care_circle_id: circle.id,
          name: member.name,
          phone: member.phone,
          phone_normalized: member.phoneNormalized,
          role: "member",
          invite_status: "invited",
          permission_level: "contributor",
        })),
      );
      }

    return NextResponse.json({
      mode: "live-ready",
      careCircleId: circle.id,
      recipientName: parsed.data.firstName,
      keyword: parsed.data.keyword.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      members,
      sharedPhone: parsed.data.sharedPhone || appConfig.twilioPhoneNumber || "+15559990000",
    });
  }

    return NextResponse.json({
      mode: "demo",
      careCircleId: "circle-demo-1",
      recipientName: parsed.data.firstName,
      keyword: parsed.data.keyword.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      members,
      sharedPhone: parsed.data.sharedPhone || appConfig.twilioPhoneNumber || "+15559990000",
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
