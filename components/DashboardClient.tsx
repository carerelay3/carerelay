"use client";

import { useState } from "react";
import { AppointmentList } from "@/components/AppointmentList";
import { ConcernPanel } from "@/components/ConcernPanel";
import { DailySummary } from "@/components/DailySummary";
import { DashboardCard } from "@/components/DashboardCard";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { MedicationLog } from "@/components/MedicationLog";
import { MessageFeed } from "@/components/MessageFeed";
import { ModeBadge } from "@/components/ModeBadge";
import { SupplyList } from "@/components/SupplyList";
import { TaskList } from "@/components/TaskList";
import { demoStore } from "@/lib/demo/data";

export function DashboardClient() {
  const [sender, setSender] = useState("Sarah");
  const [phone, setPhone] = useState("+15550000001");
  const [body, setBody] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const lastUpdate = demoStore.messages[0]?.createdAt
    ? new Date(demoStore.messages[0].createdAt).toLocaleTimeString()
    : "No updates";

  const submit = async () => {
    if (!body.trim()) return;
    await fetch("/api/sms/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careCircleId: demoStore.careCircleId,
        fromName: sender,
        fromPhone: phone,
        body,
      }),
    });
    setBody("");
    setRefreshKey((v) => v + 1);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8" key={refreshKey}>
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{demoStore.recipientName}</h1>
            <p className="text-sm text-slate-600">{demoStore.careCircleName} - Shared number {demoStore.sharedPhone}</p>
          </div>
          <ModeBadge mode="demo" />
        </div>
        <p className="mt-2 text-xs text-red-700">Do not use CareRelay for emergencies. Call 911 or your local emergency number.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <DashboardCard title="Open tasks" value={demoStore.tasks.filter((t) => t.status === "open").length} />
        <DashboardCard title="Upcoming appointments" value={demoStore.appointments.length} />
        <DashboardCard title="Supplies needed" value={demoStore.supplies.filter((s) => s.status === "needed").length} />
        <DashboardCard title="Medication confirmations today" value={demoStore.meds.length} />
        <DashboardCard title="Concerns flagged" value={demoStore.concerns.length} />
        <DashboardCard title="Last update received" value={lastUpdate} />
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="font-semibold">Add Demo Message</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input className="rounded-xl border p-2 text-sm" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Sender" />
          <input className="rounded-xl border p-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          <input className="rounded-xl border p-2 text-sm md:col-span-2" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body" />
        </div>
        <button onClick={submit} className="mt-2 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">Process message</button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MessageFeed messages={demoStore.messages} />
        <TaskList initial={demoStore.tasks} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <AppointmentList appointments={demoStore.appointments} />
        <SupplyList supplies={demoStore.supplies} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <MedicationLog logs={demoStore.meds} />
        <ConcernPanel concerns={demoStore.concerns} />
      </section>
      <DailySummary careCircleId={demoStore.careCircleId} />
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="font-semibold">Weekly summary preview</h3>
        <p className="mt-2 text-sm text-slate-700">This week included medication confirmations, one appointment plan, supply requests, and family concerns flagged for follow-up review.</p>
      </div>
      <DisclaimerBanner compact />
    </main>
  );
}
