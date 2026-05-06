"use client";

import { useState } from "react";

const categoryLabel: Record<string, string> = {
  medication: "Medication confirmation log",
  appointment: "Appointment",
  task: "Task",
  supply: "Supply / errand",
  general_update: "General update",
  concern: "Flagged wording (family awareness)",
};

export function DemoMessageTester() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | Record<string, unknown>>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/messages/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Enter a message to parse.");
        return;
      }
      setResult(data.result as Record<string, unknown>);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const cat = result?.category as string | undefined;
  const concern = Boolean(result?.concernFlag);

  return (
    <div className="glass">
      <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Try your own message</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Uses the same rules as live SMS. Nothing here is medical advice.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-glass min-w-[200px] flex-1"
            placeholder="Example: Task: pick up prescription tomorrow"
            aria-label="Message to parse"
          />
          <button
            type="button"
            onClick={() => void run()}
            disabled={loading}
            className="btn btn-primary text-sm"
            style={{ padding: '10px 20px' }}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Parsing…
              </>
            ) : (
              "Parse"
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 rounded-lg p-3 text-sm" style={{ background: 'var(--error-soft)', color: 'var(--error)' }}>{error}</p>
        )}
        {result && (
          <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)' }}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Category</span>
                <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{cat ? categoryLabel[cat] || cat : "—"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Extracted</span>
                <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>{String(result.extractedTitle ?? "")}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Record type</span>
                <p className="mt-1 font-medium" style={{ color: 'var(--text)' }}>
                  {String((result.suggestedRecord as { type?: string })?.type ?? "note")}
                </p>
              </div>
            </div>
            {concern && (
              <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--error-soft)', border: '1px solid rgba(196,107,107,0.2)' }}>
                <div className="flex items-start gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="var(--error)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs" style={{ color: 'var(--error)' }}>
                    Flagged wording: Families often want to compare notes. CareRelay does not provide medical advice. For
                    emergencies, call 911 or your local emergency number.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
