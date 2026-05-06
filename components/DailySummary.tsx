"use client";

import { useState } from "react";

export function DailySummary({ careCircleId }: { careCircleId: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summaries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careCircleId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError("Summary could not be generated."); setText(""); return; }
      setText(data.summaryText || "No summary text returned.");
    } catch { setError("Network error."); setText("");
    } finally { setLoading(false); }
  };

  return (
    <div className="glass">
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Daily family summary</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Coordination only, not medical guidance.</p>
          </div>
          <button type="button" onClick={() => void generate()} disabled={loading} className="btn btn-sage text-xs" style={{ padding: '8px 16px' }}>
            {loading ? "Generating…" : "Create summary"}
          </button>
        </div>
        {error && <p className="mt-3 rounded-lg p-3 text-sm" style={{ background: 'var(--error-soft)', color: 'var(--error)' }}>{error}</p>}
        <div className="mt-4 rounded-xl p-4 text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
          {loading ? "Generating summary…" : text || "Pulls together what the family shared today—completed tasks, what is still open, and what is coming up."}
        </div>
      </div>
    </div>
  );
}
