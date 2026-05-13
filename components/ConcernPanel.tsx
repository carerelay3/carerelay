import { DemoConcern } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { isCareMode } from "@/lib/circles/circleTypes";

export function ConcernPanel({ concerns, circleType }: { concerns: DemoConcern[]; circleType?: string }) {
  const careMode = isCareMode(circleType);
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border p-5 shadow-sm sm:p-6" style={{ background: "linear-gradient(145deg, rgba(255,248,235,0.92), rgba(255,255,255,0.68))", borderColor: "rgba(201,139,90,0.24)" }}>
      <h2 className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--text)" }}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {careMode ? "Family Concerns" : "Important updates"}
      </h2>
      <p className="rounded-2xl border p-3 text-xs font-semibold" style={{ background: "var(--warning-soft)", borderColor: "rgba(201,139,90,0.24)", color: "var(--text-secondary)" }}>
        {careMode
          ? "Concerns are flagged for family review only. If this is an emergency, call 911 or your local emergency number."
          : "Important updates are highlighted for group review. This is coordination software, not safety response software."}
      </p>
      
      {concerns.length === 0 ? (
        <EmptyState title={careMode ? "No open concerns" : "No important updates"} text={careMode ? "No new concerns have been flagged." : "No important updates have been flagged."} />
      ) : (
        <div className="space-y-3">
          {concerns.map(c => (
            <div key={c.id} className="rounded-2xl border bg-white/75 p-3 text-sm shadow-sm" style={{ borderColor: "rgba(201,139,90,0.24)" }}>
              <div className="font-semibold" style={{ color: "var(--text)" }}>{c.text}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>{new Date(c.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
