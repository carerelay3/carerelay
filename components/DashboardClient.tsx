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

type TabKey = "timeline" | "today" | "needs_attention" | "family" | "activity" | "handoff" | "export";

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
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {stats.map((s, i) => (
        <div key={i} className="glass flex-shrink-0 flex items-center gap-4 px-5 py-4 min-w-[160px]">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ background: s.glow }}>
            <svg className="h-6 w-6" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-muted)" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke={s.color} strokeWidth="3" strokeDasharray={`${Math.min(s.value * 12, 100)} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
            </svg>
            <span className="absolute text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{s.label}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {s.label === "Concerns" && s.value > 0 ? `${s.value} need review` : s.value === 0 ? "All clear" : `${s.value} today`}
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
  const [activeTab, setActiveTab] = useState<TabKey>("timeline");
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
    { key: "timeline", label: "Timeline" },
    { key: "today", label: "Today" },
    { key: "needs_attention", label: "Needs Attention", badge: snapshot.concerns.filter(c => !c.acknowledged).length + snapshot.tasks.filter(t => t.status === "needs_attention" || (t.status === "open" && !t.assignedTo)).length + snapshot.supplies.filter(s => s.status === "needed").length },
    { key: "family", label: "Family" },
    { key: "activity", label: "Activity" },
    { key: "handoff", label: "Handoff" },
    { key: "export", label: "Export" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      {/* Header — Mission Control */}
      <div className="glass-strong p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-20 blur-[80px]" style={{ background: 'var(--sage)' }} />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full opacity-15 blur-[80px]" style={{ background: 'var(--blue-soft)' }} />

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-lg font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, var(--sage), var(--blue-soft))' }}>
                {snapshot.recipientName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>{snapshot.careCircleName}</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Caring for <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{snapshot.recipientName}</span></p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass px-4 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Shared line</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums" style={{ color: 'var(--sage)' }}>{formatUsPhoneDisplay(snapshot.sharedPhone)}</p>
            </div>
            <ModeBadge mode={mode} />
          </div>
        </div>
      </div>

      {/* Emergency disclaimer */}
      <div className="rounded-2xl p-4 text-xs text-center" style={{ background: 'linear-gradient(135deg, var(--error-soft), rgba(196,107,107,0.04))', border: '1px solid rgba(196,107,107,0.15)', color: 'var(--error)' }}>
        Do not use CareRelay for emergencies. Call 911. CareRelay does not provide medical advice.
      </div>

      {showOnboarding && <OnboardingGuide onDismiss={() => setShowOnboarding(false)} />}

      {/* Today Pulse */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-subtle)' }}>Today</h2>
        <TodayPulse snapshot={snapshot} />
      </section>

      {/* Simulate message — Floating input */}
      <div className="glass p-5">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="input-glass flex-shrink-0 w-auto"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
          >
            {snapshot.members.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }}
            placeholder="Type a family message..."
            className="input-glass flex-1 min-w-[200px]"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading || !body.trim()}
            className="btn btn-sage flex-shrink-0"
            style={{ padding: '10px 20px' }}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.key ? 'var(--primary)' : 'var(--glass-bg)',
              color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
              backdropFilter: activeTab !== tab.key ? 'blur(12px)' : 'none',
              border: activeTab !== tab.key ? '1px solid var(--glass-border)' : 'none',
              boxShadow: activeTab === tab.key ? '0 4px 16px rgba(45,43,40,0.25)' : 'var(--shadow-sm)',
            }}
          >
            {tab.label}
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--error)', padding: '0 6px' }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "timeline" && (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <MessageFeed messages={snapshot.messages} members={snapshot.members} getAvatarColor={getAvatarColor} />
          </div>
          <div className="lg:col-span-5 space-y-6">
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

      {activeTab === "today" && (
        <div className="space-y-6">
          <TodayPulse snapshot={snapshot} />
          <MessageFeed messages={snapshot.messages.filter((m) => { const d = new Date(m.createdAt); const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); })} members={snapshot.members} getAvatarColor={getAvatarColor} />
        </div>
      )}

      {activeTab === "needs_attention" && (
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
      )}

      {activeTab === "family" && (
        <FamilyPresencePanel members={snapshot.members} tasks={snapshot.tasks} messages={snapshot.messages} onInvite={async (memberId) => {
          const res = await fetch("/api/members/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId }) });
          const data = await res.json();
          if (data.snapshot) refreshSnapshot(data.snapshot);
        }} />
      )}

      {activeTab === "activity" && <ActivityFeed activity={snapshot.activity} />}

      {activeTab === "handoff" && <HandoffPanel handoffs={snapshot.handoffs} careCircleId={snapshot.careCircleId} onUpdate={refreshSnapshot} />}

      {activeTab === "export" && <ExportPanel careCircleId={snapshot.careCircleId} onExport={() => {}} />}
    </main>
  );
}
