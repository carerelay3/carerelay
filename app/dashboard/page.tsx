import { DashboardClient } from "@/components/DashboardClient";
import { relaySmsMode } from "@/lib/config";
import { getDemoSnapshot } from "@/lib/demo/data";
import { getDashboardSnapshotForUser } from "@/lib/supabase/dashboardRecords";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { DemoSnapshot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  let snapshot: DemoSnapshot = getDemoSnapshot();
  const mode = relaySmsMode();

  if (supabase && mode === "live") {
    snapshot = await getDashboardSnapshotForUser();
  }

  return <DashboardClient initialSnapshot={snapshot} initialMode={mode} />;
}
