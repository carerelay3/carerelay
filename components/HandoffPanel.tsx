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
    <div className="space-y-6">
      <div className="glass p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Daily Handoff</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>A calm summary for the next caregiver on duty.</p>
          </div>
          <button type="button" onClick={() => void generate()} disabled={generating} className="btn btn-sage" style={{ padding: '10px 20px' }}>
            {generating ? "Generating…" : "Generate handoff"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
      </div>

      {handoffs.length === 0 && (
        <div className="glass p-10 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No handoffs yet. Click &quot;Generate handoff&quot; to create the first one.</p>
        </div>
      )}

      {handoffs.map((h) => (
        <div key={h.id} className="glass relative overflow-hidden" style={h.reviewed ? { border: '1px solid var(--success-soft)' } : {}}>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold" style={{ color: 'var(--text)' }}>{new Date(h.date).toLocaleDateString()}</h4>
                {h.reviewed && <span className="badge-pill text-[10px]" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Reviewed</span>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => copy(h.summaryText, h.id)} className="btn btn-soft text-xs" style={{ padding: '6px 12px' }}>
                  {copiedId === h.id ? "Copied" : "Copy"}
                </button>
                {!h.reviewed && (
                  <button type="button" onClick={() => void review(h.id)} className="btn text-xs text-white" style={{ background: 'var(--success)', padding: '6px 12px' }}>Mark reviewed</button>
                )}
              </div>
            </div>
          </div>
          <div className="border-t p-5" style={{ borderColor: 'var(--glass-border)' }}>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>{h.summaryText}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}
