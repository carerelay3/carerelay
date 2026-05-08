import { getSupabaseAdmin } from "../supabase/admin";
import { getDemoSnapshot } from "../demo/data";
import { createOpenAiSummary } from "../openai/createSummary";
import { isSummarySafe } from "./summarySafety";
import { trackEvent } from "../analytics/track";

export async function generateWeeklySummary(careCircleId?: string) {
  // 1. Load Data
  const admin = getSupabaseAdmin();
  
  let updatesCount = 0;
  let medsCount = 0;
  let apptsCount = 0;
  let tasksCount = 0;
  let suppliesCount = 0;
  let concernsCount = 0;
  
  if (!admin || !careCircleId) {
    // Demo mode
    const demo = getDemoSnapshot();
    updatesCount = demo.messages.length;
    medsCount = demo.messages.filter(m => m.category === 'medication').length;
    apptsCount = demo.appointments.length;
    tasksCount = demo.tasks.filter(t => t.status === 'open').length;
    suppliesCount = demo.supplies.filter(s => s.status === 'needed').length;
    concernsCount = demo.concerns.length;
  } else {
    // Real DB - Last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weekStr = lastWeek.toISOString();
    
    const [
      { count: msgs },
      { count: meds },
      { count: appts },
      { count: tasks },
      { count: supplies },
      { count: concerns }
    ] = await Promise.all([
      admin.from("inbound_messages").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", weekStr),
      admin.from("medication_logs").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", weekStr),
      admin.from("appointments").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", weekStr),
      admin.from("tasks").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("status", "open"),
      admin.from("supplies").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("status", "needed"),
      admin.from("concerns").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", weekStr)
    ]);

    updatesCount = msgs || 0;
    medsCount = meds || 0;
    apptsCount = appts || 0;
    tasksCount = tasks || 0;
    suppliesCount = supplies || 0;
    concernsCount = concerns || 0;
  }

  // 2. Deterministic Fallback
  const deterministicText = `Over the past 7 days, the family logged ${updatesCount} total updates. We organized ${medsCount} medication confirmations and ${apptsCount} appointments. There are currently ${tasksCount} open tasks and ${suppliesCount} supply items needed. ${concernsCount} concerns were flagged for family review. This summary is based only on family-reported updates. CareRelay does not provide medical advice or emergency monitoring.`;

  let finalSummary = deterministicText;
  let source = "weekly_deterministic";

  // 3. OpenAI Enhancement
  const promptData = `Weekly Updates: ${updatesCount}. Meds: ${medsCount}. Appts: ${apptsCount}. Tasks open: ${tasksCount}. Supplies: ${suppliesCount}. Concerns: ${concernsCount}.`;
  
  const aiSummary = await createOpenAiSummary(promptData);
  
  if (aiSummary && isSummarySafe(aiSummary)) {
    finalSummary = aiSummary;
    source = "weekly_openai";
    trackEvent("summary_openai_used");
  } else {
    trackEvent(aiSummary ? "summary_safety_filter_triggered" : "summary_fallback_used");
  }

  trackEvent("weekly_summary_generated");

  return {
    summaryText: finalSummary,
    source
  };
}