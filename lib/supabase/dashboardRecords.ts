import "server-only";

import type {
  CareCategory,
  DemoAppointment,
  DemoConcern,
  DemoMember,
  DemoMessage,
  DemoSnapshot,
  DemoSupply,
  DemoTask,
} from "@/lib/types";
import { getCurrentSupabaseUser, requireCareCircleMembership } from "./auth";
import { getSupabaseAdmin } from "./admin";

type DbRecord = Record<string, unknown>;

const asString = (value: unknown, fallback = "") => (typeof value === "string" && value ? value : fallback);
const asCategory = (value: unknown): CareCategory =>
  ["medication", "appointment", "task", "supply", "concern", "general_update"].includes(String(value))
    ? (value as CareCategory)
    : "general_update";

function emptyLiveSnapshot(message: string): DemoSnapshot {
  return {
    careCircleId: undefined,
    careCircleName: "No care circle yet",
    recipientName: "Create a care circle",
    sharedPhone: "",
    members: [],
    messages: [],
    tasks: [],
    appointments: [],
    supplies: [],
    concerns: [],
    activity: [],
    handoffs: [],
    dailySummary: message,
  };
}

export async function getUserCareCircles(userId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data: owned } = await admin
    .from("care_circles")
    .select("id, name, owner_id, shared_phone_number, sms_keyword")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  const { data: memberships } = await admin
    .from("family_members")
    .select("care_circle_id, status, care_circles(id, name, owner_id, shared_phone_number, sms_keyword)")
    .eq("user_id", userId)
    .neq("status", "removed");

  const circles = new Map<string, DbRecord>();
  for (const circle of owned || []) circles.set(circle.id, circle);
  for (const membership of memberships || []) {
    const circle = Array.isArray(membership.care_circles) ? membership.care_circles[0] : membership.care_circles;
    if (circle?.id) circles.set(circle.id, circle);
  }
  return [...circles.values()];
}

export async function getCareCircleMessages(careCircleId: string): Promise<DemoMessage[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin
    .from("inbound_messages")
    .select("id, sender_name, sender_phone, raw_body, cleaned_body, category, confidence, concern_flag, created_at")
    .eq("care_circle_id", careCircleId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []).map((item) => ({
    id: item.id,
    sender: item.sender_name || "SMS Sender",
    fromPhone: item.sender_phone || "",
    toPhone: "",
    body: item.cleaned_body || item.raw_body || "",
    createdAt: item.created_at || new Date().toISOString(),
    category: asCategory(item.category),
    confidence: Number(item.confidence || 0),
    concernFlag: !!item.concern_flag,
  }));
}

export async function getTasks(careCircleId: string): Promise<DemoTask[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin
    .from("tasks")
    .select("id, title, status, assigned_to, created_at")
    .eq("care_circle_id", careCircleId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title || "Open task",
    status: item.status || "open",
    assignedTo: item.assigned_to || undefined,
    createdAt: item.created_at || undefined,
  }));
}

export async function getAppointments(careCircleId: string): Promise<DemoAppointment[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin
    .from("appointments")
    .select("id, title, appointment_at, created_at")
    .eq("care_circle_id", careCircleId)
    .order("appointment_at", { ascending: true, nullsFirst: false })
    .limit(50);

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title || "Appointment",
    at: item.appointment_at || item.created_at || new Date().toISOString(),
    transportationConfirmed: false,
  }));
}

export async function getSupplies(careCircleId: string): Promise<DemoSupply[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin
    .from("supplies")
    .select("id, title, item, status")
    .eq("care_circle_id", careCircleId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []).map((item) => ({
    id: item.id,
    item: item.title || item.item || "Supply needed",
    status: item.status || "needed",
  }));
}

