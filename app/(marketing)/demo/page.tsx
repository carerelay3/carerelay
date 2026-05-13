"use client";

import { useMemo, useState } from "react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { getDemoSnapshot } from "@/lib/demo/data";
import type { DemoSnapshot } from "@/lib/demo/types";
import type { CareCategory } from "@/lib/types";

const examples = [
  { sender: "Sarah", body: "Meds: Mom took her morning pills at 8am. Sarah gave them.", label: "Medication" },
  { sender: "Mark", body: "Appointment: Dad has therapy Tuesday at 2pm.", label: "Appointment" },
  { sender: "Jake", body: "Need: low on wipes and milk.", label: "Supply" },
  { sender: "Sarah", body: "Task: can someone pick up groceries tomorrow?", label: "Task" },
  { sender: "Jake", body: "Mom seemed confused tonight and almost fell.", label: "Concern" },
  { sender: "Sarah", body: "GRANDMA Meds: took night pills at 8pm.", label: "Keyword" },
];

type Result = {
  category: CareCategory;
  routingStatus: string;
  displayMessage: string;
  recordType?: string;
};

export default function DemoPage() {
  const [snapshot, setSnapshot] = useState<DemoSnapshot>(() => getDemoSnapshot());
  const [sender, setSender] = useState("Sarah");
  const [message, setMessage] = useState(examples[0].body);
  const [result, setResult] = useState<Result | null>(null);
  const [processing, setProcessing] = useState(false);

  const selectedMember = useMemo(
    () => snapshot.members.find((member) => member.name === sender) || snapshot.members[0],
    [sender, snapshot.members],
  );

  const stats = [
    ["Medication", snapshot.medicationLogs.length],
    ["Tasks", snapshot.tasks.filter((task) => task.status === "open").length],
    ["Supplies", snapshot.supplies.filter((supply) => supply.status === "needed").length],
    ["Concerns", snapshot.concerns.filter((concern) => !concern.acknowledged).length],
  ];

  const submit = async (body = message, from = sender) => {
    setProcessing(true);
    setMessage(body);
    setSender(from);
    try {
      const member = snapshot.members.find((item) => item.name === from) || selectedMember;
      const response = await fetch("/api/sms/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careCircleId: snapshot.careCircleId,
          senderName: from,
          senderPhone: member?.phone || "+15550001111",
          message: body,
        }),
      });
      const data = await response.json();
      setResult({
        category: data.category || "general_update",
        routingStatus: data.routingStatus || "demo",
        displayMessage: data.displayMessage || "CircleRelay logged your update.",
        recordType: data.dashboardUpdateData?.recordType,
      });
      if (data.snapshot) setSnapshot(data.snapshot);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="page-shell space-y-10 py-10 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <div className="section-kicker">Interactive demo</div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--text)", lineHeight: 1.08 }}>
            Watch a family text turn into an organized dashboard item.
          </h1>
          <p className="text-lg">
            Choose a sender, send a realistic update, and see how CircleRelay routes, categorizes, and organizes it without requiring signup.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={label} className="surface-panel p-4">
                <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="product-card p-5 sm:p-6">
          <div className="relative z-10 rounded-[2rem] bg-[#203a43] p-5 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/60">CircleRelay shared line</p>
                <p className="font-bold">{snapshot.sharedPhone}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Demo</span>
            </div>
            <div className="space-y-3">
              {snapshot.messages.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[11px] font-semibold text-white/60">{item.sender}</p>
                  <p className="mt-1 text-sm">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="product-card p-5 sm:p-7">
          <div className="relative z-10 space-y-5">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Send a sample update</h2>
              <p className="mt-2 text-sm">Try normal updates, concern language, or a multi-circle keyword like GRANDMA.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Sender</span>
                <select value={sender} onChange={(event) => setSender(event.target.value)} className="input-glass">
                  {snapshot.members.map((member) => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Care circle</span>
                <input className="input-glass" value={snapshot.careCircleName} readOnly />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Text message</span>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} className="input-glass min-h-32 resize-none" />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => void submit()} disabled={processing || !message.trim()} className="btn btn-sage flex-1">
                {processing ? "Organizing..." : "Send demo text"}
              </button>
              <button type="button" onClick={() => window.location.reload()} className="btn btn-soft flex-1">
                Reset
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {examples.map((example) => (
                <button key={example.body} type="button" onClick={() => void submit(example.body, example.sender)} className="min-h-20 rounded-2xl border bg-white/60 p-3 text-left text-sm transition hover:-translate-y-0.5 hover:bg-white" style={{ borderColor: "var(--border)" }}>
                  <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: "var(--teal)" }}>{example.label}</span>
                  <span className="mt-1 line-clamp-2 block" style={{ color: "var(--text-muted)" }}>{example.body}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="product-card p-5 sm:p-7">
            <div className="relative z-10 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>Parser result</p>
                  <h2 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>Organized dashboard item</h2>
                </div>
                {result && <CategoryBadge category={result.category} />}
              </div>
              {result ? (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="rounded-3xl p-5" style={{ background: "var(--teal-soft)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{result.displayMessage}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>Routing</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>{result.routingStatus.replaceAll("_", " ")}</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>Record</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>{result.recordType || "dashboard item"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>Source</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>Demo SMS</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
                  <p className="font-semibold" style={{ color: "var(--text)" }}>Send a message to see the organized result.</p>
                  <p className="mt-2 text-sm">CircleRelay will show the category, route, and linked dashboard record.</p>
                </div>
              )}
            </div>
          </div>

          <div className="surface-panel p-5">
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Dashboard preview</h3>
            <div className="mt-4 space-y-3">
              {snapshot.messages.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl bg-white/70 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, var(--teal), var(--blue-soft))" }}>{item.sender.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{item.sender}</p>
                      <CategoryBadge category={item.category} />
                    </div>
                    <p className="mt-1 text-sm">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DisclaimerBanner />
    </main>
  );
}
