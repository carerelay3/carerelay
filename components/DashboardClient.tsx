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

export function DashboardClient({ initialSnapshot, initialMode }: { initialSnapshot: DemoSnapshot, initialMode: "demo" | "live" }) {
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
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">CareRelay</h1>
          <ModeBadge mode={initialMode} />
        </div>
        <div className="text-sm font-medium text-slate-500">
          Family Care Circle
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <DisclaimerBanner />
        
        <DashboardOverviewCards snapshot={snapshot} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Feed & Tools */}
          <div className="lg:col-span-2 space-y-8">
            <DemoMessageTester onSend={handleNewMockMessage} />
            <DailySummary snapshot={snapshot} />
            <MessageFeed messages={snapshot.messages} />
          </div>

          {/* Right Column - Specialized Lists */}
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