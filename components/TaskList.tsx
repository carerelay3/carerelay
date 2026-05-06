"use client";

import { useState, useMemo } from "react";
import type { DemoTask, DemoMember } from "@/lib/types";
import type { DemoSnapshot } from "@/lib/demo/types";

const STATUS_STYLES = {
  open: { bg: "rgba(107, 158, 117, 0.1)", color: "#5A8E65", label: "Open" },
  done: { bg: "rgba(90, 158, 122, 0.1)", color: "#4A8E6A", label: "Done" },
  needs_attention: { bg: "rgba(201, 139, 90, 0.1)", color: "#A97B4A", label: "Needs attention" },
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
    <div className="glass">
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Tasks</h3>
          <span className="badge-pill text-[10px]" style={{ background: 'var(--sage-soft)', color: 'var(--sage)' }}>
            {allTasks.filter((i) => i.status === "open").length} open
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
            placeholder="Add a task…"
            className="input-glass flex-1"
          />
          <button type="button" onClick={handleAdd} disabled={!title.trim()} className="btn btn-sage" style={{ padding: '10px 16px' }}>Add</button>
        </div>
      </div>

      {allTasks.length > 0 && (
        <div className="px-5 pb-5 space-y-3">
          {allTasks.map((t) => {
            const st = STATUS_STYLES[t.status];
            return (
              <div key={t.id} className="group rounded-xl p-4 transition-all hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.title}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {t.status !== "done" && (
                      <button type="button" onClick={() => void handleStatus(t.id, "done")} className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Done</button>
                    )}
                    {t.status !== "open" && (
                      <button type="button" onClick={() => void handleStatus(t.id, "open")} className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>Reopen</button>
                    )}
                    {t.status !== "needs_attention" && t.status !== "done" && (
                      <button type="button" onClick={() => void handleStatus(t.id, "needs_attention")} className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>Flag</button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {t.assignedToName ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: 'var(--primary-soft)', color: 'var(--text-secondary)' }}>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {t.assignedToName}
                    </span>
                  ) : (
                    <span className="text-[11px] italic" style={{ color: 'var(--text-subtle)' }}>Not assigned</span>
                  )}
                  {members && members.length > 0 && onUpdate && (
                    <div className="ml-auto flex items-center gap-2">
                      <select value={assignMember[t.id] || ""} onChange={(e) => setAssignMember((prev) => ({ ...prev, [t.id]: e.target.value }))} className="rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text)' }}>
                        <option value="">Reassign…</option>
                        {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                      </select>
                      <button type="button" onClick={() => void handleAssign(t.id)} disabled={!assignMember[t.id]} className="rounded-md px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>Assign</button>
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
