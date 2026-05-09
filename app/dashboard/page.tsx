import { DashboardClient } from "@/components/DashboardClient";
import { relaySmsMode } from "@/lib/config";
import { getDemoSnapshot } from "@/lib/demo/data";
import { getDashboardDataForCircle } from "@/supabase/migrations/dashboardRecords";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { CareCategory, DemoConcern, DemoMessage, DemoSnapshot, DemoTask } from "@/lib/types";

export const dynamic = "force-dynamic";

type DashboardRecord = {
  id?: string;
  sender_name?: string;
  from_name?: string;
  from_phone?: string;
  to_phone?: string;
  body?: string;
  message?: string;
  text?: string;
  category?: string;
  confidence?: number;
  concern_flag?: boolean;
  status?: DemoTask["status"];
  title?: string;
  description?: string;
  assigned_to?: string;
  created_at?: string;
  acknowledged?: boolean;
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  let snapshot: DemoSnapshot = getDemoSnapshot();
  const mode = relaySmsMode();

  if (supabase) {
    const dashboardData = await getDashboardDataForCircle();
    snapshot = {
      ...snapshot,
      messages: dashboardData.recentActivity.map((item: DashboardRecord): DemoMessage => ({
        id: item.id || `msg-${item.created_at || "live"}`,
        sender: item.sender_name || item.from_name || "SMS Sender",
        fromPhone: item.from_phone || "",
        toPhone: item.to_phone || "",
        body: item.body || item.message || "",
        createdAt: item.created_at || new Date().toISOString(),
        category: (item.category || "general_update") as CareCategory,
        confidence: item.confidence || 0,
        concernFlag: !!item.concern_flag,
      })),
      tasks: dashboardData.upcomingMedications.map((item: DashboardRecord): DemoTask => ({
        id: item.id || `task-${item.created_at || "live"}`,
        title: item.title || item.description || "Open task",
        status: item.status || "open",
        assignedTo: item.assigned_to,
        createdAt: item.created_at,
      })),
      concerns: dashboardData.concerns.map((item: DashboardRecord): DemoConcern => ({
        id: item.id || `concern-${item.created_at || "live"}`,
        text: item.body || item.message || item.text || "Concern flagged",
        createdAt: item.created_at || new Date().toISOString(),
        acknowledged: !!item.acknowledged,
      })),
    };
  }

  return <DashboardClient initialSnapshot={snapshot} initialMode={mode} />;
}
