import { getSupabaseServer } from "../supabase/server";
import { getDemoSnapshot } from "../demo/data";
import { DemoSnapshot } from "../types";

export async function getDashboardDataForCircle(careCircleId?: string): Promise<DemoSnapshot> {
  const supabase = getSupabaseServer();
  if (!supabase) return getDemoSnapshot();

  let targetId = careCircleId;

  if (!targetId) {
    // RLS protects this, so it strictly fetches an authorized care circle.
    const { data: circles } = await supabase.from("care_circles").select("id").limit(1);
    if (circles && circles.length > 0) {
      targetId = circles[0].id;
    }
  }

  // If auth fails or no matching circle exists, safely fallback to the local mock data
  if (!targetId) return getDemoSnapshot();

  const [
    { data: messages },
    { data: tasks },
    { data: appts },
    { data: supplies },
    { data: concerns },
    { data: summaries }
  ] = await Promise.all([
    supabase.from("inbound_messages").select("*").eq("care_circle_id", targetId).order("created_at", { ascending: false }).limit(50),
    supabase.from("tasks").select("*").eq("care_circle_id", targetId).order("created_at", { ascending: false }),
    supabase.from("appointments").select("*").eq("care_circle_id", targetId).order("appointment_at", { ascending: true }),
    supabase.from("supplies").select("*").eq("care_circle_id", targetId),
    supabase.from("concerns").select("*").eq("care_circle_id", targetId),
    supabase.from("daily_summaries").select("*").eq("care_circle_id", targetId).order("summary_date", { ascending: false }).limit(1)
  ]);

  return {
    messages: (messages || []).map(m => ({
      id: m.id,
      sender: m.sender_name || m.sender_phone || "Unknown",
      fromPhone: m.sender_phone || "",
      toPhone: "",
      body: m.raw_body,
      createdAt: m.created_at,
      category: m.category as any,
      confidence: m.confidence || 0,
      concernFlag: m.concern_flag || false,
    })),
    tasks: (tasks || []).map(t => ({ id: t.id, title: t.title, status: t.status as any, createdAt: t.created_at })),
    appointments: (appts || []).map(a => ({
      id: a.id,
      title: a.title,
      at: a.appointment_at || new Date().toISOString(),
      transportationConfirmed: false,
    })),
    supplies: (supplies || []).map(s => ({ id: s.id, item: s.title, status: s.status as any })),
    concerns: (concerns || []).map(c => ({
      id: c.id, text: c.title + (c.details ? " - " + c.details : ""), acknowledged: c.status !== "open", createdAt: c.created_at
    })),
    dailySummary: summaries && summaries.length > 0 ? summaries[0].summary_text : undefined,
    careCircleId: targetId
  };
}