"use client";

import { useState } from "react";
import type { DemoConcern, DemoTask, DemoSupply, DemoAppointment, DemoMember } from "@/lib/types";
import type { DemoSnapshot } from "@/lib/demo/types";

export function NeedsAttentionPanel({
  concerns,
  tasks,
  supplies,
  appointments,
  onAcknowledge,
  onUpdate,
  members,
}: {
  concerns: DemoConcern[];
  tasks: DemoTask[];
  supplies: DemoSupply[];
  appointments: DemoAppointment[];
  onAcknowledge: (concernId: string, by: string, note?: string) => void;
  onUpdate: (snapshot: DemoSnapshot) => void;
  members: DemoMember[];
}) {
  const unacknowledged = concerns.filter((c) => !c.acknowledged);
  const openUnassigned = tasks.filter((t) => t.status === "open" && !t.assignedTo);
  const needsAttentionTasks = tasks.filter((t) => t.status === "needs_attention");
  const neededSupplies = supplies.filter((s) => s.status === "needed");
  const unconfirmedAppts = appointments.filter((a) => !a.transportationConfirmed);
  const [assignMember, setAssignMember] = useState<Record<string, string>>({});

  const handleAssign = async (taskId: string) => {
    const memberId = assignMember[taskId];
    if (!memberId) return;
    const member = members.find((m) => m.id === memberId);
    const res = await fetch("/api/tasks/assign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, memberId, memberName: member?.name }) });
    const data = await res.json();
    if (data.snapshot) onUpdate(data.snapshot);
  };

  const handleTaskStatus = async (taskId: string, status: "open" | "done" | "needs_attention") => {
    const res = await fetch("/api/tasks/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, status, by: "Coordinator" }) });
    const data = await res.json();
    if (data.snapshot) onUpdate(data.snapshot);
  };

  const handleSupplyStatus = async (supplyId: string, status: "needed" | "purchased" | "delivered") => {
    const res = await fetch("/api/supplies/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplyId, status, by: "Coordinator" }) });
    const data = await res.json();
    if (data.snapshot) onUpdate(data.snapshot);
  };

  return (
    <div className="space-y-6">
      {unacknowledged.length > 0 && (
        <div className="alert-glass p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--error-soft)' }}>
              <svg className="h-5 w-5" fill="none" stroke="var(--error)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--error)] opacity-40"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--error)]"></span></span>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--error)' }}>{unacknowledged.length} concern{unacknowledged.length > 1 ? "s" : ""} to review</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {unacknowledged.map((c) => (
              <li key={c.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(196,107,107,0.12)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{c.text}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>{new Date(c.createdAt).toLocaleString()}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => onAcknowledge(c.id, "Coordinator", undefined)} className="btn text-xs text-white" style={{ background: 'var(--success)', padding: '6px 14px' }}>Acknowledge</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {openUnassigned.length > 0 && (
        <div className="glass p-5">
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Unassigned tasks</h3>
          <div className="space-y-2">
            {openUnassigned.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.title}</span>
                <div className="ml-auto flex gap-2">
                  <select value={assignMember[t.id] || ""} onChange={(e) => setAssignMember((prev) => ({ ...prev, [t.id]: e.target.value }))} className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text)' }}>
                    <option value="">Assign…</option>
                    {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                  <button type="button" onClick={() => void handleAssign(t.id)} disabled={!assignMember[t.id]} className="rounded-lg px-3 py-1 text-xs font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>Assign</button>
                  <button type="button" onClick={() => void handleTaskStatus(t.id, "done")} className="rounded-lg px-3 py-1 text-xs font-medium" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Done</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {needsAttentionTasks.length > 0 && (
        <div className="glass p-5" style={{ border: '1px solid var(--warning-soft)' }}>
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--warning)' }}>Tasks needing attention</h3>
          <div className="space-y-2">
            {needsAttentionTasks.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl p-3" style={{ background: 'var(--warning-soft)', border: '1px solid rgba(201,139,90,0.15)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.title}</span>
                {t.assignedToName && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.assignedToName}</span>}
                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={() => void handleTaskStatus(t.id, "open")} className="rounded-lg px-3 py-1 text-xs font-medium" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>Reopen</button>
                  <button type="button" onClick={() => void handleTaskStatus(t.id, "done")} className="rounded-lg px-3 py-1 text-xs font-medium" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Done</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {neededSupplies.length > 0 && (
        <div className="glass p-5">
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Supplies still needed</h3>
          <div className="space-y-2">
            {neededSupplies.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.item}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void handleSupplyStatus(s.id, "purchased")} className="rounded-lg px-3 py-1 text-xs font-medium" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>Bought</button>
                  <button type="button" onClick={() => void handleSupplyStatus(s.id, "delivered")} className="rounded-lg px-3 py-1 text-xs font-medium" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Delivered</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unconfirmedAppts.length > 0 && (
        <div className="glass p-5">
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Appointments without transportation</h3>
          <div className="space-y-2">
            {unconfirmedAppts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{a.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(a.at).toLocaleString()}</p>
                </div>
                <span className="badge-pill text-[10px]" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>No driver</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unacknowledged.length === 0 && openUnassigned.length === 0 && needsAttentionTasks.length === 0 && neededSupplies.length === 0 && unconfirmedAppts.length === 0 && (
        <div className="glass p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--success-soft)' }}>
            <svg className="h-7 w-7" fill="none" stroke="var(--success)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Everything looks clear</h3>
          <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>No unreviewed concerns, unassigned tasks, or needed supplies right now.</p>
        </div>
      )}
    </div>
  );
}
