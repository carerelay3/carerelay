import { DemoSnapshot } from "@/lib/types";

export function DashboardOverviewCards({ snapshot }: { snapshot: DemoSnapshot }) {
  const todayUpdates = snapshot.messages.filter(m => {
    const d = new Date(m.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
  const openTasks = snapshot.tasks.filter(t => t.status === "open").length;
  const upcomingAppts = snapshot.appointments.length;
  const neededSupplies = snapshot.supplies.filter(s => s.status === "needed").length;
  const medConfirmations = snapshot.messages.filter(m => m.category === "medication").length;
  const openConcerns = snapshot.concerns.filter(c => !c.acknowledged).length;

  return (
    <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <Card title="Today's updates" count={todayUpdates} accent="var(--teal)" />
      <Card title="Open tasks" count={openTasks} accent="var(--purple-soft)" />
      <Card title="Appointments" count={upcomingAppts} accent="var(--blue-soft)" />
      <Card title="Needed supplies" count={neededSupplies} accent="var(--warning)" />
      <Card title="Med confirmations" count={medConfirmations} accent="var(--sage)" />
      <Card title="Open concerns" count={openConcerns} accent={openConcerns > 0 ? "var(--warning)" : "var(--teal)"} />
    </div>
  );
}

function Card({ title, count, accent }: { title: string; count: number; accent: string }) {
  return (
    <div className="product-card p-4 text-left">
      <div className="relative z-10">
        <div className="mb-3 h-1 w-10 rounded-full" style={{ background: accent }} />
        <div className="flex items-end justify-between gap-3 min-[390px]:block">
          <div className="text-3xl font-bold" style={{ color: "var(--text)" }}>{count}</div>
          <div className="mt-1 text-right text-[11px] font-bold uppercase tracking-wide min-[390px]:text-left" style={{ color: "var(--text-subtle)" }}>{title}</div>
        </div>
      </div>
    </div>
  );
}
