import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCanManageMember, requireCareCircleOwner, requireUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  actionCode,
  apiError,
  getTeamMember,
  normalizeTeamRole,
} from "@/lib/team/server";

const transferOwnerSchema = z.object({
  careCircleId: z.uuid(),
  memberId: z.uuid(),
  confirmation: z.literal("TRANSFER"),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = transferOwnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "validation_failed", error: "Type TRANSFER to confirm owner transfer.", details: parsed.error.flatten() },
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
    assertCanManageMember(access.role, "member", "transfer_owner");

    const target = await getTeamMember(parsed.data.memberId, parsed.data.careCircleId);
    if (!target.user_id) {
      return NextResponse.json(
        { code: "target_user_missing", error: "Ownership can only be transferred to a signed-in team member." },
        { status: 400 },
      );
    }

    const targetRole = normalizeTeamRole(target.role, target.permission_level);
    if (targetRole === "owner") {
      return NextResponse.json(
        { code: "already_owner", error: "This team member is already an owner." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { error: circleError } = await admin
      .from("care_circles")
      .update({ owner_id: target.user_id, updated_at: now })
      .eq("id", parsed.data.careCircleId);

    if (circleError) {
      return NextResponse.json(
        { code: "owner_transfer_failed", error: "Could not transfer care circle ownership." },
        { status: 500 },
      );
    }

    const { error: targetError } = await admin
      .from("family_members")
      .update({ role: "owner", permission_level: "admin", status: "active", updated_at: now })
      .eq("id", parsed.data.memberId)
      .eq("care_circle_id", parsed.data.careCircleId);

    if (targetError) {
      return NextResponse.json(
        { code: "owner_transfer_failed", error: "Ownership changed, but the new owner role could not be saved." },
        { status: 500 },
      );
    }

    await admin
      .from("family_members")
      .update({ role: "admin", permission_level: "admin", updated_at: now })
      .eq("care_circle_id", parsed.data.careCircleId)
      .eq("user_id", user.id)
      .neq("id", parsed.data.memberId);

    return NextResponse.json({ ok: true, ownerUserId: target.user_id });
  } catch (error) {
    return apiError(actionCode(error, "owner_transfer_failed"), error, "Could not transfer ownership.");
  }
}
