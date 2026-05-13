import { DemoSnapshot } from "@/lib/types";
import { normalizeCircleType } from "@/lib/circles/circleTypes";

const modeOverviewLabels = {
  care: {
    updates: "Today's updates",
    tasks: "Open tasks",
    appointments: "Appointments",
    supplies: "Needed supplies",
    confirmations: "Med confirmations",
    flagged: "Open concerns",
  },
  family: {
    updates: "Family updates",
    tasks: "Open chores",
    appointments: "Appointments",
    supplies: "Groceries",
    confirmations: "Reminders",
    flagged: "School notes",
  },
  household: {
    updates: "House updates",
    tasks: "Open chores",
    appointments: "Maintenance",
    supplies: "Supplies",
    confirmations: "Bills",
    flagged: "Reminders",
  },
  team: {
    updates: "Announcements",
    tasks: "Volunteer tasks",
    appointments: "Games/events",
    supplies: "Equipment",
    confirmations: "Rides",
    flagged: "Reminders",
  },
  group: {
    updates: "Announcements",
    tasks: "Open tasks",
    appointments: "Events",
    supplies: "Supplies",
    confirmations: "Decisions",
    flagged: "Responsibilities",
  },
} as const;

export function DashboardOverviewCards({ snapshot }: { snapshot: DemoSnapshot }) {
  const labels = modeOverviewLabels[normalizeCircleType(snapshot.circleType)];
  const todayUpdates = snapshot.messages.filter(m => {
    const d = new Date(m.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
  const openTasks = snapshot.tasks.filter(t => t.status === "open").length;
  const upcomingAppts = snapshot.appointments.length;
  const neededSupplies = snapshot.supplies.filter(s => s.status === "needed").length;
  const confirmations = snapshot.messages.filter(m => m.category === "medication").length;
  const openConcerns = snapshot.concerns.filter(c => !c.acknowledged).length;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <Card title={labels.updates} count={todayUpdates} accent="var(--teal)" />
      <Card title={labels.tasks} count={openTasks} accent="var(--purple-soft)" />
      <Card title={labels.appointments} count={upcomingAppts} accent="var(--blue-soft)" />
      <Card title={labels.supplies} count={neededSupplies} accent="var(--warning)" />
      <Card title={labels.confirmations} count={confirmations} accent="var(--sage)" />
      <Card title={labels.flagged} count={openConcerns} accent={openConcerns > 0 ? "var(--warning)" : "var(--teal)"} />
    </div>
  );
}

function Card({ title, count, accent }: { title: string; count: number; accent: string }) {
  return (
    <div className="product-card min-w-0 p-4 text-left">
      <div className="relative z-10">
        <div className="mb-3 h-1 w-10 rounded-full" style={{ background: accent }} />
        <div className="flex min-w-0 items-end justify-between gap-3 sm:block">
          <div className="text-3xl font-bold" style={{ color: "var(--text)" }}>{count}</div>
          <div className="mt-1 min-w-0 text-right text-[11px] font-bold uppercase tracking-wide sm:text-left" style={{ color: "var(--text-subtle)" }}>{title}</div>
        </div>
      </div>
    </div>
  );
}
