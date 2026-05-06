import type { DemoMessage } from "@/lib/types";

const categoryColors: Record<string, { bg: string; text: string }> = {
  medication: { bg: "rgba(107, 158, 117, 0.12)", text: "#5A8E65" },
  appointment: { bg: "rgba(107, 142, 174, 0.12)", text: "#5A7E9E" },
  task: { bg: "rgba(139, 126, 174, 0.12)", text: "#7B6E9E" },
  supply: { bg: "rgba(201, 139, 90, 0.12)", text: "#A97B4A" },
  concern: { bg: "rgba(196, 107, 107, 0.12)", text: "#A45B5B" },
  general_update: { bg: "rgba(160, 157, 152, 0.12)", text: "#8A8782" },
};

export function MessageFeed({
  messages,
  getAvatarColor,
}: {
  messages: DemoMessage[];
  members?: Array<{ id: string; name: string }>;
  getAvatarColor?: (name: string) => string;
}) {
  if (!messages.length) {
    return (
      <div className="glass p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-subtle)' }}>
          <svg className="h-7 w-7" fill="none" stroke="var(--text-subtle)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>No messages yet</h3>
        <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>When your family texts the shared CareRelay number, every update will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-subtle)' }}>Care timeline</h3>
      <div className="relative pl-6">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px" style={{ background: 'linear-gradient(180deg, var(--bg-muted), var(--sage-soft), var(--bg-muted))' }} />

        <div className="space-y-5">
          {messages.map((m, i) => {
            const color = categoryColors[m.category] || categoryColors.general_update;
            const avatarColor = getAvatarColor ? getAvatarColor(m.sender) : "#6B9E75";
            const isConcern = m.concernFlag;

            return (
              <div key={m.id} className="relative animate-fade-in" style={{ animationDelay: `${Math.min(i * 80, 600)}ms`, opacity: 0 }}>
                {/* Dot */}
                <div
                  className="absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-white shadow-sm z-10"
                  style={{ background: isConcern ? 'var(--error)' : 'var(--sage)', boxShadow: isConcern ? '0 0 0 3px rgba(196,107,107,0.15)' : '0 0 0 3px var(--sage-soft)' }}
                />

                <div className={`glass p-4 transition-all hover:-translate-y-0.5 ${isConcern ? 'alert-glass' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ background: avatarColor }}
                    >
                      {m.sender.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.sender}</span>
                        <time className="text-[11px]" style={{ color: 'var(--text-subtle)' }} dateTime={m.createdAt}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        <span
                          className="badge-pill text-[10px] px-2 py-0.5"
                          style={{ background: color.bg, color: color.text }}
                        >
                          {m.category.replace(/_/g, " ")}
                        </span>
                        {isConcern && (
                          <span className="badge-pill text-[10px] px-2 py-0.5" style={{ background: 'var(--error-soft)', color: 'var(--error)' }}>
                            Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.body}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
