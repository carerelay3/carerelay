"use client";

import type { DemoMember, DemoTask, DemoMessage } from "@/lib/types";

export function FamilyPresencePanel({
  members,
  tasks,
  messages,
  onInvite,
}: {
  members: DemoMember[];
  tasks: DemoTask[];
  messages: DemoMessage[];
  onInvite: (memberId: string) => void;
}) {
  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    joined: { bg: "rgba(90, 158, 122, 0.1)", color: "var(--success)", label: "Joined" },
    invited: { bg: "rgba(201, 139, 90, 0.1)", color: "var(--warning)", label: "Invited" },
    opted_out: { bg: "rgba(196, 107, 107, 0.1)", color: "var(--error)", label: "Opted out" },
    not_invited: { bg: "rgba(160, 157, 152, 0.1)", color: "var(--text-subtle)", label: "Not invited" },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const assignedTasks = tasks.filter((t) => t.assignedTo === member.id && t.status !== "done");
          const completedTasks = tasks.filter((t) => t.completedBy === member.name || (t.assignedTo === member.id && t.status === "done"));
          const recentMessages = messages.filter((m) => m.sender === member.name).length;
          const status = statusConfig[member.inviteStatus] || statusConfig.not_invited;

          return (
            <div key={member.id} className="glass p-5 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-bold text-sm shadow-md" style={{ background: 'linear-gradient(135deg, var(--sage), var(--blue-soft))' }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.role} · {member.permissionLevel}</p>
                  </div>
                </div>
                <span className="badge-pill text-[10px]" style={{ background: status.bg, color: status.color }}>{status.label}</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Open", value: assignedTasks.length },
                  { label: "Done", value: completedTasks.length },
                  { label: "Texts", value: recentMessages },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {member.inviteStatus !== "joined" && member.inviteStatus !== "opted_out" && (
                <button type="button" onClick={() => onInvite(member.id)} className="btn btn-soft w-full mt-4 text-xs" style={{ padding: '8px 12px' }}>
                  Send invite
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass p-5">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Invite message template</h3>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Copy and send this to family members.</p>
        <div className="mt-3 rounded-xl p-4 text-xs" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
          You have been invited to {members[0] ? `${members[0].name}'s Care Circle` : "a Care Circle"} on CircleRelay. CircleRelay Care Mode helps the family organize caregiving updates by text. It is for coordination only, not emergencies or medical advice. Reply YES to join or STOP to opt out.
        </div>
      </div>

      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-sm flex items-center justify-between flex-wrap gap-4 mt-6">
        <span className="text-slate-600 font-medium">Have a large family? You&apos;ve used {members.length} member slots.</span>
        <a href="/pricing" className="text-sage-600 font-bold hover:underline">View upgrade options</a>
      </div>
    </div>
  );
}
