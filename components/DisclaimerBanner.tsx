type Props = { compact?: boolean };

export function DisclaimerBanner({ compact }: Props) {
  return (
    <div className="alert-glass p-5 sm:p-6 relative overflow-hidden">
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--warning-soft)' }}>
          <svg className="h-5 w-5" fill="none" stroke="var(--warning)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`} style={{ color: 'var(--warning)' }}>
            CareRelay is for family coordination only.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Do not use CareRelay for emergencies. Call 911 or your local emergency number.
          </p>
          {!compact && (
            <div className="mt-2 space-y-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
              <p>CareRelay does not provide medical advice, diagnosis, treatment, or medication dosage recommendations.</p>
              <p>CareRelay helps you see what the family has already shared, but it does not monitor health or guarantee safety.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
