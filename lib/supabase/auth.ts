import "server-only";

import { cookies, headers } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./admin";
import { getSupabaseServer } from "./server";

export class AuthError extends Error {
  status: number;

  constructor(message = "Authentication required", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function parseSupabaseCookie(value: string): string | null {
  try {
    if (value.startsWith("base64-")) {
      const decoded = Buffer.from(value.slice(7), "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      return parsed?.access_token || parsed?.[0] || null;
    }
    const parsed = JSON.parse(value);
    return parsed?.access_token || parsed?.[0] || null;
  } catch {
    return null;
  }
}

export async function getAccessTokenFromRequest(req?: Request): Promise<string | null> {
  const authorization = req ? req.headers.get("authorization") : (await headers()).get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  if (req) {
    const cookieHeader = req.headers.get("cookie") || "";
    for (const part of cookieHeader.split(";")) {
      const [rawName, ...rawValue] = part.trim().split("=");
      const value = decodeURIComponent(rawValue.join("="));
      if (rawName === "sb-access-token") return value;
      if (rawName?.startsWith("sb-") && rawName.endsWith("-auth-token")) {
        const token = parseSupabaseCookie(value);
        if (token) return token;
      }
    }
    return null;
  }

  const cookieStore = await cookies();
  const directCookie = cookieStore.get("sb-access-token")?.value;
  if (directCookie) return directCookie;

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
      const token = parseSupabaseCookie(cookie.value);
      if (token) return token;
    }
  }

  return null;
}

export async function getCurrentSupabaseUser(req?: Request): Promise<User | null> {
  const token = await getAccessTokenFromRequest(req);
  if (!token && req) return null;

  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireUser(req?: Request): Promise<User> {
  const user = await getCurrentSupabaseUser(req);
  if (!user) throw new AuthError();
  return user;
}

export async function requireCareCircleMembership(userId: string, careCircleId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const { data: circle, error: circleError } = await admin
    .from("care_circles")
    .select("id, owner_id")
    .eq("id", careCircleId)
    .maybeSingle();

  if (circleError || !circle) throw new AuthError("Care circle not found", 404);
  if (circle.owner_id === userId) return { role: "owner" as const, careCircleId };

  const { data: member, error: memberError } = await admin
    .from("family_members")
    .select("id, role, permission_level")
    .eq("care_circle_id", careCircleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError || !member) throw new AuthError("Care circle access denied", 403);
  return { role: "member" as const, careCircleId, familyMemberId: member.id };
}

export async function requireCareCircleOwner(userId: string, careCircleId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const { data, error } = await admin
    .from("care_circles")
    .select("id")
    .eq("id", careCircleId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error || !data) throw new AuthError("Care circle owner access required", 403);
  return { role: "owner" as const, careCircleId };
}

export async function requireRecordMembership(
  userId: string,
  table: "tasks" | "supplies" | "concerns" | "daily_summaries",
  recordId: string,
) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const { data, error } = await admin
    .from(table)
    .select("id, care_circle_id")
    .eq("id", recordId)
    .maybeSingle();

  if (error || !data?.care_circle_id) throw new AuthError("Record not found", 404);
  await requireCareCircleMembership(userId, data.care_circle_id);
  return data;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Request could not be completed" }, { status: 500 });
}
