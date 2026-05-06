export function MedicationLog({
  logs,
}: {
  logs: Array<{ id: string; text: string; by: string; at: string }>;
}) {
  return (
    <div className="glass">
      <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Medication confirmations</h3>
          {logs.length > 0 && (
            <span className="badge-pill badge-sage">{logs.length} logged</span>
          )}
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          We only record what a family member reported in their own words. CareRelay never suggests what to take or when.
        </p>
      </div>
      {logs.length > 0 && (
        <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
          {logs.map((m) => (
            <div key={m.id} className="flex items-start gap-4 p-5 transition-colors hover:bg-white/40">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--sage-soft)' }}>
                <svg className="h-4 w-4" fill="none" stroke="var(--sage)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--text)' }}>{m.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--sage)' }}>{m.by}</span>
                  <span>·</span>
                  <time dateTime={m.at}>{new Date(m.at).toLocaleString()}</time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
