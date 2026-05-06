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
      <div className="glass p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--success-soft)' }}>
          <svg className="h-7 w-7" fill="none" stroke="var(--success)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>No concerns flagged</h3>
        <p className="mt-2 text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>When messages mention words like &quot;fell&quot; or &quot;confused&quot;, they will appear here for family awareness.</p>
      </div>
    );
  }

  const unacknowledged = concerns.filter((c) => !c.acknowledged);
  const acknowledged = concerns.filter((c) => c.acknowledged);

  return (
    <div className="space-y-4">
      {unacknowledged.length > 0 && (
        <div className="alert-glass p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--error-soft)' }}>
              <svg className="h-5 w-5" fill="none" stroke="var(--error)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--error)] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--error)]"></span>
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--error)' }}>{unacknowledged.length} concern{unacknowledged.length > 1 ? "s" : ""} to review</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These messages matched words families often want to notice.</p>
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-subtle)' }}>CareRelay does not provide medical advice, decide how serious something is, or monitor health. For emergencies, call 911.</p>

          <ul className="space-y-3">
            {unacknowledged.map((c) => (
              <li key={c.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(196,107,107,0.12)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{c.text}</p>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--text-subtle)' }}>{new Date(c.createdAt).toLocaleString()}</p>
                {onAcknowledge && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => onAcknowledge(c.id, "Coordinator", undefined)} className="btn text-xs" style={{ background: 'var(--success)', color: 'white', padding: '6px 14px' }}>
                      Acknowledge
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {acknowledged.length > 0 && (
        <div className="glass p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>Acknowledged</h4>
          <ul className="space-y-2">
            {acknowledged.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--glass-border)' }}>
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="var(--success)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.text}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>Acknowledged by {c.acknowledgedBy} · {c.acknowledgedAt ? new Date(c.acknowledgedAt).toLocaleDateString() : ""}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
