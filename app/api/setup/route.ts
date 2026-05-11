import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone/normalizePhone";
import { appConfig, hasSupabase } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AuthError, authErrorResponse, requireUser } from "@/lib/supabase/auth";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";
import { getPlanLimits } from "@/lib/stripe/getPlanLimits";

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
      return NextResponse.json(
        { code: "validation_failed", error: "Setup details are invalid.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const members = parsed.data.members.map((member) => ({
      ...member,
      phoneNormalized: normalizePhone(member.phone),
    }));
    if (members.some((member) => !member.phoneNormalized)) {
      return NextResponse.json(
        { code: "validation_failed", error: "Each invited family member needs a valid phone number." },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    if (hasSupabase()) {
      const user = await requireUser(req);
      if (!admin) {
        return NextResponse.json(
          { code: "service_role_missing", error: "Live setup needs the Supabase service role key on the server." },
          { status: 503 },
        );
      }

      const currentPlan = await getCurrentUserPlan(user.id);
      const planLimits = getPlanLimits(currentPlan.planId);
      const { data: existingCircles, error: existingCirclesError } = await admin
        .from("care_circles")
        .select("id")
        .eq("owner_id", user.id);

      if (existingCirclesError) {
        return NextResponse.json(
          { code: "care_circle_insert_failed", error: "Could not check your existing care circles." },
          { status: 500 },
        );
      }

      if ((existingCircles || []).length >= planLimits.maxCareCircles) {
        return NextResponse.json(
          { code: "plan_limit_reached", error: "Your current plan has reached its care circle limit." },
          { status: 403 },
        );
      }

      if (members.length + 1 > planLimits.maxFamilyMembers) {
        return NextResponse.json(
          { code: "plan_limit_reached", error: `Your current plan allows up to ${planLimits.maxFamilyMembers} family member${planLimits.maxFamilyMembers === 1 ? "" : "s"} in this care circle.` },
          { status: 403 },
        );
      }

      const { error: profileError } = await admin.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email || "CareRelay user",
        updated_at: new Date().toISOString(),
      });
      if (profileError) {
        return NextResponse.json(
          { code: "profile_upsert_failed", error: "Could not create your profile record." },
          { status: 500 },
        );
      }

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
        return NextResponse.json(
          { code: "care_circle_insert_failed", error: "Could not create your care circle." },
          { status: 500 },
        );
      }

      const { error: recipientError } = await admin.from("care_recipients").insert({
        care_circle_id: circle.id,
        first_name: parsed.data.firstName,
      });
      if (recipientError) {
        return NextResponse.json(
          { code: "care_recipient_insert_failed", error: "Care circle was created, but the care recipient could not be added." },
          { status: 500 },
        );
      }

      const { error: ownerMemberError } = await admin.from("family_members").insert({
        care_circle_id: circle.id,
        user_id: user.id,
        name: user.user_metadata?.full_name || user.email || "Owner",
        phone: null,
        phone_normalized: null,
        role: "owner",
        invite_status: "joined",
        permission_level: "admin",
      });
      if (ownerMemberError) {
        return NextResponse.json(
          { code: "owner_member_insert_failed", error: "Care circle was created, but your owner membership could not be added." },
          { status: 500 },
        );
      }

      if (members.length > 0) {
        const { error: invitedMemberError } = await admin.from("family_members").insert(
          members.map((member) => ({
            care_circle_id: circle.id,
            name: member.name,
            phone: member.phone,
            phone_normalized: member.phoneNormalized,
            role: "member",
            invite_status: "invited",
            permission_level: "contributor",
          })),
        );
        if (invitedMemberError) {
          return NextResponse.json(
            { code: "invited_member_insert_failed", error: "Care circle was created, but invited family members could not be added." },
            { status: 500 },
          );
        }
      }

      return NextResponse.json({
        mode: "live-ready",
        planId: currentPlan.planId,
        billingStatus: currentPlan.status,
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
    if (error instanceof AuthError) {
      return NextResponse.json({ code: "auth_missing", error: error.message }, { status: error.status });
    }
    return authErrorResponse(error);
  }
}
