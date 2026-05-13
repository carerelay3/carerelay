import Link from "next/link";
import { BillingSettings } from "@/components/BillingSettings";
import { appConfig, hasSupabase } from "@/lib/config";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSelectedCareCircleForUser } from "@/lib/supabase/careCircleSelection";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";
import { getPlanLimits } from "@/lib/stripe/getPlanLimits";
import { redirect } from "next/navigation";
import { CareCircleSwitcher } from "@/components/CareCircleSwitcher";
import { DedicatedFamilyNumberComingSoon, PushNotificationsComingSoon } from "@/components/MobileFeatureScaffolds";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams?: Promise<{ careCircleId?: string }>;
};

type SettingsCardProps = {
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

function SettingsCard({ title, body, href, cta }: SettingsCardProps) {
  return (
    <section className="product-card p-5">
      <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{title}</h2>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{body}</p>
      {href && cta && (
        <Link href={href} className="btn btn-soft mt-4 text-sm">
          {cta}
        </Link>
      )}
    </section>
  );
}

export default async function SettingsPage({ searchParams }: SettingsPageProps = {}) {
  if (!hasSupabase()) {
    return (
      <main className="page-shell py-16">
        <div className="product-card mx-auto max-w-2xl p-8 text-center">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Live settings are not configured</h1>
          <p className="mt-4">
            Add Supabase environment variables to manage live account settings. Demo mode remains available.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-sage">Try the demo</Link>
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

  const currentPlan = await getCurrentUserPlan(user.id);
  const planLimits = getPlanLimits(currentPlan.planId);
  const admin = getSupabaseAdmin();
  const params = searchParams ? await searchParams : {};
  const { circles, selectedCircle } = await getSelectedCareCircleForUser(user.id, params.careCircleId);

  let currentFamilyMembers = 1;
  let stripeCustomerId: string | null = null;
  if (admin) {
    const [{ data: subscription }] = await Promise.all([
      admin
        .from("billing_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .not("stripe_customer_id", "is", null)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
    ]);

    stripeCustomerId = subscription?.stripe_customer_id || null;
    if (selectedCircle?.id) {
      const { count } = await admin
        .from("family_members")
        .select("id", { count: "exact", head: true })
        .eq("care_circle_id", selectedCircle.id)
        .neq("status", "removed");
      currentFamilyMembers = count || 0;
    }
  }

  const portalAvailable = Boolean(appConfig.stripeConfigured && stripeCustomerId);
  const portalUnavailableReason = !appConfig.stripeConfigured
    ? "Billing portal is not configured yet. Stripe server keys are required before customers can manage billing."
    : !admin
    ? "Billing portal lookup needs server configuration before it can be used."
    : !stripeCustomerId
      ? "No Stripe customer is connected to this account yet. Upgrade a plan or contact support for billing help."
      : undefined;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="section-kicker">Account</p>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
        <p className="mt-2">Signed in as {user.email || "CircleRelay user"}.</p>
      </div>

      {selectedCircle ? (
        <section className="product-card mb-6 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">Selected care circle</p>
            <h2 className="mt-2 text-xl font-bold" style={{ color: "var(--text)" }}>{selectedCircle.name}</h2>
          </div>
          <CareCircleSwitcher circles={circles} selectedCareCircleId={selectedCircle.id} />
        </section>
      ) : (
        <section className="product-card mb-6 p-6 text-center">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Create your first care circle</h2>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>Settings become useful after setup creates your first live care circle.</p>
          <Link href="/setup" className="btn btn-sage mt-5">Start setup</Link>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SettingsCard title="Account" body="Update your profile, phone number, timezone, and account details." href={selectedCircle ? `/account?careCircleId=${selectedCircle.id}` : "/account"} cta="Open account" />
        <SettingsCard title="Care circle" body="Create or review your live care circle setup from dashboard and setup." href={selectedCircle ? `/dashboard?careCircleId=${selectedCircle.id}` : "/dashboard"} cta="Open dashboard" />
        <SettingsCard title="Team" body="Add, remove, deactivate, and manage family member roles." href={selectedCircle ? `/team?careCircleId=${selectedCircle.id}` : "/team"} cta="Manage team" />
        <SettingsCard title="Safety and legal" body="Review CircleRelay privacy and terms. CircleRelay Care Mode is coordination software, not medical advice or emergency monitoring." href="/terms" cta="View terms" />
        <SettingsCard title="Support" body="Get help with account access, billing, SMS routing, invites, and access removal." href="/support" cta="Contact support" />
      </div>

      <BillingSettings
        planId={currentPlan.planId}
        status={currentPlan.status}
        cancelAtPeriodEnd={currentPlan.cancelAtPeriodEnd}
        currentPeriodEnd={currentPlan.currentPeriodEnd || undefined}
        maxFamilyMembers={planLimits.maxFamilyMembers}
        currentFamilyMembers={currentFamilyMembers}
        portalAvailable={portalAvailable}
        portalUnavailableReason={portalUnavailableReason}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <PushNotificationsComingSoon />
        <DedicatedFamilyNumberComingSoon />
      </div>
    </main>
  );
}
