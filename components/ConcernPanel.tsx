import { DemoConcern } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function ConcernPanel({ concerns }: { concerns: DemoConcern[] }) {
  return (
    <div className="space-y-4 glass-elevated p-6 rounded-2xl shadow-sm border border-amber-100 bg-amber-50/30">
      <h2 className="text-xl font-semibold text-amber-800 flex items-center gap-2">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Family Concerns
      </h2>
      <p className="text-xs text-amber-700/80 bg-amber-100/50 p-3 rounded-xl border border-amber-200/50 font-medium">
        Concerns are flagged for family review only. If this is an emergency, call 911 or your local emergency number.
      </p>
      
      {concerns.length === 0 ? (
        <EmptyState title="No open concerns" text="No new concerns have been flagged." />
      ) : (
        <div className="space-y-3">
          {concerns.map(c => (
            <div key={c.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm text-sm">
              <div className="text-slate-700 font-medium">{c.text}</div>
              <div className="text-slate-400 text-xs mt-1">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}