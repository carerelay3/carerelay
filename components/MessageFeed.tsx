import type { DemoMessage } from "@/lib/types";

const categoryColors: Record<string, { bg: string; text: string }> = {
  medication: { bg: "rgba(107, 158, 117, 0.12)", text: "#4A8E6A" },
  appointment: { bg: "rgba(107, 142, 174, 0.12)", text: "#4A6E8E" },
  task: { bg: "rgba(139, 126, 174, 0.12)", text: "#6A5A8E" },
  supply: { bg: "rgba(201, 139, 90, 0.12)", text: "#A96B3A" },
  concern: { bg: "rgba(196, 107, 107, 0.12)", text: "#A44A4A" },
  general_update: { bg: "rgba(160, 157, 152, 0.12)", text: "#7A7772" },
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
      <div className="glass-elevated p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at center, var(--sage-soft), transparent 60%)' }} />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--bg-subtle)] shadow-md">
            <svg className="h-8 w-8 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>No messages yet</h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>When your family texts the shared CareRelay number, every update will securely appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Care timeline</h3>
        <div className="h-px flex-1 bg-[var(--glass-border)]" />
      </div>
      
      <div className="relative pl-8">
        {/* Soft Volumetric Timeline line */}
        <div className="absolute left-[23px] top-4 bottom-4 w-1 rounded-full" style={{ background: 'linear-gradient(180deg, var(--bg-muted) 0%, var(--sage-soft) 20%, var(--sage-soft) 80%, var(--bg-muted) 100%)' }} />

        <div className="space-y-6">
          {messages.map((m, i) => {
            const color = categoryColors[m.category] || categoryColors.general_update;
            const avatarColor = getAvatarColor ? getAvatarColor(m.sender) : "#6B9E75";
            const isConcern = m.concernFlag;

            return (
              <div key={m.id} className="relative animate-fade-in" style={{ animationDelay: `${Math.min(i * 50, 400)}ms`, opacity: 0 }}>
                {/* Glowing Dot */}
                <div
                  className="absolute -left-[30px] top-4 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg)] shadow-sm z-10"
                  style={{ background: isConcern ? 'var(--error)' : 'var(--sage)', boxShadow: isConcern ? '0 0 12px rgba(196,107,107,0.4)' : '0 0 12px rgba(107, 158, 117, 0.4)' }}
                />

                <div className={`glass-elevated p-5 sm:p-6 transition-all hover:-translate-y-1 ${isConcern ? 'alert-glass' : ''}`}>
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md"
                      style={{ background: avatarColor, boxShadow: `0 4px 16px ${avatarColor}40` }}
                    >
                      {m.sender.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-base font-bold" style={{ color: 'var(--text)' }}>{m.sender}</span>
                        <time className="text-xs font-medium" style={{ color: 'var(--text-subtle)' }} dateTime={m.createdAt}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        <span
                          className="badge-pill text-[10px] px-2.5 py-1"
                          style={{ background: color.bg, color: color.text }}
                        >
                          {m.category.replace(/_/g, " ")}
                        </span>
                        {isConcern && (
                          <span className="badge-pill text-[10px] px-2.5 py-1" style={{ background: 'var(--error-soft)', color: 'var(--error)' }}>
                            Flagged Priority
                          </span>
                        )}
                      </div>
                      <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>{m.body}</p>
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
