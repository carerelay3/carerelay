import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCanManageMember, requireCareCircleAdminOrOwner, requireUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { actionCode, apiError, getCareCircleOwnerId, getTeamMember, normalizeTeamRole } from "@/lib/team/server";

const removeMemberSchema = z.object({
  careCircleId: z.uuid(),
  memberId: z.uuid(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = removeMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "validation_failed", error: "Remove request is invalid.", details: parsed.error.flatten() },
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
    const target = await getTeamMember(parsed.data.memberId, parsed.data.careCircleId);
    const targetRole = normalizeTeamRole(target.role, target.permission_level);
    assertCanManageMember(access.role, targetRole, "remove");

    if (targetRole === "owner") {
      const { count, error: ownerCountError } = await admin
        .from("family_members")
        .select("id", { count: "exact", head: true })
        .eq("care_circle_id", parsed.data.careCircleId)
        .eq("role", "owner")
        .neq("status", "removed");

      if (ownerCountError) {
        return NextResponse.json(
          { code: "owner_check_failed", error: "Could not verify owner safety for this care circle." },
          { status: 500 },
        );
      }
      if ((count || 0) <= 1) {
        return NextResponse.json(
          { code: "last_owner_blocked", error: "Transfer ownership before removing the only owner." },
          { status: 403 },
        );
      }

      const currentOwnerId = await getCareCircleOwnerId(parsed.data.careCircleId);
      if (target.user_id === currentOwnerId) {
        return NextResponse.json(
          { code: "owner_transfer_required", error: "Transfer ownership before removing the current owner." },
          { status: 403 },
        );
      }
    }

    const { error } = await admin
      .from("family_members")
      .update({
        status: "removed",
        invite_status: "opted_out",
        removed_at: new Date().toISOString(),
        user_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.memberId)
      .eq("care_circle_id", parsed.data.careCircleId);

    if (error) {
      return NextResponse.json(
        { code: "member_remove_failed", error: "Could not remove this team member." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(actionCode(error, "member_remove_failed"), error, "Could not remove this team member.");
  }
}
