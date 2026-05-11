"use client";

import { useState } from "react";
import { authFetch } from "@/lib/supabase/clientAuthFetch";

type WeeklySummaryResponse = {
  html?: string;
  error?: string;
  pdfAvailable?: boolean;
  pdfMessage?: string;
};

export function WeeklySummaryBetaPanel({ careCircleId }: { careCircleId?: string }) {
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const generateWeeklySummary = async () => {
    if (!careCircleId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await authFetch("/api/summaries/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careCircleId }),
      });
      const data = (await res.json()) as WeeklySummaryResponse;
      if (!res.ok) {
        setMessage(data.error || "Weekly summary is not available for this care circle.");
        return;
      }
      setHtml(data.html || null);
      setMessage(data.pdfMessage || "Printable weekly summary is ready.");
    } catch {
      setMessage("Weekly summary could not be generated. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="product-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>Weekly summary beta</p>
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Printable weekly summary</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Generates factual, family-reported counts and notes only. PDF download is not available yet.
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-subtle)" }}>
            CareRelay is for family coordination only and does not provide medical advice. If this is an emergency, call emergency services.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-soft text-sm"
          disabled={!careCircleId || loading}
          onClick={() => void generateWeeklySummary()}
        >
          {loading ? "Generating..." : "Generate printable HTML"}
        </button>
      </div>

      {message && <p className="mt-4 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{message}</p>}
      {html && (
        <details className="mt-4 rounded-2xl border bg-white/70 p-4" style={{ borderColor: "var(--border)" }}>
          <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--text)" }}>
            Preview printable HTML
          </summary>
          <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap text-xs" style={{ color: "var(--text-muted)" }}>
            {html}
          </pre>
        </details>
      )}
    </section>
  );
}
