import { DashboardClient } from "@/components/DashboardClient";
import { relaySmsMode } from "@/lib/config";
import { getDemoSnapshot } from "@/lib/demo/data";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClient initialSnapshot={getDemoSnapshot()} initialMode={relaySmsMode()} />;
}
