import { DashboardClient } from "@/components/DashboardClient";
import { relaySmsMode } from "@/lib/config";
import { getDemoSnapshot } from "@/lib/demo/data";
import { getDashboardDataForCircle } from "@/supabase/migrations/dashboardRecords";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { CareCategory, DemoConcern, DemoMessage, DemoSnapshot, DemoTask } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  let snapshot: DemoSnapshot = getDemoSnapshot();
  let mode = relaySmsMode();

  if (supabase) {
    const dashboardData = await getDashboardDataForCircle();
    snapshot = {
      ...snapshot,
      messages: dashboardData.recentActivity.map((item: any): DemoMessage => ({
        id: item.id,
        sender: item.sender_name || item.from_name || "SMS Sender",
        fromPhone: item.from_phone || "",
        toPhone: item.to_phone || "",
        body: item.body || item.message || "",
        createdAt: item.created_at || new Date().toISOString(),
        category: (item.category || "general_update") as CareCategory,
        confidence: item.confidence || 0,
        concernFlag: !!item.concern_flag,
      })),
      tasks: dashboardData.upcomingMedications.map((item: any): DemoTask => ({
        id: item.id,
        title: item.title || item.description || "Open task",
        status: item.status || "open",
        assignedTo: item.assigned_to,
        createdAt: item.created_at,
      })),
      concerns: dashboardData.concerns.map((item: any): DemoConcern => ({
        id: item.id,
        text: item.body || item.message || item.text || "Concern flagged",
        createdAt: item.created_at || new Date().toISOString(),
        acknowledged: !!item.acknowledged,
      })),
    };
  }

  return <DashboardClient initialSnapshot={snapshot} initialMode={mode} />;
}
