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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <Card title="Today's Updates" count={todayUpdates} />
      <Card title="Open Tasks" count={openTasks} />
      <Card title="Appointments" count={upcomingAppts} />
      <Card title="Needed Supplies" count={neededSupplies} />
      <Card title="Med Confirmations" count={medConfirmations} />
      <Card title="Open Concerns" count={openConcerns} color={openConcerns > 0 ? "var(--warning)" : undefined} />
    </div>
  );
}

function Card({ title, count, color }: { title: string; count: number; color?: string }) {
  return (
    <div className="glass-elevated p-4 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm">
      <div className="text-3xl font-bold mb-1" style={{ color: color || "var(--text)" }}>{count}</div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</div>
    </div>
  );
}