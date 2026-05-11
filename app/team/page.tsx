import Link from "next/link";
import { redirect } from "next/navigation";
import { TeamManagement, type TeamMemberView } from "@/components/TeamManagement";
import { hasSupabase } from "@/lib/config";
import { getCurrentSupabaseUser, getUserCareCircleRole } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserCareCircles } from "@/lib/supabase/dashboardRecords";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";
import { getPlanLimits } from "@/lib/stripe/getPlanLimits";
import { memberStatus, normalizeTeamRole } from "@/lib/team/server";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  searchParams?: Promise<{ careCircleId?: string }>;
};

type CircleRow = {
  id?: string | null;
  name?: string | null;
  owner_id?: string | null;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

export default async function TeamPage({ searchParams }: TeamPageProps = {}) {
  if (!hasSupabase()) {
    redirect("/sign-in");
  }

  const user = await getCurrentSupabaseUser();
  if (!user) {
    redirect("/sign-in");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <section className="product-card p-8 text-center">
          <p className="section-kicker">Team</p>
          <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Team management is not configured</h1>
          <p className="mt-3" style={{ color: "var(--text-muted)" }}>
            Add the Supabase service role key on the server to manage live care circle members.
          </p>
        </section>
      </main>
    );
  }

  const params = searchParams ? await searchParams : {};
  const circles = (await getUserCareCircles(user.id)) as CircleRow[];
  const selectedCircle = params.careCircleId
    ? circles.find((circle) => circle.id === params.careCircleId)
    : circles[0];

  if (!selectedCircle?.id) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <section className="product-card p-8 text-center">
          <p className="section-kicker">Team</p>
          <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Create a care circle first</h1>
          <p className="mt-3" style={{ color: "var(--text-muted)" }}>
            Team management becomes available after setup creates your live care circle.
          </p>
          <Link href="/setup" className="btn btn-sage mt-6">Start setup</Link>
        </section>
      </main>
    );
  }

  const careCircleId = selectedCircle.id;
  const actorRole = await getUserCareCircleRole(user.id, careCircleId);
  if (!actorRole) {
    redirect("/dashboard");
  }

  const { data: circleDetails } = await admin
    .from("care_circles")
    .select("id, name, owner_id")
    .eq("id", careCircleId)
    .maybeSingle();

  const ownerUserId = asString(circleDetails?.owner_id, asString(selectedCircle.owner_id, user.id));
  const [plan, membersResult] = await Promise.all([
    getCurrentUserPlan(ownerUserId),
    admin
      .from("family_members")
      .select("id, user_id, name, phone, email, role, status, invite_status, permission_level, created_at")
      .eq("care_circle_id", careCircleId)
      .order("created_at", { ascending: true }),
  ]);
  const limits = getPlanLimits(plan.planId);

  const members: TeamMemberView[] = ((membersResult.data || []) as Array<{
    id?: string | null;
    user_id?: string | null;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
    status?: string | null;
    invite_status?: string | null;
    permission_level?: string | null;
  }>).map((member) => ({
    id: asString(member.id),
    name: asString(member.name, "Family member"),
    phone: asString(member.phone),
    email: asString(member.email),
    role: normalizeTeamRole(member.role, member.permission_level),
    status: memberStatus(member.status, member.invite_status),
    userId: member.user_id,
  }));

  const selectedName = asString(circleDetails?.name, asString(selectedCircle.name, "Care circle"));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Team</p>
          <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>Family access</h1>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            Selected care circle: <span className="font-semibold" style={{ color: "var(--text)" }}>{selectedName}</span>
          </p>
        </div>
        {circles.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {circles.map((circle) => (
              <Link
                key={asString(circle.id)}
                href={`/team?careCircleId=${asString(circle.id)}`}
                className="rounded-full px-3 py-2 text-sm font-semibold"
                style={{
                  background: circle.id === careCircleId ? "var(--teal)" : "var(--primary-soft)",
                  color: circle.id === careCircleId ? "white" : "var(--text-secondary)",
                }}
              >
                {asString(circle.name, "Care circle")}
              </Link>
            ))}
          </div>
        )}
      </div>

      <TeamManagement
        careCircleId={careCircleId}
        actorRole={actorRole}
        members={members}
        maxFamilyMembers={limits.maxFamilyMembers}
      />
    </main>
  );
}
