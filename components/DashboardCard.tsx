import { ReactNode } from "react";

export function DashboardCard({ title, value, children, badge }: { title: string; value?: string | number; children?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="glass-elevated relative overflow-hidden p-6 sm:p-8 transition-transform hover:-translate-y-1">
      {/* Volumetric light leaks */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'var(--sage-glow)' }} />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'var(--blue-glow)' }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{title}</p>
          {badge && <div>{badge}</div>}
        </div>
        
        {value !== undefined ? (
          <p className="mt-2 text-4xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</p>
        ) : (
          <div className="mt-4">{children}</div>
        )}
      </div>
    </div>
  );
}
