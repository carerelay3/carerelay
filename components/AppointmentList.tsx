export function AppointmentList({ appointments }: { appointments: Array<{ id: string; title: string; at: string; transportationConfirmed: boolean }> }) {
  return (
    <div className="glass">
      <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Appointments</h3>
          {appointments.length > 0 && (
            <span className="badge-pill badge-sage">{appointments.length} upcoming</span>
          )}
        </div>
      </div>
      {appointments.length > 0 && (
        <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
          {appointments.map((a) => (
            <div key={a.id} className="flex items-start gap-4 p-5 transition-colors hover:bg-white/40">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: a.transportationConfirmed ? 'var(--success-soft)' : 'var(--warning-soft)' }}>
                <svg className="h-4 w-4" fill="none" stroke={a.transportationConfirmed ? 'var(--success)' : 'var(--warning)'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{a.title}</p>
                  {a.transportationConfirmed && (
                    <span className="badge-pill badge-success text-[10px]">Transport set</span>
                  )}
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(a.at).toLocaleString()}</p>
                {!a.transportationConfirmed && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: 'var(--warning)' }}>
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Transportation not confirmed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
