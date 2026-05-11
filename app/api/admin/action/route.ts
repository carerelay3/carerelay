import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AuthError, authErrorResponse, requireUser } from "@/lib/supabase/auth";
import { requirePlatformAdmin, requirePlatformFounder } from "@/lib/admin/platform";

const adminActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_care_circle_owner"),
    userId: z.uuid(),
    careCircleId: z.uuid(),
  }),
  z.object({
    action: z.literal("set_care_circle_role"),
    memberId: z.uuid(),
    careCircleId: z.uuid(),
    role: z.enum(["admin", "member"]),
  }),
  z.object({
    action: z.literal("deactivate_member"),
    memberId: z.uuid(),
    careCircleId: z.uuid(),
  }),
  z.object({
    action: z.literal("set_platform_role"),
    userId: z.uuid(),
    platformRole: z.enum(["user", "admin"]),
  }),
]);

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const actorRole = await requirePlatformAdmin(user.id);
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { code: "service_role_missing", error: "Platform admin actions need the Supabase service role key on the server." },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = adminActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "validation_failed", error: "Admin action details are invalid.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.action === "set_platform_role") {
      await requirePlatformFounder(user.id);
      const { error } = await admin
        .from("profiles")
        .upsert({
          id: parsed.data.userId,
          platform_role: parsed.data.platformRole,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (error) {
        return NextResponse.json(
          { code: "platform_role_update_failed", error: "Could not update platform role." },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, actorRole });
    }

    if (parsed.data.action === "set_care_circle_owner") {
      const now = new Date().toISOString();
      const { error: circleError } = await admin
        .from("care_circles")
        .update({ owner_id: parsed.data.userId, updated_at: now })
        .eq("id", parsed.data.careCircleId);

      if (circleError) {
        return NextResponse.json(
          { code: "owner_update_failed", error: "Could not set care circle owner." },
          { status: 500 },
        );
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", parsed.data.userId)
        .maybeSingle();

      const ownerMembership = {
        care_circle_id: parsed.data.careCircleId,
        user_id: parsed.data.userId,
        name: profile?.full_name || profile?.email || "Owner",
        email: profile?.email || null,
        role: "owner",
        status: "active",
        invite_status: "joined",
        permission_level: "admin",
        updated_at: now,
      };

      const { data: existingMember } = await admin
        .from("family_members")
        .select("id")
        .eq("care_circle_id", parsed.data.careCircleId)
        .eq("user_id", parsed.data.userId)
        .maybeSingle();

      const { error: memberError } = existingMember?.id
        ? await admin
            .from("family_members")
            .update(ownerMembership)
            .eq("id", existingMember.id)
        : await admin
            .from("family_members")
            .insert(ownerMembership);

      if (memberError) {
        return NextResponse.json(
          { code: "owner_membership_update_failed", error: "Owner changed, but owner membership could not be updated." },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, actorRole });
    }

    if (parsed.data.action === "set_care_circle_role") {
      const { error } = await admin
        .from("family_members")
        .update({
          role: parsed.data.role,
          permission_level: parsed.data.role === "admin" ? "admin" : "contributor",
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.memberId)
        .eq("care_circle_id", parsed.data.careCircleId)
        .neq("role", "owner");

      if (error) {
        return NextResponse.json(
          { code: "role_update_failed", error: "Could not update care circle role." },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, actorRole });
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
      .eq("care_circle_id", parsed.data.careCircleId)
      .neq("role", "owner");

    if (error) {
      return NextResponse.json(
        { code: "member_deactivate_failed", error: "Could not deactivate this member." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, actorRole });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ code: error.status === 403 ? "permission_denied" : "auth_missing", error: error.message }, { status: error.status });
    }
    return authErrorResponse(error);
  }
}
