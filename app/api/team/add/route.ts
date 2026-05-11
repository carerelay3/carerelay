import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCanManageMember, requireCareCircleAdminOrOwner, requireUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  actionCode,
  apiError,
  assertDuplicatePhoneAvailable,
  assertFamilyMemberPlanCapacity,
  normalizeOptionalPhone,
  roleToPermissionLevel,
  teamRoleSchema,
} from "@/lib/team/server";

const addMemberSchema = z.object({
  careCircleId: z.uuid(),
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.email().optional().or(z.literal("")).nullable(),
  role: teamRoleSchema.default("member"),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "validation_failed", error: "Team member details are invalid.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { code: "service_role_missing", error: "Team management needs the Supabase service role key on the server." },
        { status: 503 },
      );
    }

    const access = await requireCareCircleAdminOrOwner(user.id, parsed.data.careCircleId);
    assertCanManageMember(access.role, parsed.data.role, "add");
    await assertFamilyMemberPlanCapacity(parsed.data.careCircleId);

    const { phone, phoneNormalized } = normalizeOptionalPhone(parsed.data.phone);
    await assertDuplicatePhoneAvailable(parsed.data.careCircleId, phoneNormalized);

    const status = parsed.data.email ? "invited" : "active";
    const { data, error } = await admin
      .from("family_members")
      .insert({
        care_circle_id: parsed.data.careCircleId,
        name: parsed.data.name,
        phone,
        phone_normalized: phoneNormalized,
        email: parsed.data.email || null,
        role: parsed.data.role,
        status,
        invite_status: status === "invited" ? "invited" : "not_invited",
        permission_level: roleToPermissionLevel(parsed.data.role),
        invited_by: user.id,
      })
      .select("id, name, phone, email, role, status")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { code: "member_insert_failed", error: "Could not add this team member." },
        { status: 500 },
      );
    }

    return NextResponse.json({ member: data });
  } catch (error) {
    return apiError(actionCode(error, "member_insert_failed"), error, "Could not add this team member.");
  }
}
