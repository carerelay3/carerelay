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
    <div className="space-y-8 max-w-4xl mx-auto">
      {unacknowledged.length > 0 && (
        <div className="alert-glass p-6 sm:p-8 relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: 'var(--error)' }} />
          <div className="relative z-10 flex flex-wrap items-start sm:items-center justify-between gap-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-[1.25rem]" style={{ background: 'var(--error-soft)', boxShadow: '0 4px 16px rgba(196,107,107,0.2)' }}>
                <svg className="h-6 w-6" fill="none" stroke="var(--error)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--error)] opacity-60"></span><span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--error)] border-2 border-white"></span></span>
              </div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--error)' }}>{unacknowledged.length} concern{unacknowledged.length > 1 ? "s" : ""} to review</h3>
            </div>
          </div>
          <ul className="relative z-10 space-y-3">
            {unacknowledged.map((c) => (
              <li key={c.id} className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid rgba(196,107,107,0.2)' }}>
                <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>{c.text}</p>
                <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>{new Date(c.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => onAcknowledge(c.id, "Coordinator", undefined)} className="btn text-sm font-bold shadow-sm" style={{ background: 'var(--success)', color: 'white', padding: '10px 20px' }}>Acknowledge</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {openUnassigned.length > 0 && (
        <div className="glass-elevated p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)' }}>Unassigned tasks</h3>
          <div className="space-y-3">
            {openUnassigned.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl p-4 sm:p-5 transition-transform hover:-translate-y-1" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t.title}</span>
                <div className="sm:ml-auto flex flex-wrap gap-3">
                  <select value={assignMember[t.id] || ""} onChange={(e) => setAssignMember((prev) => ({ ...prev, [t.id]: e.target.value }))} className="input-glass text-xs font-medium w-full sm:w-auto" style={{ padding: '8px 12px', minWidth: '120px' }}>
                    <option value="">Assign…</option>
                    {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                  <button type="button" onClick={() => void handleAssign(t.id)} disabled={!assignMember[t.id]} className="btn btn-primary text-xs font-bold flex-1 sm:flex-none" style={{ padding: '8px 16px' }}>Assign</button>
                  <button type="button" onClick={() => void handleTaskStatus(t.id, "done")} className="rounded-xl px-4 py-2 text-xs font-bold flex-1 sm:flex-none text-center" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Done</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {needsAttentionTasks.length > 0 && (
        <div className="glass-elevated p-6 sm:p-8 relative overflow-hidden" style={{ border: '1px solid rgba(201,139,90,0.3)' }}>
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'var(--warning)' }} />
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 relative z-10" style={{ color: 'var(--warning)' }}>Tasks needing attention</h3>
          <div className="space-y-3 relative z-10">
            {needsAttentionTasks.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl p-4 sm:p-5" style={{ background: 'var(--warning-soft)', border: '1px solid rgba(201,139,90,0.2)' }}>
                <div>
                  <span className="text-base font-semibold block" style={{ color: 'var(--text)' }}>{t.title}</span>
                  {t.assignedToName && <span className="text-xs font-medium inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.4)', color: 'var(--text-secondary)' }}>{t.assignedToName}</span>}
                </div>
                <div className="sm:ml-auto flex gap-3">
                  <button type="button" onClick={() => void handleTaskStatus(t.id, "open")} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: 'white', color: 'var(--info)', boxShadow: 'var(--shadow-sm)' }}>Reopen</button>
                  <button type="button" onClick={() => void handleTaskStatus(t.id, "done")} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: 'var(--success)', color: 'white', boxShadow: '0 4px 12px rgba(90,158,122,0.3)' }}>Done</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {neededSupplies.length > 0 && (
        <div className="glass-elevated p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)' }}>Supplies still needed</h3>
          <div className="space-y-3">
            {neededSupplies.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 sm:p-5 transition-transform hover:-translate-y-1" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>{s.item}</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => void handleSupplyStatus(s.id, "purchased")} className="rounded-xl px-4 py-2 text-xs font-bold flex-1 sm:flex-none text-center" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>Bought</button>
                  <button type="button" onClick={() => void handleSupplyStatus(s.id, "delivered")} className="rounded-xl px-4 py-2 text-xs font-bold flex-1 sm:flex-none text-center" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Delivered</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unconfirmedAppts.length > 0 && (
        <div className="glass-elevated p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)' }}>Appointments without transportation</h3>
          <div className="space-y-3">
            {unconfirmedAppts.map((a) => (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 sm:p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div>
                  <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{a.title}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-subtle)' }}>{new Date(a.at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <span className="badge-pill px-3 py-1.5 shadow-sm" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>No driver confirmed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unacknowledged.length === 0 && openUnassigned.length === 0 && needsAttentionTasks.length === 0 && neededSupplies.length === 0 && unconfirmedAppts.length === 0 && (
        <div className="glass-elevated p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at center, var(--success-soft), transparent 60%)' }} />
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--success-soft)] shadow-sm">
              <svg className="h-8 w-8 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Everything looks clear</h3>
            <p className="text-sm max-w-sm mx-auto font-medium" style={{ color: 'var(--text-muted)' }}>No unreviewed concerns, unassigned tasks, or needed supplies right now. Enjoy the calm.</p>
          </div>
        </div>
      )}
    </div>
  );
}
