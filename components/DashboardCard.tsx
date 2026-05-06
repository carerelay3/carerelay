import { ReactNode } from "react";

export function DashboardCard({ title, value, children }: { title: string; value?: string | number; children?: ReactNode }) {
  return (
    <div className="glass relative overflow-hidden p-5">
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full opacity-30 blur-2xl" style={{ background: 'var(--sage-glow)' }} />
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{title}</p>
        {value !== undefined ? (
          <p className="mt-1 text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{value}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
