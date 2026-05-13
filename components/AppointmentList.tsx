import { DemoAppointment } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function AppointmentList({ appointments }: { appointments: DemoAppointment[] }) {
  return (
    <div className="surface-panel min-w-0 space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Appointments</h2>
      
      {appointments.length === 0 ? (
        <EmptyState title="No upcoming appointments found" text="When appointments are texted, they will appear here." />
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="min-w-0 rounded-2xl border bg-white/70 p-3 text-sm shadow-sm" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <div className="break-words font-semibold" style={{ color: "var(--text)" }}>{a.title}</div>
                {a.at && <div className="text-xs" style={{ color: "var(--text-subtle)" }}>{new Date(a.at).toLocaleString()}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
