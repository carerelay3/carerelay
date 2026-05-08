import { DemoMessage } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function MedicationLog({ messages }: { messages: DemoMessage[] }) {
  const meds = messages.filter(m => m.category === "medication");

  return (
    <div className="space-y-4 glass-elevated p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">Medication Log</h2>
      <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
        Medication confirmations are family-reported logs for organization only. Always follow instructions from licensed medical professionals.
      </p>
      
      {meds.length === 0 ? (
        <EmptyState title="No logs" text="No medication confirmations logged recently." />
      ) : (
        <div className="space-y-3">
          {meds.map(m => (
            <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm">
              <div className="text-slate-700 font-medium mb-1">{m.body}</div>
              <div className="text-slate-400 text-xs">Logged by {m.sender} at {new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}