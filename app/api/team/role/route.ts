import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCanManageMember, requireCareCircleOwner, requireUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  actionCode,
  apiError,
  getTeamMember,
  normalizeTeamRole,
  roleToPermissionLevel,
  teamRoleSchema,
} from "@/lib/team/server";

const roleSchema = z.object({
  careCircleId: z.uuid(),
  memberId: z.uuid(),
  role: teamRoleSchema,
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "validation_failed", error: "Role request is invalid.", details: parsed.error.flatten() },
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

    const access = await requireCareCircleOwner(user.id, parsed.data.careCircleId);
    const target = await getTeamMember(parsed.data.memberId, parsed.data.careCircleId);
    const targetRole = normalizeTeamRole(target.role, target.permission_level);
    if (targetRole === "owner") {
      return NextResponse.json(
        { code: "owner_role_change_blocked", error: "Use owner transfer instead of changing an owner's role directly." },
        { status: 403 },
      );
    }
    assertCanManageMember(access.role, parsed.data.role, "change_role");

    const { data, error } = await admin
      .from("family_members")
      .update({
        role: parsed.data.role,
        permission_level: roleToPermissionLevel(parsed.data.role),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.memberId)
      .eq("care_circle_id", parsed.data.careCircleId)
      .select("id, role, permission_level")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { code: "member_role_failed", error: "Could not update this team member's role." },
        { status: 500 },
      );
    }

    return NextResponse.json({ member: data });
  } catch (error) {
    return apiError(actionCode(error, "member_role_failed"), error, "Could not update this team member's role.");
  }
}
