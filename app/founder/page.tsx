import { getDemoSnapshot } from "@/lib/demo/data";
import { formatUsPhoneDisplay } from "@/lib/utils/phone";

export const dynamic = "force-dynamic";

export default function FounderPage() {
  const snapshot = getDemoSnapshot();
  const openTasks = snapshot.tasks.filter((t) => t.status === "open").length;
  const needsAttention = snapshot.tasks.filter((t) => t.status === "needs_attention").length;
  const unreviewedConcerns = snapshot.concerns.filter((c) => !c.acknowledged).length;
  const neededSupplies = snapshot.supplies.filter((s) => s.status === "needed").length;
  const joinedMembers = snapshot.members.filter((m) => m.inviteStatus === "joined").length;
  const invitedMembers = snapshot.members.filter((m) => m.inviteStatus === "invited").length;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <div className="glass-strong p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-20 blur-[80px]" style={{ background: 'var(--purple-soft)' }} />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>Founder Pilot Mode</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Operational overview for manual pilot management</p>
          </div>
          <span className="badge-pill" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>Demo Mode</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Family members", value: snapshot.members.length, sub: `${joinedMembers} joined · ${invitedMembers} invited`, color: "var(--blue-soft)" },
          { label: "Messages", value: snapshot.messages.length, sub: "Total processed", color: "var(--sage)" },
          { label: "Open tasks", value: openTasks, sub: `${needsAttention} need attention`, color: "var(--purple-soft)" },
          { label: "Unreviewed concerns", value: unreviewedConcerns, sub: `${neededSupplies} supplies needed`, color: "var(--error)" },
        ].map((s) => (
          <div key={s.label} className="glass p-5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{s.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass">
          <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Care Circle</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Name", value: snapshot.careCircleName },
              { label: "Recipient", value: snapshot.recipientName },
              { label: "Shared number", value: formatUsPhoneDisplay(snapshot.sharedPhone), accent: true },
              { label: "Mode", value: "Demo (no credentials)" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span className="font-medium" style={{ color: row.accent ? 'var(--sage)' : 'var(--text)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass">
          <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Setup Checklist</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Supabase configured", done: false },
              { label: "Twilio webhook active", done: false },
              { label: "OpenAI summary key set", done: false },
              { label: "Stripe checkout live", done: false },
              { label: "RLS policies reviewed", done: false },
              { label: "Rate limiting added to SMS", done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: item.done ? 'var(--success)' : 'var(--bg-muted)' }}>
                  {item.done ? "✓" : "○"}
                </span>
                <span style={{ color: item.done ? 'var(--text)' : 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass">
        <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Recent Activity</h2>
        </div>
        <div className="p-5">
          <ul className="space-y-3">
            {snapshot.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{a.description}</span>
                <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{new Date(a.createdAt).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
