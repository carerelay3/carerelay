"use client";

import { useState } from "react";
import { DemoSnapshot } from "@/lib/types";

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
      const res = await fetch("/api/summaries/generate", {
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
    } catch(e) {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 glass-elevated p-6 rounded-2xl shadow-sm bg-blue-50/30 border border-blue-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-800">Today's Family Summary</h2>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate AI Summary"}
        </button>
      </div>
      
      <p className="text-xs text-slate-500 italic">
        Based on family-reported updates. CareRelay organizes messages but does not provide medical advice or emergency monitoring.
      </p>

      {error && (
        <p className="text-xs text-red-500 font-medium">Failed to generate summary. Please try again.</p>
      )}

      {summary ? (
        <div className="prose prose-sm text-slate-700 mt-2 p-4 bg-white rounded-xl border border-blue-50 shadow-sm">
          <p>{summary}</p>
        </div>
      ) : (
        <div className="prose prose-sm text-slate-700">
          <p>Today's organized notes:</p>
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
  );
}