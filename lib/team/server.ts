import "server-only";

import { z } from "zod";
import { normalizePhone } from "@/lib/phone/normalizePhone";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";
import { getPlanLimits } from "@/lib/stripe/getPlanLimits";
import { AuthError, type CareCircleRole } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const teamRoleSchema = z.enum(["admin", "member"]);
export const teamMemberRoleSchema = z.enum(["owner", "admin", "member"]);

export type TeamMemberRole = z.infer<typeof teamMemberRoleSchema>;

export type TeamMemberRow = {
  id: string;
  care_circle_id: string;
  user_id?: string | null;
  name?: string | null;
  phone?: string | null;
  phone_normalized?: string | null;
  email?: string | null;
  role?: string | null;
  permission_level?: string | null;
  status?: string | null;
};

export function normalizeTeamRole(role?: string | null, permissionLevel?: string | null): TeamMemberRole {
  if (role === "owner") return "owner";
  if (role === "admin" || permissionLevel === "admin") return "admin";
  return "member";
}

export function roleToPermissionLevel(role: TeamMemberRole): "admin" | "contributor" {
  return role === "owner" || role === "admin" ? "admin" : "contributor";
}

export function memberStatus(status?: string | null, inviteStatus?: string | null): "active" | "invited" | "removed" {
  if (status === "removed" || inviteStatus === "opted_out") return "removed";
  if (status === "invited" || inviteStatus === "invited" || inviteStatus === "pending") return "invited";
  return "active";
}

export function normalizeOptionalPhone(phone?: string | null) {
  if (!phone?.trim()) return { phone: null, phoneNormalized: null };
  const phoneNormalized = normalizePhone(phone);
  if (!phoneNormalized) {
    throw new AuthError("Enter a valid phone number.", 400);
  }
  return { phone, phoneNormalized };
}

export async function getCareCircleOwnerId(careCircleId: string): Promise<string> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const { data, error } = await admin
    .from("care_circles")
    .select("owner_id")
    .eq("id", careCircleId)
    .maybeSingle();

  if (error || !data?.owner_id) throw new AuthError("Care circle not found", 404);
  return data.owner_id;
}

export async function getTeamMember(memberId: string, careCircleId: string): Promise<TeamMemberRow> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const { data, error } = await admin
    .from("family_members")
    .select("id, care_circle_id, user_id, name, phone, phone_normalized, email, role, permission_level, status")
    .eq("id", memberId)
    .eq("care_circle_id", careCircleId)
    .maybeSingle();

  if (error || !data || data.status === "removed") throw new AuthError("Team member not found", 404);
  return data;
}

export async function assertDuplicatePhoneAvailable(careCircleId: string, phoneNormalized: string | null) {
  if (!phoneNormalized) return;
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const { data, error } = await admin
    .from("family_members")
    .select("id")
    .eq("care_circle_id", careCircleId)
    .eq("phone_normalized", phoneNormalized)
    .neq("status", "removed")
    .limit(1)
    .maybeSingle();

  if (error) throw new AuthError("Could not check duplicate phone numbers.", 500);
  if (data) throw new AuthError("A team member with that phone number already exists in this care circle.", 409);
}

export async function assertFamilyMemberPlanCapacity(careCircleId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const ownerId = await getCareCircleOwnerId(careCircleId);
  const currentPlan = await getCurrentUserPlan(ownerId);
  const limits = getPlanLimits(currentPlan.planId);

  const { count, error } = await admin
    .from("family_members")
    .select("id", { count: "exact", head: true })
    .eq("care_circle_id", careCircleId)
    .neq("status", "removed");

  if (error) throw new AuthError("Could not check your plan limit.", 500);
  if ((count || 0) >= limits.maxFamilyMembers) {
    throw new AuthError(
      `Your current plan allows up to ${limits.maxFamilyMembers} family member${limits.maxFamilyMembers === 1 ? "" : "s"}. Upgrade to add more people.`,
      403,
    );
  }
}

export function apiError(code: string, error: unknown, fallback = "Request could not be completed") {
  if (error instanceof AuthError) {
    return Response.json({ code, error: error.message }, { status: error.status });
  }
  return Response.json({ code, error: fallback }, { status: 500 });
}

export function actionCode(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    if (error.status === 401) return "auth_missing";
    if (error.status === 403 && error.message.includes("Upgrade")) return "plan_limit_reached";
    if (error.status === 409) return "duplicate_phone";
    if (error.status === 503) return "service_role_missing";
    if (error.status === 400) return "validation_failed";
    return "permission_denied";
  }
  return fallback;
}

export function canClientManage(actorRole: CareCircleRole, targetRole: TeamMemberRole) {
  if (actorRole === "owner") return true;
  return actorRole === "admin" && targetRole === "member";
}
