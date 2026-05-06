export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass relative overflow-hidden p-10 text-center">
      <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--sage)' }} />
      <div className="relative z-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--sage-soft)' }}>
          <svg className="h-6 w-6" fill="none" stroke="var(--sage)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
      </div>
    </div>
  );
}
