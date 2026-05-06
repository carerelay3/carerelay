import type { DemoActivity } from "@/lib/types";

const activityIcons: Record<string, string> = {
  message_received: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  task_created: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  task_completed: "M5 13l4 4L19 7",
  task_assigned: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  appointment_created: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  supply_added: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  supply_purchased: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  supply_delivered: "M5 13l4 4L19 7",
  medication_log: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  concern_flagged: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  concern_acknowledged: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  handoff_generated: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  handoff_reviewed: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  family_member_invited: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  export_created: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  summary_generated: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

const activityColors: Record<string, { bg: string; color: string }> = {
  message_received: { bg: "rgba(107, 142, 174, 0.1)", color: "var(--blue-soft)" },
  task_created: { bg: "rgba(139, 126, 174, 0.1)", color: "var(--purple-soft)" },
  task_completed: { bg: "rgba(90, 158, 122, 0.1)", color: "var(--success)" },
  task_assigned: { bg: "rgba(107, 142, 174, 0.1)", color: "var(--blue-soft)" },
  appointment_created: { bg: "rgba(107, 142, 174, 0.1)", color: "var(--blue-soft)" },
  supply_added: { bg: "rgba(201, 139, 90, 0.1)", color: "var(--warning)" },
  supply_purchased: { bg: "rgba(107, 158, 117, 0.1)", color: "var(--sage)" },
  supply_delivered: { bg: "rgba(90, 158, 122, 0.1)", color: "var(--success)" },
  medication_log: { bg: "rgba(107, 142, 174, 0.1)", color: "var(--blue-soft)" },
  concern_flagged: { bg: "rgba(196, 107, 107, 0.1)", color: "var(--error)" },
  concern_acknowledged: { bg: "rgba(90, 158, 122, 0.1)", color: "var(--success)" },
  summary_generated: { bg: "rgba(107, 142, 174, 0.1)", color: "var(--blue-soft)" },
  handoff_generated: { bg: "rgba(107, 158, 117, 0.1)", color: "var(--sage)" },
  handoff_reviewed: { bg: "rgba(90, 158, 122, 0.1)", color: "var(--success)" },
  family_member_invited: { bg: "rgba(139, 126, 174, 0.1)", color: "var(--purple-soft)" },
  export_created: { bg: "rgba(160, 157, 152, 0.1)", color: "var(--text-subtle)" },
};

export function ActivityFeed({ activity }: { activity: DemoActivity[] }) {
  if (!activity.length) {
    return (
      <div className="glass p-10 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet. When family members text the shared number or you manage tasks, everything will be tracked here.</p>
      </div>
    );
  }

  return (
    <div className="glass">
      <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Activity</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>A running log of what happened in your care circle.</p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
        {activity.map((a) => {
          const style = activityColors[a.type] || activityColors.message_received;
          const iconPath = activityIcons[a.type] || activityIcons.message_received;
          return (
            <div key={a.id} className="flex items-start gap-4 p-5 transition-colors hover:bg-white/40">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: style.bg }}>
                <svg className="h-4 w-4" fill="none" stroke={style.color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--text)' }}>{a.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                  {a.actor && <span className="font-medium" style={{ color: 'var(--sage)' }}>{a.actor}</span>}
                  <span>·</span>
                  <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString()}</time>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
