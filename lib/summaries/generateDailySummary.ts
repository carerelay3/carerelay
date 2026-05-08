import { getSupabaseAdmin } from "../supabase/admin";
import { getDemoSnapshot } from "../demo/data";
import { createOpenAiSummary } from "../openai/createSummary";
import { isSummarySafe } from "./summarySafety";
import { trackEvent } from "../analytics/track";

export async function generateDailySummary(careCircleId?: string) {
  // 1. Load Data
  const admin = getSupabaseAdmin();
  
  let updatesCount = 0;
  let medsCount = 0;
  let apptsCount = 0;
  let tasksCount = 0;
  let suppliesCount = 0;
  let concernsCount = 0;
  
  if (!admin || !careCircleId) {
    // Demo mode fallback
    const demo = getDemoSnapshot();
    updatesCount = demo.messages.length;
    medsCount = demo.messages.filter(m => m.category === 'medication').length;
    apptsCount = demo.appointments.length;
    tasksCount = demo.tasks.filter(t => t.status === 'open').length;
    suppliesCount = demo.supplies.filter(s => s.status === 'needed').length;
    concernsCount = demo.concerns.length;
  } else {
    // Real DB - Today's records
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString();
    
    const [
      { count: msgs },
      { count: meds },
      { count: appts },
      { count: tasks },
      { count: supplies },
      { count: concerns }
    ] = await Promise.all([
      admin.from("inbound_messages").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", todayStr),
      admin.from("medication_logs").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", todayStr),
      admin.from("appointments").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", todayStr),
      admin.from("tasks").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("status", "open"),
      admin.from("supplies").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("status", "needed"),
      admin.from("concerns").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).gte("created_at", todayStr)
    ]);

    updatesCount = msgs || 0;
    medsCount = meds || 0;
    apptsCount = appts || 0;
    tasksCount = tasks || 0;
    suppliesCount = supplies || 0;
    concernsCount = concerns || 0;
  }

  // 2. Deterministic Fallback
  const deterministicText = `Today, the family logged ${updatesCount} updates. There were ${medsCount} medication confirmations, ${apptsCount} upcoming appointments, ${tasksCount} open tasks, and ${suppliesCount} supply needs. ${concernsCount} concerns were flagged for family review. This summary is based only on family-reported updates. CareRelay does not provide medical advice or emergency monitoring.`;

  let finalSummary = deterministicText;
  let source = "deterministic";

  // 3. OpenAI Enhancement
  const promptData = `Updates: ${updatesCount}. Meds: ${medsCount}. Appts: ${apptsCount}. Tasks open: ${tasksCount}. Supplies: ${suppliesCount}. Concerns: ${concernsCount}.`;
  
  const aiSummary = await createOpenAiSummary(promptData);
  
  if (aiSummary) {
    if (isSummarySafe(aiSummary)) {
      finalSummary = aiSummary;
      source = "openai";
      trackEvent("summary_openai_used");
    } else {
      trackEvent("summary_safety_filter_triggered");
      trackEvent("summary_fallback_used");
    }
  } else {
    trackEvent("summary_fallback_used");
  }

  trackEvent("daily_summary_generated");

  // 4. Save to DB
  if (admin && careCircleId) {
    const todayDate = new Date().toISOString().split("T")[0];
    await admin.from("daily_summaries").upsert({
      care_circle_id: careCircleId,
      summary_date: todayDate,
      summary_text: finalSummary,
      source: source
    }, { onConflict: "care_circle_id, summary_date" });
  }

  return {
    summaryText: finalSummary,
    source
  };
}