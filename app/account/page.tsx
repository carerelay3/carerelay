import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/AccountProfileForm";
import { hasSupabase } from "@/lib/config";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";

export const dynamic = "force-dynamic";

type ProfileRow = {
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  timezone?: string | null;
  created_at?: string | null;
};

type CircleAccess = {
  id: string;
  name: string;
  role: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

async function getProfile(userId: string): Promise<ProfileRow | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("profiles")
    .select("email, full_name, phone, timezone, created_at")
    .eq("id", userId)
    .maybeSingle();

  return data || null;
}

async function getCircleAccess(userId: string): Promise<CircleAccess[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data: owned } = await admin
    .from("care_circles")
    .select("id, name")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  const { data: memberships } = await admin
    .from("family_members")
    .select("care_circle_id, role, permission_level, status")
    .eq("user_id", userId)
    .neq("status", "removed");

  const ownedCircles = ((owned || []) as Array<{ id: string; name: string }>).map((circle) => ({
    id: circle.id,
    name: circle.name,
    role: "owner",
  }));

  const memberCircleIds = Array.from(
    new Set(
      ((memberships || []) as Array<{ care_circle_id?: string | null }>)
        .map((membership) => membership.care_circle_id)
        .filter((id): id is string => Boolean(id) && !ownedCircles.some((circle) => circle.id === id)),
    ),
  );

  if (memberCircleIds.length === 0) return ownedCircles;

  const { data: memberCircles } = await admin
    .from("care_circles")
    .select("id, name")
    .in("id", memberCircleIds);

  const circleNameById = new Map(
    ((memberCircles || []) as Array<{ id: string; name: string }>).map((circle) => [circle.id, circle.name]),
  );

  const memberAccess = ((memberships || []) as Array<{
    care_circle_id?: string | null;
    role?: string | null;
    permission_level?: string | null;
  }>)
    .filter((membership) => membership.care_circle_id && circleNameById.has(membership.care_circle_id))
    .map((membership) => ({
      id: membership.care_circle_id!,
      name: circleNameById.get(membership.care_circle_id!) || "Care circle",
      role: membership.role || membership.permission_level || "member",
    }));

  return [...ownedCircles, ...memberAccess];
}

export default async function AccountPage() {
  if (!hasSupabase()) {
    redirect("/sign-in");
  }

  const user = await getCurrentSupabaseUser();
  if (!user) {
    redirect("/sign-in");
  }

  const [profile, plan, circles] = await Promise.all([
    getProfile(user.id),
    getCurrentUserPlan(user.id),
    getCircleAccess(user.id),
  ]);

  const email = profile?.email || user.email || "Unavailable";
  const fullName = profile?.full_name || user.user_metadata?.full_name || "";
  const phone = profile?.phone || "";
  const timezone = profile?.timezone || "";
  const createdAt = profile?.created_at || user.created_at;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="section-kicker">Account</p>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Profile</h1>
        <p className="mt-2">Manage the account details tied to your CareRelay sign-in.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="product-card space-y-5 p-6">
          <div>
            <p className="section-kicker">Signed in</p>
            <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>{email}</h2>
          </div>

          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>Current plan</dt>
              <dd className="mt-1 font-semibold capitalize" style={{ color: "var(--text)" }}>{plan.planId.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>Account created</dt>
              <dd className="mt-1" style={{ color: "var(--text-secondary)" }}>{formatDate(createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>Phone</dt>
              <dd className="mt-1" style={{ color: "var(--text-secondary)" }}>{phone || "Not added"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>Timezone</dt>
              <dd className="mt-1" style={{ color: "var(--text-secondary)" }}>{timezone || "Not added"}</dd>
            </div>
          </dl>
        </section>

        <AccountProfileForm initialFullName={fullName} initialPhone={phone} initialTimezone={timezone} />
      </div>

      <section className="product-card mt-6 p-6">
        <div className="mb-4">
          <p className="section-kicker">Care circles</p>
          <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>Your access</h2>
        </div>

        {circles.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {circles.map((circle) => (
              <div key={`${circle.id}-${circle.role}`} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.55)" }}>
                <p className="font-semibold" style={{ color: "var(--text)" }}>{circle.name}</p>
                <p className="mt-1 text-sm capitalize" style={{ color: "var(--text-muted)" }}>{circle.role}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No care circle access found yet.</p>
        )}
      </section>
    </main>
  );
}
