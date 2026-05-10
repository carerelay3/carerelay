import Link from "next/link";
import { BillingSettings } from "@/components/BillingSettings";
import { hasSupabase } from "@/lib/config";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

const demoCurrentPeriodEnd = "2026-06-08T00:00:00.000Z";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!hasSupabase()) {
    return (
      <main className="page-shell py-16">
        <div className="product-card mx-auto max-w-2xl p-8 text-center">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Live settings are not configured</h1>
          <p className="mt-4">
            Add Supabase environment variables to manage live account settings. Demo mode remains available.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-sage">Try the Demo</Link>
            <Link href="/pricing" className="btn btn-soft">View Pricing</Link>
          </div>
        </div>
      </main>
    );
  }

  const user = await getCurrentSupabaseUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="mb-8">
        <p className="section-kicker">Account</p>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
        <p className="mt-2">Signed in as {user.email || "CareRelay user"}.</p>
      </div>

      <BillingSettings
        planId="demo"
        status="trialing"
        cancelAtPeriodEnd={false}
        currentPeriodEnd={demoCurrentPeriodEnd}
        maxFamilyMembers={3}
        currentFamilyMembers={1}
      />
    </main>
  );
}
