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
      <header className="border-y px-3 py-4 backdrop-blur-xl sm:sticky sm:top-[65px] sm:z-40 sm:px-6" style={{ background: "rgba(251,250,247,0.82)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--text)" }}>Family command center</h1>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                Selected care circle: <span style={{ color: "var(--text)" }}>{snapshot.careCircleName || "Care circle"}</span>
              </p>
            </div>
            <ModeBadge mode={initialMode} />
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:items-end">
            <CareCircleSwitcher circles={careCircles} selectedCareCircleId={snapshot.careCircleId} />
            <div className="w-full rounded-2xl px-4 py-3 text-sm font-semibold sm:w-auto sm:rounded-full sm:py-2" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
              Shared line: {snapshot.sharedPhone || "Connect Twilio to enable live SMS"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-6 sm:py-8">
        <DisclaimerBanner />
        {initialMode === "live" && <MultipleRecipientsNotice />}
        
        <DashboardOverviewCards snapshot={snapshot} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {initialMode === "demo" && (
            <section className="lg:col-span-2">
              <DemoMessageTester onSend={handleNewMockMessage} />
            </section>
          )}
          <section className="lg:col-span-2">
            <MessageFeed messages={snapshot.messages} mode={initialMode} />
          </section>
          <section>
            <TaskList tasks={snapshot.tasks} />
          </section>
          <section>
            <SupplyList supplies={snapshot.supplies} />
          </section>
          <section>
            <AppointmentList appointments={snapshot.appointments} />
          </section>
          <section>
            <MedicationLog messages={snapshot.messages} />
          </section>
          <section>
            <ConcernPanel concerns={snapshot.concerns} />
          </section>
          <section className="lg:col-span-2">
            <DailySummary snapshot={snapshot} />
          </section>
          {initialMode === "live" && (
            <section className="lg:col-span-2">
              <WeeklySummaryBetaPanel careCircleId={snapshot.careCircleId} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
