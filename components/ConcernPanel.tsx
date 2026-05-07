"use client";

type Props = {
  concerns: Array<{
    id: string;
    text: string;
    createdAt: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    acknowledgementNote?: string;
  }>;
  onAcknowledge?: (concernId: string, by: string, note?: string) => void;
};

export function ConcernPanel({ concerns, onAcknowledge }: Props) {
  if (!concerns.length) {
    return (
      <div className="glass-elevated p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at center, var(--success-soft), transparent 60%)' }} />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--success-soft)] shadow-sm">
            <svg className="h-8 w-8 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>No concerns flagged</h3>
          <p className="text-sm max-w-xs mx-auto font-medium" style={{ color: 'var(--text-muted)' }}>When messages mention words like &quot;fell&quot; or &quot;confused&quot;, they will appear here for family awareness.</p>
        </div>
      </div>
    );
  }

  const unacknowledged = concerns.filter((c) => !c.acknowledged);
  const acknowledged = concerns.filter((c) => c.acknowledged);

  return (
    <div className="space-y-6">
      {unacknowledged.length > 0 && (
        <div className="alert-glass p-6 sm:p-8 relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'var(--error)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-[1.25rem]" style={{ background: 'var(--error-soft)', boxShadow: '0 4px 16px rgba(196,107,107,0.2)' }}>
                <svg className="h-6 w-6" fill="none" stroke="var(--error)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--error)] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--error)] border-2 border-white"></span>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--error)' }}>{unacknowledged.length} concern{unacknowledged.length > 1 ? "s" : ""} to review</h3>
                <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--error)' }}>Priority Attention</p>
              </div>
            </div>
            
            <p className="text-xs mb-5 font-medium leading-relaxed" style={{ color: 'var(--text-subtle)' }}>CareRelay does not provide medical advice, decide how serious something is, or monitor health. For emergencies, call 911.</p>

            <ul className="space-y-4">
              {unacknowledged.map((c) => (
                <li key={c.id} className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid rgba(196,107,107,0.2)' }}>
                  <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>{c.text}</p>
                  <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>{new Date(c.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                  {onAcknowledge && (
                    <div className="mt-4 flex gap-3">
                      <button type="button" onClick={() => onAcknowledge(c.id, "Coordinator", undefined)} className="btn text-sm font-bold shadow-sm" style={{ background: 'var(--success)', color: 'white', padding: '10px 20px' }}>
                        Acknowledge
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {acknowledged.length > 0 && (
        <div className="glass-elevated p-6 sm:p-8">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-subtle)' }}>Acknowledged History</h4>
          <ul className="space-y-3">
            {acknowledged.map((c) => (
              <li key={c.id} className="flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-white/40" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--success-soft)' }}>
                  <svg className="h-4 w-4" fill="none" stroke="var(--success)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{c.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                    <span>By <span style={{ color: 'var(--text)' }}>{c.acknowledgedBy}</span></span>
                    <span>·</span>
                    <time>{c.acknowledgedAt ? new Date(c.acknowledgedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}</time>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
