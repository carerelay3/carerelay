import { DashboardClient } from "@/components/DashboardClient";
import { appConfig, hasSupabase, relaySmsMode } from "@/lib/config";
import { getDashboardSnapshotForUser } from "@/lib/supabase/dashboardRecords";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import type { DemoSnapshot } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasSupabase()) {
    return (
      <main className="page-shell py-16">
        <div className="product-card mx-auto max-w-2xl p-8 text-center">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Live dashboard is not configured</h1>
          <p className="mt-4">
            Add Supabase environment variables to enable live care circle records. The public demo still works without credentials.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-sage">Try the Demo</Link>
            <Link href="/sign-in" className="btn btn-soft">Sign in</Link>
          </div>
        </div>
      </main>
    );
  }

  const user = await getCurrentSupabaseUser();
  if (!user) {
    redirect("/sign-in");
  }

  const snapshot: DemoSnapshot = await getDashboardSnapshotForUser();
  return <DashboardClient initialSnapshot={snapshot} initialMode={appConfig.demoMode ? "demo" : relaySmsMode()} />;
}
