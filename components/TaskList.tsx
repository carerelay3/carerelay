"use client";

import { useState, useMemo } from "react";
import type { DemoTask, DemoMember } from "@/lib/types";
import type { DemoSnapshot } from "@/lib/demo/types";

const STATUS_STYLES = {
  open: { bg: "rgba(107, 158, 117, 0.12)", color: "#4A8E6A", label: "Open" },
  done: { bg: "rgba(90, 158, 122, 0.12)", color: "#3A7E5A", label: "Done" },
  needs_attention: { bg: "rgba(201, 139, 90, 0.12)", color: "#B96B3A", label: "Needs attention" },
};

export function TaskList({ tasks, members, onUpdate }: { tasks: DemoTask[]; members?: DemoMember[]; onUpdate?: (snapshot: DemoSnapshot) => void }) {
  const [title, setTitle] = useState("");
  const [assignMember, setAssignMember] = useState<Record<string, string>>({});
  const [extraTasks, setExtraTasks] = useState<DemoTask[]>([]);

  const allTasks = useMemo(() => {
    const map = new Map<string, DemoTask>();
    for (const t of extraTasks) map.set(t.id, t);
    for (const t of tasks) map.set(t.id, t);
    return Array.from(map.values());
  }, [extraTasks, tasks]);

  const handleStatus = async (taskId: string, status: "open" | "done" | "needs_attention") => {
    if (onUpdate) {
      const res = await fetch("/api/tasks/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, status, by: "Coordinator" }) });
      const data = await res.json();
      if (data.snapshot) onUpdate(data.snapshot);
    } else { setExtraTasks(extraTasks.map((x) => (x.id === taskId ? { ...x, status } : x))); }
  };

  const handleAssign = async (taskId: string) => {
    const memberId = assignMember[taskId];
    if (!memberId || !onUpdate) return;
    const member = members?.find((m) => m.id === memberId);
    const res = await fetch("/api/tasks/assign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, memberId, memberName: member?.name }) });
    const data = await res.json();
    if (data.snapshot) onUpdate(data.snapshot);
  };

  const handleAdd = () => {
    const t = title.trim();
    if (!t) return;
    setExtraTasks([{ id: `local-${Date.now()}`, title: t, status: "open", createdAt: new Date().toISOString() }, ...extraTasks]);
    setTitle("");
  };

  return (
    <div className="glass-elevated relative overflow-hidden">
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--sage)' }} />
      
      <div className="p-6 sm:p-8 border-b relative z-10" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Tasks</h3>
          <span className="badge-pill text-xs shadow-sm" style={{ background: 'var(--sage-soft)', color: 'var(--sage)' }}>
            {allTasks.filter((i) => i.status === "open").length} open
          </span>
        </div>

        <div className="flex gap-3 mt-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
            placeholder="Add a new task…"
            className="input-glass flex-1 font-medium"
            style={{ padding: '12px 16px' }}
          />
          <button type="button" onClick={handleAdd} disabled={!title.trim()} className="btn btn-sage font-bold" style={{ padding: '12px 24px' }}>Add</button>
        </div>
      </div>

      {allTasks.length > 0 && (
        <div className="p-6 sm:p-8 space-y-4 relative z-10">
          {allTasks.map((t) => {
            const st = STATUS_STYLES[t.status];
            return (
              <div key={t.id} className="group rounded-2xl p-5 sm:p-6 transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)' }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <span className="text-base font-semibold leading-tight pt-0.5" style={{ color: 'var(--text)' }}>{t.title}</span>
                  </div>
                  <div className="flex gap-2">
                    {t.status !== "done" && (
                      <button type="button" onClick={() => void handleStatus(t.id, "done")} className="rounded-xl px-3 py-2 text-xs font-bold transition-transform hover:scale-105" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Mark Done</button>
                    )}
                    {t.status !== "open" && (
                      <button type="button" onClick={() => void handleStatus(t.id, "open")} className="rounded-xl px-3 py-2 text-xs font-bold transition-transform hover:scale-105" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>Reopen</button>
                    )}
                    {t.status !== "needs_attention" && t.status !== "done" && (
                      <button type="button" onClick={() => void handleStatus(t.id, "needs_attention")} className="rounded-xl px-3 py-2 text-xs font-bold transition-transform hover:scale-105" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>Flag</button>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Assigned to:</span>
                    {t.assignedToName ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'var(--blue-glow)', color: 'var(--blue-soft)' }}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {t.assignedToName}
                      </span>
                    ) : (
                      <span className="text-xs italic font-medium" style={{ color: 'var(--text-subtle)' }}>Unassigned</span>
                    )}
                  </div>
                  
                  {members && members.length > 0 && onUpdate && (
                    <div className="flex items-center gap-2">
                      <select value={assignMember[t.id] || ""} onChange={(e) => setAssignMember((prev) => ({ ...prev, [t.id]: e.target.value }))} className="input-glass text-xs font-medium" style={{ padding: '6px 12px', minWidth: '120px' }}>
                        <option value="">Reassign…</option>
                        {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                      </select>
                      <button type="button" onClick={() => void handleAssign(t.id)} disabled={!assignMember[t.id]} className="btn btn-primary text-xs" style={{ padding: '6px 14px' }}>Assign</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
