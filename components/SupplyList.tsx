import { DemoSupply } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function SupplyList({ supplies }: { supplies: DemoSupply[] }) {
  return (
    <div className="surface-panel min-w-0 space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Supplies and groceries</h2>
      
      {supplies.length === 0 ? (
        <EmptyState title="No needed supplies right now" text="Text if you need anything picked up." />
      ) : (
        <div className="space-y-3">
          {supplies.map(s => (
            <div key={s.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-white/70 p-3 text-sm shadow-sm sm:flex-row sm:items-center" style={{ borderColor: "var(--border)" }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.status === "needed" ? "var(--warning)" : "var(--success)" }} />
              <div className={`min-w-0 flex-1 break-words font-semibold ${s.status !== 'needed' ? 'line-through opacity-50' : ''}`} style={{ color: "var(--text)" }}>
                {s.item}
              </div>
              <span className="badge-pill badge-warm self-start sm:self-auto">{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
