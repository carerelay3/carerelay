import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminActionButton } from "@/components/AdminActionButton";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import { requirePlatformAdmin, type PlatformRole } from "@/lib/admin/platform";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ email?: string }>;
};

type CountRow = { count: number | null; error: unknown };

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function safeCount(table: string): Promise<number> {
  const admin = getSupabaseAdmin();
  if (!admin) return 0;
  const result = await admin.from(table).select("id", { count: "exact", head: true }) as CountRow;
  return result.error ? 0 : result.count || 0;
}

async function getAdminUserByEmail(email?: string) {
  if (!email) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, phone, timezone, platform_role, created_at")
    .ilike("email", email)
    .maybeSingle();

  if (!profile?.id) return null;

  const [{ data: subscriptions }, { data: ownedCircles }, { data: memberships }] = await Promise.all([
    admin
      .from("billing_subscriptions")
      .select("plan_id, status, stripe_customer_id, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    admin
      .from("care_circles")
      .select("id, name, created_at")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false }),
    admin
      .from("family_members")
      .select("id, care_circle_id, name, email, role, status, permission_level, care_circles(id, name)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile,
    plan: subscriptions?.[0] || null,
    ownedCircles: ownedCircles || [],
    memberships: memberships || [],
  };
}

async function getRecentRows() {
  const admin = getSupabaseAdmin();
  if (!admin) return { profiles: [], circles: [], subscriptions: [] };

  const [profiles, circles, subscriptions] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, platform_role, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("care_circles")
      .select("id, name, owner_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("billing_subscriptions")
      .select("plan_id, status")
      .limit(500),
  ]);

  return {
    profiles: profiles.data || [],
    circles: circles.data || [],
    subscriptions: subscriptions.error ? [] : subscriptions.data || [],
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps = {}) {
  const user = await getCurrentSupabaseUser();
  if (!user) redirect("/sign-in");

  let platformRole: PlatformRole;
  try {
    platformRole = await requirePlatformAdmin(user.id);
  } catch {
    redirect("/dashboard");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12">
        <section className="product-card p-8 text-center">
          <p className="section-kicker">Admin</p>
          <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Admin tools need server configuration</h1>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>Set the Supabase service role key on the server to use platform admin tools.</p>
        </section>
      </main>
    );
  }

  const params = searchParams ? await searchParams : {};
  const lookupEmail = params.email?.trim();
  const [totalUsers, totalCareCircles, totalFamilyMembers, recent, lookup] = await Promise.all([
    safeCount("profiles"),
    safeCount("care_circles"),
    safeCount("family_members"),
    getRecentRows(),
    getAdminUserByEmail(lookupEmail),
  ]);

  const subscriptionsByPlan = (recent.subscriptions as Array<{ plan_id?: string | null }>).reduce<Record<string, number>>((acc, sub) => {
    const plan = sub.plan_id || "unknown";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="section-kicker">Platform admin</p>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>CareRelay operations</h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          Signed in as {platformRole}. No hard-delete user tools are exposed here.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Total users", totalUsers],
          ["Care circles", totalCareCircles],
          ["Family members", totalFamilyMembers],
          ["Subscription rows", recent.subscriptions.length],
        ].map(([label, value]) => (
          <div key={String(label)} className="product-card p-5">
            <p className="section-kicker">{label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
          </div>
        ))}
      </section>

      <section className="product-card mt-6 p-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Subscriptions by plan</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(subscriptionsByPlan).length > 0 ? Object.entries(subscriptionsByPlan).map(([plan, count]) => (
            <span key={plan} className="rounded-full px-3 py-2 text-sm font-semibold" style={{ background: "var(--primary-soft)", color: "var(--text-secondary)" }}>
              {plan}: {count}
            </span>
          )) : <p style={{ color: "var(--text-muted)" }}>No subscription rows found.</p>}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="product-card p-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Recent signups</h2>
          <div className="mt-4 space-y-3">
            {(recent.profiles as Array<{ id: string; email?: string | null; full_name?: string | null; platform_role?: string | null; created_at?: string | null }>).map((profile) => (
              <div key={profile.id} className="rounded-2xl border p-3" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold" style={{ color: "var(--text)" }}>{profile.email || profile.full_name || profile.id}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{profile.platform_role || "user"} · {formatDate(profile.created_at)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="product-card p-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Recent care circles</h2>
          <div className="mt-4 space-y-3">
            {(recent.circles as Array<{ id: string; name?: string | null; owner_id?: string | null; created_at?: string | null }>).map((circle) => (
              <div key={circle.id} className="rounded-2xl border p-3" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold" style={{ color: "var(--text)" }}>{circle.name || circle.id}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Owner {circle.owner_id || "missing"} · {formatDate(circle.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="product-card mt-6 p-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Lookup user by email</h2>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row" action="/admin">
          <input name="email" type="email" defaultValue={lookupEmail || ""} placeholder="founder@example.com" className="input-glass flex-1" required />
          <button type="submit" className="btn btn-sage">View user</button>
        </form>
      </section>

      {lookupEmail && !lookup && (
        <section className="product-card mt-6 p-6">
          <p style={{ color: "var(--text-muted)" }}>No profile found for {lookupEmail}.</p>
        </section>
      )}

      {lookup && (
        <section className="product-card mt-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="section-kicker">User details</p>
              <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>{asString(lookup.profile.email, lookup.profile.id)}</h2>
              <p className="mt-1" style={{ color: "var(--text-muted)" }}>
                {asString(lookup.profile.full_name, "No name")} · role {asString(lookup.profile.platform_role, "user")} · created {formatDate(lookup.profile.created_at)}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Plan: {asString(lookup.plan?.plan_id, "free")} · billing {asString(lookup.plan?.status, "inactive")}
              </p>
            </div>
            {platformRole === "founder" && (
              <div className="flex flex-wrap gap-2">
                <AdminActionButton
                  label="Make platform admin"
                  confirmText="Make this user a platform admin?"
                  payload={{ action: "set_platform_role", userId: lookup.profile.id, platformRole: "admin" }}
                />
                <AdminActionButton
                  label="Demote to user"
                  confirmText="Remove this user's platform admin role?"
                  payload={{ action: "set_platform_role", userId: lookup.profile.id, platformRole: "user" }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="font-bold" style={{ color: "var(--text)" }}>Owned care circles</h3>
              <div className="mt-3 space-y-3">
                {(lookup.ownedCircles as Array<{ id: string; name?: string | null; created_at?: string | null }>).map((circle) => (
                  <div key={circle.id} className="rounded-2xl border p-3" style={{ borderColor: "var(--border)" }}>
                    <p className="font-semibold" style={{ color: "var(--text)" }}>{circle.name || circle.id}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{circle.id} · {formatDate(circle.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold" style={{ color: "var(--text)" }}>Care circle roles</h3>
              <div className="mt-3 space-y-3">
                {(lookup.memberships as Array<{ id: string; care_circle_id: string; role?: string | null; status?: string | null; care_circles?: { name?: string | null } | Array<{ name?: string | null }> }>).map((membership) => {
                  const circle = Array.isArray(membership.care_circles) ? membership.care_circles[0] : membership.care_circles;
                  const circleName = circle?.name || membership.care_circle_id;
                  const isOwner = membership.role === "owner";
                  return (
                    <div key={membership.id} className="rounded-2xl border p-3" style={{ borderColor: "var(--border)" }}>
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{circleName}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {membership.role || "member"} · {membership.status || "active"} · {membership.care_circle_id}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <AdminActionButton
                          label="Set as owner"
                          confirmText={`Set ${lookup.profile.email || "this user"} as owner of ${circleName}?`}
                          payload={{ action: "set_care_circle_owner", userId: lookup.profile.id, careCircleId: membership.care_circle_id }}
                        />
                        <AdminActionButton
                          label="Promote admin"
                          confirmText={`Promote this user to admin for ${circleName}?`}
                          payload={{ action: "set_care_circle_role", memberId: membership.id, careCircleId: membership.care_circle_id, role: "admin" }}
                          disabled={isOwner}
                        />
                        <AdminActionButton
                          label="Demote member"
                          confirmText={`Demote this user to member for ${circleName}?`}
                          payload={{ action: "set_care_circle_role", memberId: membership.id, careCircleId: membership.care_circle_id, role: "member" }}
                          disabled={isOwner}
                        />
                        <AdminActionButton
                          label="Deactivate member"
                          confirmText={`Deactivate this user's access to ${circleName}?`}
                          payload={{ action: "deactivate_member", memberId: membership.id, careCircleId: membership.care_circle_id }}
                          disabled={isOwner}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8">
        <Link href="/settings" className="btn btn-soft">Back to settings</Link>
      </div>
    </main>
  );
}
