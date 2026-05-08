"use client";

import { useState } from "react";
import { DemoMessageTester } from "@/components/DemoMessageTester";
import { PhoneMockup } from "@/components/PhoneMockup";
import { getDemoSnapshot } from "@/lib/demo/data";
import type { DemoSnapshot } from "@/lib/demo/types";

const sampleMessages = [
  { sender: "Sarah", body: "Meds: Mom took blood pressure pill at 8:15 AM.", label: "Medication", color: "#6B9E75" },
  { sender: "Jake", body: "Need: soup, paper towels, adult wipes.", label: "Supply", color: "#C98B5A" },
  { sender: "Mark", body: "Appointment: Cardiology Tuesday at 2 PM.", label: "Appointment", color: "#6B8EAE" },
  { sender: "Sarah", body: "Task: Jake pick up prescription tomorrow.", label: "Task", color: "#8B7EAE" },
  { sender: "Jake", body: "Mom seemed confused tonight.", label: "Concern", color: "#C46B6B" },
  { sender: "Mark", body: "Can someone check on her before bed?", label: "Task", color: "#8B7EAE" },
  { sender: "Sarah", body: "Evening meds done at 7:45.", label: "Medication", color: "#6B9E75" },
  { sender: "Jake", body: "She said she felt dizzy earlier but is resting now.", label: "Concern", color: "#C46B6B" },
  { sender: "Mark", body: "Need refill on Losartan.", label: "Supply", color: "#C98B5A" },
  { sender: "Sarah", body: "Groceries delivered.", label: "Supply", color: "#C98B5A" },
];

const commandSamples = [
  { body: "Done: pick up prescription", label: "Complete a task", result: "Marks task done" },
  { body: "Bought: paper towels", label: "Update supply", result: "Marks as purchased" },
  { body: "Delivered: groceries", label: "Confirm delivery", result: "Marks as delivered" },
  { body: "Assign: Sarah check on Mom", label: "Assign task", result: "Creates assigned task" },
  { body: "Summary", label: "Request summary", result: "Returns status counts" },
  { body: "Help", label: "Get help", result: "Lists all commands" },
];

export default function DemoPage() {
  const [snapshot, setSnapshot] = useState<DemoSnapshot>(getDemoSnapshot());
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const processSample = async (body: string, sender: string) => {
    setProcessing(true);
    setActiveSample(body);
    try {
      const member = snapshot.members.find((m) => m.name === sender);
      const res = await fetch("/api/sms/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careCircleId: snapshot.careCircleId,
          fromName: sender,
          fromPhone: member?.phone || "+15550000000",
          body,
        }),
      });
      const data = await res.json();
      if (data.snapshot) setSnapshot(data.snapshot);
    } catch { /* ignore */ } finally { setProcessing(false); }
  };

  const stats = [
    { label: "Medications", value: snapshot.medicationLogs.length, color: "#6B9E75" },
    { label: "Supplies needed", value: snapshot.supplies.filter((s) => s.status === "needed").length, color: "#C98B5A" },
    { label: "Appointments", value: snapshot.appointments.length, color: "#6B8EAE" },
    { label: "Open tasks", value: snapshot.tasks.filter((t) => t.status === "open").length, color: "#8B7EAE" },
    { label: "Concerns", value: snapshot.concerns.filter((c) => !c.acknowledged).length, color: "#C46B6B" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 md:py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text)' }}>See CareRelay in action</h1>
        <p className="mt-4 max-w-2xl text-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
          On the left is a normal family text thread. On the right is what CareRelay builds from those same messages—no extra work from the family.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Phone + Samples */}
        <section className="space-y-6">
          <div className="glass p-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Family group chat</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Messages from multiple family members</p>
          </div>
          <div className="flex justify-center">
            <PhoneMockup messages={snapshot.messages.slice(0, 10).map((m) => ({ sender: m.sender, body: m.body }))} />
          </div>

          <div className="glass p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Click a message to process it</h3>
            <div className="flex flex-wrap gap-2">
              {sampleMessages.map((s) => (
                <button
                  key={s.body}
                  type="button"
                  onClick={() => void processSample(s.body, s.sender)}
                  disabled={processing}
                  className="rounded-xl border px-3 py-2 text-left text-xs transition-all"
                  style={{
                    borderColor: activeSample === s.body ? s.color + '40' : 'var(--glass-border)',
                    background: activeSample === s.body ? s.color + '12' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <span className="block font-medium" style={{ color: s.color }}>{s.label}</span>
                  <span className="block truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{s.body}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Dashboard output */}
        <section className="space-y-6">
          <div className="glass p-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>What CareRelay creates</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Automatically organized from the same texts</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="glass p-4 text-center transition-all hover:-translate-y-1">
                <div className="mx-auto mb-2 h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm" style={{ background: s.color }}>
                  {s.value}
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Command shortcuts */}
          <div className="glass p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>SMS command shortcuts</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {commandSamples.map((c) => (
                <button
                  key={c.body}
                  type="button"
                  onClick={() => void processSample(c.body, "Sarah")}
                  disabled={processing}
                  className="rounded-xl border p-3 text-left text-xs transition-all hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.5)' }}
                >
                  <span className="block font-medium" style={{ color: 'var(--text)' }}>{c.label}</span>
                  <span className="block" style={{ color: 'var(--text-muted)' }}>{c.body}</span>
                  <span className="block mt-1" style={{ color: 'var(--sage)' }}>{c.result}</span>
                </button>
              ))}
            </div>
          </div>

          <DemoMessageTester />

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full btn btn-soft"
          >
            Reset demo
          </button>
        </section>
      </div>
    </main>
  );
}
