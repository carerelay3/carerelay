import { DemoTask } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function TaskList({ tasks }: { tasks: DemoTask[] }) {
  return (
    <div className="space-y-4 glass-elevated p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">Tasks</h2>
      
      {tasks.length === 0 ? (
        <EmptyState title="No open tasks right now" text="Add tasks by texting the CareRelay number." />
      ) : (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm flex gap-3 items-center">
              <input type="checkbox" checked={t.status === 'done'} readOnly className="h-4 w-4 rounded text-blue-500 border-slate-300" />
              <div className="flex-1">
                <div className={`text-slate-700 font-medium ${t.status === 'done' ? 'line-through opacity-50' : ''}`}>{t.title}</div>
                {t.assignedToName && <div className="text-slate-400 text-xs">Assigned to: {t.assignedToName}</div>}
              </div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400">{t.status.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}