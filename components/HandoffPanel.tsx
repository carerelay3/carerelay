"use client";

import { useState } from "react";
import type { DemoHandoff } from "@/lib/types";
import type { DemoSnapshot } from "@/lib/demo/types";

export function HandoffPanel({
  handoffs,
  careCircleId,
  onUpdate,
}: {
  handoffs: DemoHandoff[];
  careCircleId: string;
  onUpdate: (snapshot: DemoSnapshot) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/handoffs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careCircleId }),
      });
      const data = await res.json();
      if (!res.ok) { setError("Could not generate handoff."); return; }
      if (data.snapshot) onUpdate(data.snapshot);
    } catch { setError("Network error.");
    } finally { setGenerating(false); }
  };

  const review = async (handoffId: string) => {
    const res = await fetch("/api/handoffs/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handoffId }) });
    const data = await res.json();
    if (data.snapshot) onUpdate(data.snapshot);
  };

  const copy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-8">
      <div className="glass-elevated p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'var(--sage-glow)' }} />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Daily Handoff</h3>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>A calm summary for the next caregiver on duty.</p>
          </div>
          <button type="button" onClick={() => void generate()} disabled={generating} className="btn btn-sage text-base font-bold shadow-md w-full sm:w-auto" style={{ padding: '12px 24px' }}>
            {generating ? "Generating…" : "Generate handoff"}
          </button>
        </div>
        {error && <p className="mt-4 text-sm font-semibold relative z-10" style={{ color: 'var(--error)' }}>{error}</p>}
      </div>

      {handoffs.length === 0 && (
        <div className="glass-elevated p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at center, var(--sage-soft), transparent 60%)' }} />
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
             <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--bg-subtle)] shadow-sm">
              <svg className="h-8 w-8 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No handoffs yet. Click &quot;Generate handoff&quot; to create the first one.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {handoffs.map((h) => (
          <div key={h.id} className="glass-elevated relative overflow-hidden transition-transform hover:-translate-y-1" style={h.reviewed ? { border: '1px solid var(--success-soft)' } : { border: '1px solid var(--sage-soft)', boxShadow: '0 8px 32px rgba(107, 158, 117, 0.1)' }}>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: h.reviewed ? 'var(--success-soft)' : 'var(--sage-soft)' }}>
                    <svg className="h-5 w-5" fill="none" stroke={h.reviewed ? 'var(--success)' : 'var(--sage)'} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                      {new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    {h.reviewed && <span className="badge-pill text-[10px] mt-1" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Reviewed Summary</span>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => copy(h.summaryText, h.id)} className="btn btn-soft text-xs font-bold" style={{ padding: '8px 16px' }}>
                    {copiedId === h.id ? "Copied!" : "Copy Text"}
                  </button>
                  {!h.reviewed && (
                    <button type="button" onClick={() => void review(h.id)} className="btn text-xs font-bold text-white shadow-sm" style={{ background: 'var(--success)', padding: '8px 16px' }}>
                      Mark Reviewed
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl p-6 relative" style={{ background: 'var(--bg)', border: '1px solid var(--glass-border)' }}>
                {/* Editoral serif feel for summary text */}
                <pre className="whitespace-pre-wrap text-[15px] leading-relaxed font-sans" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-sans)' }}>
                  {h.summaryText}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
