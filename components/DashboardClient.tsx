"use client";

import { useState } from "react";
import { DemoSnapshot, CareCategory } from "@/lib/types";
import { ModeBadge } from "./ModeBadge";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { DashboardOverviewCards } from "./DashboardOverviewCards";
import { MessageFeed } from "./MessageFeed";
import { MedicationLog } from "./MedicationLog";
import { AppointmentList } from "./AppointmentList";
import { TaskList } from "./TaskList";
import { SupplyList } from "./SupplyList";
import { ConcernPanel } from "./ConcernPanel";
import { DailySummary } from "./DailySummary";
import { DemoMessageTester } from "./DemoMessageTester";
import { CareCircleSwitcher } from "./CareCircleSwitcher";
import { MultipleRecipientsNotice } from "./MultipleRecipientsNotice";
import { WeeklySummaryBetaPanel } from "./WeeklySummaryBetaPanel";

export function DashboardClient({
  initialSnapshot,
  initialMode,
  careCircles = [],
}: {
  initialSnapshot: DemoSnapshot;
  initialMode: "demo" | "live";
  careCircles?: Array<{ id: string; name: string }>;
}) {
  const [snapshot, setSnapshot] = useState<DemoSnapshot>(initialSnapshot);

  const handleNewMockMessage = (body: string, category: CareCategory, concernFlag: boolean) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "Demo User",
      fromPhone: "+15551234567",
      toPhone: "+15559990000",
      body,
      createdAt: new Date().toISOString(),
      category,
      confidence: 0.9,
      concernFlag,
    };

    setSnapshot(prev => {
      const updated = { ...prev, messages: [newMessage, ...prev.messages] };
      
      if (category === "task") {
        updated.tasks = [{ id: `task-${Date.now()}`, title: body, status: "open", createdAt: new Date().toISOString() }, ...prev.tasks];
      } else if (category === "supply") {
        updated.supplies = [{ id: `sup-${Date.now()}`, item: body, status: "needed" }, ...prev.supplies];
      } else if (category === "appointment") {
        updated.appointments = [{ id: `appt-${Date.now()}`, title: body, at: new Date(Date.now() + 86400000).toISOString(), transportationConfirmed: false }, ...prev.appointments];
      }
      
      if (concernFlag || category === "concern") {
        updated.concerns = [{ id: `concern-${Date.now()}`, text: body, createdAt: new Date().toISOString(), acknowledged: false }, ...prev.concerns];
      }

      return updated;
    });
  };

  return (
    <div className="min-h-screen pb-20 font-sans">
      <header className="sticky top-[65px] z-40 border-y px-4 py-4 backdrop-blur-xl sm:px-6" style={{ background: "rgba(251,250,247,0.82)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--text)" }}>Family command center</h1>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                Selected care circle: <span style={{ color: "var(--text)" }}>{snapshot.careCircleName || "Care circle"}</span>
              </p>
            </div>
            <ModeBadge mode={initialMode} />
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <CareCircleSwitcher circles={careCircles} selectedCareCircleId={snapshot.careCircleId} />
            <div className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
              Shared line: {snapshot.sharedPhone || "Connect Twilio to enable live SMS"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <DisclaimerBanner />
        {initialMode === "live" && <MultipleRecipientsNotice />}
        
        <DashboardOverviewCards snapshot={snapshot} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {initialMode === "demo" && <DemoMessageTester onSend={handleNewMockMessage} />}
            <DailySummary snapshot={snapshot} />
            {initialMode === "live" && <WeeklySummaryBetaPanel careCircleId={snapshot.careCircleId} />}
            <MessageFeed messages={snapshot.messages} mode={initialMode} />
          </div>

          <div className="space-y-8">
            <ConcernPanel concerns={snapshot.concerns} />
            <MedicationLog messages={snapshot.messages} />
            <TaskList tasks={snapshot.tasks} />
            <SupplyList supplies={snapshot.supplies} />
            <AppointmentList appointments={snapshot.appointments} />
          </div>
        </div>
      </main>
    </div>
  );
}
