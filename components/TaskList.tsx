import { DemoTask } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function TaskList({ tasks }: { tasks: DemoTask[] }) {
  return (
    <div className="surface-panel space-y-4 p-5 sm:p-6">
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Tasks</h2>
      
      {tasks.length === 0 ? (
        <EmptyState title="No open tasks right now" text="Add tasks by texting the CareRelay number." />
      ) : (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border bg-white/70 p-3 text-sm shadow-sm" style={{ borderColor: "var(--border)" }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: t.status === "done" ? "var(--success)" : "var(--border)" }}>
                {t.status === "done" && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--success)" }} />}
              </span>
              <div className="flex-1">
                <div className={`font-semibold ${t.status === 'done' ? 'line-through opacity-50' : ''}`} style={{ color: "var(--text)" }}>{t.title}</div>
                {t.assignedToName && <div className="text-xs" style={{ color: "var(--text-subtle)" }}>Assigned to: {t.assignedToName}</div>}
              </div>
              <div className="badge-pill badge-purple">{t.status.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
