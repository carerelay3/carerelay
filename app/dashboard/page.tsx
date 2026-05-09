import { DashboardClient } from "@/components/DashboardClient";
import { relaySmsMode } from "@/lib/config";
import { getDemoSnapshot } from "@/lib/demo/data";
import { getDashboardDataForCircle } from "@/lib/db/dashboardRecords";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  let snapshot = getDemoSnapshot();
  let mode = relaySmsMode();

  if (supabase) {
    snapshot = await getDashboardDataForCircle();
  }

  return <DashboardClient initialSnapshot={snapshot} initialMode={mode} />;
}
