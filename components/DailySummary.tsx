"use client";

import { useState } from "react";
import { DemoSnapshot } from "@/lib/types";
import { authFetch } from "@/lib/supabase/clientAuthFetch";

export function DailySummary({ snapshot }: { snapshot: DemoSnapshot }) {
  const [summary, setSummary] = useState<string | null>(snapshot.dailySummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const medsCount = snapshot.messages.filter(m => m.category === 'medication').length;
  const openTasks = snapshot.tasks.filter(t => t.status === 'open').length;
  const concerns = snapshot.concerns.length;
  const upcomingAppointments = snapshot.appointments.length;

  const handleGenerate = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await authFetch("/api/summaries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careCircleId: snapshot.careCircleId, type: "daily" })
      });
      const data = await res.json();
      if (data.summaryText) {
        setSummary(data.summaryText);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="product-card p-5 sm:p-6">
      <div className="relative z-10 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>Daily summary</p>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Today&apos;s family summary</h2>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="btn btn-soft text-xs"
        >
          {loading ? "Generating..." : "Generate summary"}
        </button>
      </div>
      
      <p className="text-xs text-slate-500 italic">
        Based on family-reported updates. CareRelay organizes messages for family coordination only and does not provide medical advice, monitoring, or emergency services.
      </p>

      {error && (
        <p className="text-xs text-red-500 font-medium">Failed to generate summary. Please try again.</p>
      )}

      {summary ? (
        <div className="mt-2 rounded-3xl border bg-white/75 p-4 text-sm shadow-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <p>{summary}</p>
        </div>
      ) : (
        <div className="rounded-3xl border bg-white/75 p-4 text-sm shadow-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <p className="font-semibold" style={{ color: "var(--text)" }}>Today&apos;s organized notes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>{medsCount}</strong> medication confirmation(s) logged</li>
            <li><strong>{openTasks}</strong> task(s) currently open</li>
            <li><strong>{upcomingAppointments}</strong> upcoming appointment(s)</li>
            <li><strong>{concerns}</strong> concern(s) for family review</li>
            <li><strong>{snapshot.supplies.length}</strong> supply item(s) tracked</li>
          </ul>
          <p className="mt-4">
            Everything seems up to date. Remember to check open tasks and see if anyone needs help with groceries.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
