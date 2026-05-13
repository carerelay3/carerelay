type Props = { compact?: boolean };

export function DisclaimerBanner({ compact }: Props) {
  return (
    <div className="glass-elevated relative max-w-full overflow-hidden p-4 transition-all hover:bg-white/40 sm:p-6" style={{ border: '1px solid rgba(201,139,90,0.2)' }}>
      {/* Soft warning ambient light */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--warning)' }} />
      
      <div className="relative z-10 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[1.25rem] shadow-sm sm:h-12 sm:w-12" style={{ background: 'var(--warning-soft)' }}>
          <svg className="h-6 w-6" fill="none" stroke="var(--warning)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className={`font-bold tracking-tight ${compact ? 'text-sm' : 'text-base'}`} style={{ color: 'var(--warning)' }}>
            CircleRelay Care Mode is for family coordination only.
          </p>
          <p className="max-w-full break-words text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            It is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services.
          </p>
          {!compact && (
            <div className="mt-3 max-w-full space-y-1 break-words text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
              <p>In an emergency, call 911 or your local emergency number.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
