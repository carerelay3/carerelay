"use client";

import { useState, useMemo } from "react";
import type { DemoSnapshot } from "@/lib/demo/types";
import { ModeBadge } from "@/components/ModeBadge";
import { MessageFeed } from "@/components/MessageFeed";
import { TaskList } from "@/components/TaskList";
import { ConcernPanel } from "@/components/ConcernPanel";
import { HandoffPanel } from "@/components/HandoffPanel";
import { FamilyPresencePanel } from "@/components/FamilyPresencePanel";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ExportPanel } from "@/components/ExportPanel";
import { NeedsAttentionPanel } from "@/components/NeedsAttentionPanel";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { formatUsPhoneDisplay } from "@/lib/utils/phone";

type TabKey = "command_hub" | "timeline" | "handoff" | "management";

const AVATAR_COLORS = ["#6B9E75", "#6B8EAE", "#8B7EAE", "#C98B5A", "#C46B6B", "#5A9E7A"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function TodayPulse({ snapshot }: { snapshot: DemoSnapshot }) {
  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const todayEnd = useMemo(() => { const d = new Date(); d.setHours(23,59,59,999); return d; }, []);
  const isToday = (s: string) => { const d = new Date(s); return d >= todayStart && d <= todayEnd; };

  const todayMessages = snapshot.messages.filter((m) => isToday(m.createdAt));
  const openTasks = snapshot.tasks.filter((t) => t.status === "open").length;
  const unackConcerns = snapshot.concerns.filter((c) => !c.acknowledged).length;
  const neededSupplies = snapshot.supplies.filter((s) => s.status === "needed").length;

  const stats = [
    { label: "Messages", value: todayMessages.length, color: "var(--blue-soft)", glow: "var(--blue-glow)" },
    { label: "Open tasks", value: openTasks, color: "var(--sage)", glow: "var(--sage-glow)" },
    { label: "Supplies", value: neededSupplies, color: "var(--warning)", glow: "var(--warning-soft)" },
    { label: "Concerns", value: unackConcerns, color: "var(--error)", glow: "var(--error-soft)" },
  ];

  return (
    <div className="flex gap-5 overflow-x-auto pb-4 pt-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {stats.map((s, i) => (
        <div key={i} className="glass-elevated flex-shrink-0 flex items-center gap-5 px-6 py-5 min-w-[200px] transition-transform hover:-translate-y-1">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: s.glow, boxShadow: `0 0 20px ${s.glow}` }}>
            <svg className="h-7 w-7" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-muted)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="16" fill="none" stroke={s.color} strokeWidth="2.5" strokeDasharray={`${Math.min(s.value * 12, 100)} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
            </svg>
            <span className="absolute text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-subtle)' }}>{s.label}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {s.label === "Concerns" && s.value > 0 ? <span style={{ color: 'var(--error)' }}>{s.value} need review</span> : s.value === 0 ? "All clear" : `${s.value} today`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

type Props = {
  initialSnapshot: DemoSnapshot;
  initialMode: "live" | "demo";
};

export function DashboardClient({ initialSnapshot, initialMode }: Props) {
  const [snapshot, setSnapshot] = useState<DemoSnapshot>(initialSnapshot);
  const [mode] = useState<"live" | "demo">(initialMode);
  const [activeTab, setActiveTab] = useState<TabKey>("command_hub");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [sender, setSender] = useState(snapshot.members[0]?.name || "");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSnapshot = (newSnapshot: DemoSnapshot) => setSnapshot(newSnapshot);

  const submit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const member = snapshot.members.find((m) => m.name === sender);
      const res = await fetch("/api/sms/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careCircleId: snapshot.careCircleId,
          fromName: sender,
          fromPhone: member?.phone || "+15550000000",
          body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Failed to process message."); return; }
      if (data.snapshot) refreshSnapshot(data.snapshot);
      setBody("");
    } catch { setError("Network error. Please try again.");
    } finally { setLoading(false); }
  };

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "command_hub", label: "Command Hub", badge: snapshot.concerns.filter(c => !c.acknowledged).length + snapshot.tasks.filter(t => t.status === "needs_attention" || (t.status === "open" && !t.assignedTo)).length + snapshot.supplies.filter(s => s.status === "needed").length },
    { key: "timeline", label: "Timeline" },
    { key: "handoff", label: "Handoff" },
    { key: "management", label: "Manage & Export" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg)] pointer-events-none">
        <div className="absolute top-0 right-0 h-[50vh] w-[50vw] rounded-full opacity-20 blur-[120px] animate-pulse-soft" style={{ background: 'radial-gradient(circle, var(--sage-glow), transparent 70%)' }} />
        <div className="absolute top-[40%] left-[-10%] h-[60vh] w-[60vw] rounded-full opacity-15 blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s', background: 'radial-gradient(circle, var(--blue-glow), transparent 70%)' }} />
      </div>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 animate-fade-in-up">
        {/* Header - Mission Control */}
        <div className="glass-elevated p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full opacity-30 blur-[80px]" style={{ background: 'var(--sage)' }} />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-20 blur-[80px]" style={{ background: 'var(--blue-soft)' }} />

          <div className="relative z-10 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] text-white text-xl font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, var(--sage), var(--blue-soft))', boxShadow: '0 8px 24px rgba(107, 158, 117, 0.25)' }}>
                  {snapshot.recipientName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>{snapshot.careCircleName}</h1>
                  <p className="text-base mt-1" style={{ color: 'var(--text-muted)' }}>Caring for <span className="font-semibold" style={{ color: 'var(--text)' }}>{snapshot.recipientName}</span></p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="glass px-5 py-3 text-center transition-all hover:bg-white/50">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Shared line</p>
                <p className="mt-1 text-base font-bold tabular-nums" style={{ color: 'var(--sage)' }}>{formatUsPhoneDisplay(snapshot.sharedPhone)}</p>
              </div>
              <ModeBadge mode={mode} />
            </div>
          </div>
        </div>

        {/* Emergency disclaimer */}
        <div className="rounded-2xl p-4 text-xs text-center flex items-center justify-center gap-3 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, var(--error-soft), rgba(196,107,107,0.02))', border: '1px solid rgba(196,107,107,0.2)', color: 'var(--error)' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span className="font-medium">Do not use CareRelay for emergencies. Call 911. CareRelay does not provide medical advice.</span>
        </div>

        {showOnboarding && <OnboardingGuide onDismiss={() => setShowOnboarding(false)} />}

        {/* Today Pulse */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--sage)' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Today&apos;s Pulse</h2>
          </div>
          <TodayPulse snapshot={snapshot} />
        </section>

        {/* Simulate message - Floating input */}
        <div className="glass-elevated p-6 flex flex-col sm:flex-row gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
            <select
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="input-glass flex-shrink-0 w-full sm:w-auto font-medium"
              style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
            >
              {snapshot.members.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }}
              placeholder="Type a simulated SMS message..."
              className="input-glass flex-1 min-w-[200px] text-base placeholder:text-[var(--text-subtle)]"
              style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading || !body.trim()}
              className="btn btn-sage flex-shrink-0 w-full sm:w-auto text-sm font-bold"
              style={{ padding: '12px 24px' }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm w-full relative z-10 font-medium" style={{ color: 'var(--error)' }}>{error}</p>}
        </div>

        {/* Tabs */}
        <div 
          role="tablist" 
          aria-label="Dashboard views"
          className="flex flex-wrap gap-2.5 p-1.5 rounded-2xl backdrop-blur-md" 
          style={{ background: 'var(--bg-muted)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className="relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 flex-1 sm:flex-none text-center focus-visible:ring-2 focus-visible:ring-[var(--sage)]"
              style={{
                background: activeTab === tab.key ? 'white' : 'transparent',
                color: activeTab === tab.key ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(30, 28, 26, 0.06), 0 1px 3px rgba(30, 28, 26, 0.04)' : 'none',
              }}
            >
              {tab.label}
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm transition-transform group-hover:scale-110" aria-label={`${tab.badge} items`} style={{ background: 'var(--error)', padding: '0 6px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "command_hub" && (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-8">
                <NeedsAttentionPanel
                  concerns={snapshot.concerns}
                  tasks={snapshot.tasks}
                  supplies={snapshot.supplies}
                  appointments={snapshot.appointments}
                  onAcknowledge={async (concernId, by, note) => {
                    const res = await fetch("/api/concerns/acknowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ concernId, by, note }) });
                    const data = await res.json();
                    if (data.snapshot) refreshSnapshot(data.snapshot);
                  }}
                  onUpdate={refreshSnapshot}
                  members={snapshot.members}
                />
              </div>
              <div className="lg:col-span-5 space-y-8">
                <div className="glass-elevated p-6">
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Today&apos;s Updates</h2>
                  <MessageFeed 
                    messages={snapshot.messages.filter((m) => { 
                      const d = new Date(m.createdAt); const t = new Date(); 
                      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); 
                    })} 
                    members={snapshot.members} 
                    getAvatarColor={getAvatarColor} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-8">
                <MessageFeed messages={snapshot.messages} members={snapshot.members} getAvatarColor={getAvatarColor} />
              </div>
              <div className="lg:col-span-5 space-y-8">
                <ConcernPanel
                  concerns={snapshot.concerns.map((c) => ({ ...c }))}
                  onAcknowledge={async (concernId, by, note) => {
                    const res = await fetch("/api/concerns/acknowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ concernId, by, note }) });
                    const data = await res.json();
                    if (data.snapshot) refreshSnapshot(data.snapshot);
                  }}
                />
                <TaskList tasks={snapshot.tasks} members={snapshot.members} onUpdate={refreshSnapshot} />
              </div>
            </div>
          )}

          {activeTab === "handoff" && <HandoffPanel handoffs={snapshot.handoffs} careCircleId={snapshot.careCircleId} onUpdate={refreshSnapshot} />}

          {activeTab === "management" && (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-8">
                <FamilyPresencePanel members={snapshot.members} tasks={snapshot.tasks} messages={snapshot.messages} onInvite={async (memberId) => {
                  const res = await fetch("/api/members/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId }) });
                  const data = await res.json();
                  if (data.snapshot) refreshSnapshot(data.snapshot);
                }} />
                <ActivityFeed activity={snapshot.activity} />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <ExportPanel careCircleId={snapshot.careCircleId} onExport={() => {}} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
