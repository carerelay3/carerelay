import { DemoAppointment } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function AppointmentList({ appointments }: { appointments: DemoAppointment[] }) {
  return (
    <div className="space-y-4 glass-elevated p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">Appointments</h2>
      
      {appointments.length === 0 ? (
        <EmptyState title="No upcoming appointments found" text="When appointments are texted, they will appear here." />
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm flex justify-between items-center">
              <div>
                <div className="text-slate-700 font-medium">{a.title}</div>
                {a.at && <div className="text-slate-500 text-xs">{new Date(a.at).toLocaleString()}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}