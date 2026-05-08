import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/utils/phone";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, keyword, members, sharedPhone } = body;
    
    const admin = getSupabaseAdmin();
    if (!admin) {
      // Graceful demo mode fallback if Supabase lacks configuration
      return NextResponse.json({ success: true, mode: "demo" });
    }

    // 1. Create Care Circle (Allows unauthenticated creation for demo/setup seeding initially)
    const { data: circle, error: circleErr } = await admin
      .from("care_circles")
      .insert({
        name: `${firstName}'s Care Circle`,
        sms_keyword: keyword?.toUpperCase() || null,
        shared_phone_number: sharedPhone,
        demo_mode: false,
      })
      .select("id")
      .single();

    if (circleErr || !circle) throw new Error("Failed to create care circle");

    // 2. Create Care Recipient
    await admin.from("care_recipients").insert({
      care_circle_id: circle.id,
      first_name: firstName,
    });

    // 3. Add Family Members securely
    if (members && members.length > 0) {
      const inserts = members.map((m: any) => ({
        care_circle_id: circle.id,
        name: m.name,
        phone: m.phone,
        phone_normalized: normalizePhone(m.phone) || m.phone,
        role: "member",
      }));
      await admin.from("family_members").insert(inserts);
    }

    return NextResponse.json({ success: true, careCircleId: circle.id });
  } catch (err: any) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}