export async function getMedicationLogs(careCircleId: string): Promise<DemoMessage[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin
    .from("medication_logs")
    .select("id, confirmation_text, given_by, logged_at, created_at")
    .eq("care_circle_id", careCircleId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []).map((item) => ({
    id: `med-${item.id}`,
    sender: item.given_by || "Family member",
    fromPhone: "",
    toPhone: "",
    body: item.confirmation_text || "Medication confirmation",
    createdAt: item.logged_at || item.created_at || new Date().toISOString(),
    category: "medication",
    confidence: 1,
    concernFlag: false,
  }));
}

export async function getConcerns(careCircleId: string): Promise<DemoConcern[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data } = await admin
    .from("concerns")
    .select("id, title, details, status, created_at")
    .eq("care_circle_id", careCircleId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data || []).map((item) => ({
    id: item.id,
    text: item.details || item.title || "Concern flagged for family review",
    createdAt: item.created_at || new Date().toISOString(),
    acknowledged: item.status === "acknowledged" || item.status === "closed",
  }));
}

export async function getLatestDailySummary(careCircleId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("daily_summaries")
    .select("summary_text")
    .eq("care_circle_id", careCircleId)
    .order("summary_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.summary_text || null;
}

export async function getDashboardSnapshotForUser(careCircleId?: string): Promise<DemoSnapshot> {
  const user = await getCurrentSupabaseUser();
  const admin = getSupabaseAdmin();

  if (!user || !admin) {
    return emptyLiveSnapshot("Sign in and create a care circle to load live dashboard records.");
  }

  const circles = await getUserCareCircles(user.id);
  const selectedCircle = careCircleId
    ? circles.find((circle) => asString(circle.id) === careCircleId)
    : circles[0];

  if (!selectedCircle?.id) {
    return emptyLiveSnapshot("Create a care circle to begin using live CareRelay records.");
  }

  const activeCircleId = asString(selectedCircle.id);
  await requireCareCircleMembership(user.id, activeCircleId);

  const [
    messages,
    medicationMessages,
    tasks,
    appointments,
    supplies,
    concerns,
    summary,
    profileResult,
    recipientResult,
    membersResult,
  ] = await Promise.all([
    getCareCircleMessages(activeCircleId),
    getMedicationLogs(activeCircleId),
    getTasks(activeCircleId),
    getAppointments(activeCircleId),
    getSupplies(activeCircleId),
    getConcerns(activeCircleId),
    getLatestDailySummary(activeCircleId),
    admin.from("profiles").select("id, full_name, email").eq("id", user.id).maybeSingle(),
    admin.from("care_recipients").select("first_name").eq("care_circle_id", activeCircleId).limit(1).maybeSingle(),
    admin
      .from("family_members")
      .select("id, name, role, phone, invite_status, permission_level, status, created_at")
      .eq("care_circle_id", activeCircleId)
      .neq("status", "removed")
      .order("created_at", { ascending: true }),
  ]);

  const members: DemoMember[] = (membersResult.data || []).map((member) => ({
    id: asString(member.id),
    name: asString(member.name, "Family member"),
    role: asString(member.role, "member"),
    phone: asString(member.phone),
    permissionLevel: asString(member.permission_level, "contributor") as DemoMember["permissionLevel"],
    inviteStatus: asString(member.invite_status, "joined") as DemoMember["inviteStatus"],
    joinedAt: asString(member.created_at) || undefined,
  }));

  return {
    careCircleId: activeCircleId,
    careCircleName: asString(selectedCircle.name, "Care Circle"),
    recipientName: asString(recipientResult.data?.first_name, asString(selectedCircle.name, "Loved one")),
    sharedPhone: asString(selectedCircle.shared_phone_number),
    profile: {
      id: user.id,
      fullName: asString(profileResult.data?.full_name, user.user_metadata?.full_name || user.email || ""),
      email: asString(profileResult.data?.email, user.email || ""),
    },
    members,
    messages: [...messages, ...medicationMessages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    tasks,
    appointments,
    supplies,
    concerns,
    activity: [],
    handoffs: [],
    dailySummary: summary || undefined,
  };
}
