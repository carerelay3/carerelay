import { DemoMessage } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { isCareMode } from "@/lib/circles/circleTypes";

export function MedicationLog({ messages, circleType }: { messages: DemoMessage[]; circleType?: string }) {
  const careMode = isCareMode(circleType);
  const meds = careMode ? messages.filter(m => m.category === "medication") : [];

  return (
    <div className="surface-panel space-y-4 p-5 sm:p-6">
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{careMode ? "Medication confirmations" : "Updates and confirmations"}</h2>
      {careMode ? (
        <p className="rounded-2xl border bg-white/70 p-3 text-xs font-medium" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Medication confirmations are family-reported logs for organization only. Always follow instructions from licensed medical professionals.
        </p>
      ) : (
        <p className="rounded-2xl border bg-white/70 p-3 text-xs font-medium" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Mode-specific confirmation panels are coming later. For now, use updates and tasks for coordination.
        </p>
      )}
      
      {meds.length === 0 ? (
        <EmptyState title="No logs" text={careMode ? "No medication confirmations logged recently." : "No confirmations logged recently."} />
      ) : (
        <div className="space-y-3">
          {meds.map(m => (
            <div key={m.id} className="rounded-2xl border bg-white/70 p-3 text-sm shadow-sm" style={{ borderColor: "var(--border)" }}>
              <div className="mb-1 font-semibold" style={{ color: "var(--text)" }}>{m.body}</div>
              <div className="text-xs" style={{ color: "var(--text-subtle)" }}>Logged by {m.sender} at {new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
