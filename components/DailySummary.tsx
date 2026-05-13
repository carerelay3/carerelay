"use client";

import { useState } from "react";
import { DemoSnapshot } from "@/lib/types";
import { authFetch } from "@/lib/supabase/clientAuthFetch";
import { normalizeCircleType, isCareMode } from "@/lib/circles/circleTypes";

const summaryLabels = {
  care: {
    title: "Today's family summary",
    note: "Based on family-reported updates. CircleRelay Care Mode organizes messages for family coordination only and does not provide medical advice, monitoring, or emergency services.",
    firstMetric: "medication confirmation(s) logged",
    appointmentMetric: "upcoming appointment(s)",
    flaggedMetric: "concern(s) for family review",
    closing: "Everything seems up to date. Remember to check open tasks and see if anyone needs help with groceries.",
  },
  family: {
    title: "Today's family summary",
    note: "Based on family updates, chores, errands, appointments, groceries, school notes, reminders, and summaries.",
    firstMetric: "reminder(s) or update(s) logged",
    appointmentMetric: "appointment(s)",
    flaggedMetric: "school note(s) or important update(s)",
    closing: "Everything seems up to date. Check open chores, errands, groceries, and reminders.",
  },
  household: {
    title: "Today's household summary",
    note: "Based on household chores, groceries, bills, maintenance, supplies, house updates, and summaries.",
    firstMetric: "house update(s) logged",
    appointmentMetric: "maintenance item(s)",
    flaggedMetric: "reminder(s) or house update(s)",
    closing: "Everything seems up to date. Check chores, supplies, bills, and maintenance items.",
  },
  team: {
    title: "Today's team summary",
    note: "Based on practices, games/events, rides, equipment, announcements, volunteer tasks, reminders, and summaries.",
    firstMetric: "announcement(s) or reminder(s) logged",
    appointmentMetric: "game/event item(s)",
    flaggedMetric: "volunteer or reminder item(s)",
    closing: "Everything seems up to date. Check practices, games/events, rides, equipment, and volunteer tasks.",
  },
  group: {
    title: "Today's group summary",
    note: "Based on events, tasks, supplies, announcements, votes/decisions, responsibilities, reminders, and summaries.",
    firstMetric: "announcement(s) or decision item(s) logged",
    appointmentMetric: "event item(s)",
    flaggedMetric: "responsibility or reminder item(s)",
    closing: "Everything seems up to date. Check events, tasks, supplies, decisions, and responsibilities.",
  },
} as const;

export function DailySummary({ snapshot }: { snapshot: DemoSnapshot }) {
  const [summary, setSummary] = useState<string | null>(snapshot.dailySummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const circleType = normalizeCircleType(snapshot.circleType);
  const careMode = isCareMode(circleType);
  const labels = summaryLabels[circleType];
  const visibleSummary = careMode ? summary : null;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>Daily summary</p>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{labels.title}</h2>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="btn btn-soft w-full text-xs sm:w-auto"
        >
          {loading ? "Generating..." : "Generate summary"}
        </button>
      </div>
      
      <p className="text-xs text-slate-500 italic">
        {labels.note}
      </p>

      {error && (
        <p className="text-xs text-red-500 font-medium">Failed to generate summary. Please try again.</p>
      )}

      {visibleSummary ? (
        <div className="mt-2 rounded-3xl border bg-white/75 p-4 text-sm shadow-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <p>{visibleSummary}</p>
        </div>
      ) : (
        <div className="rounded-3xl border bg-white/75 p-4 text-sm shadow-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <p className="font-semibold" style={{ color: "var(--text)" }}>Today&apos;s organized notes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>{careMode ? medsCount : todayUpdates(snapshot)}</strong> {labels.firstMetric}</li>
            <li><strong>{openTasks}</strong> task(s) currently open</li>
            <li><strong>{upcomingAppointments}</strong> {labels.appointmentMetric}</li>
            <li><strong>{concerns}</strong> {labels.flaggedMetric}</li>
            <li><strong>{snapshot.supplies.length}</strong> supply item(s) tracked</li>
          </ul>
          <p className="mt-4">
            {labels.closing}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

function todayUpdates(snapshot: DemoSnapshot) {
  const today = new Date();
  return snapshot.messages.filter((message) => {
    const date = new Date(message.createdAt);
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).length;
}
