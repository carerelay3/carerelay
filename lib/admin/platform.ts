import "server-only";

import { AuthError } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PlatformRole = "user" | "admin" | "founder";

export function normalizePlatformRole(role?: string | null): PlatformRole {
  if (role === "founder" || role === "admin") return role;
  return "user";
}

export function isPlatformAdminRole(role?: string | null) {
  const normalized = normalizePlatformRole(role);
  return normalized === "founder" || normalized === "admin";
}

export async function getPlatformRole(userId: string): Promise<PlatformRole> {
  const admin = getSupabaseAdmin();
  if (!admin) return "user";

  const { data, error } = await admin
    .from("profiles")
    .select("platform_role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return "user";
  return normalizePlatformRole(data.platform_role);
}

export async function requirePlatformAdmin(userId: string): Promise<PlatformRole> {
  const role = await getPlatformRole(userId);
  if (!isPlatformAdminRole(role)) {
    throw new AuthError("Platform admin access required", 403);
  }
  return role;
}

export async function requirePlatformFounder(userId: string): Promise<PlatformRole> {
  const role = await getPlatformRole(userId);
  if (role !== "founder") {
    throw new AuthError("Founder access required", 403);
  }
  return role;
}
