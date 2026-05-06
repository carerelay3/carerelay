"use client";

import { useState } from "react";

export function OnboardingGuide({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Welcome to CareRelay", body: "CareRelay turns scattered caregiver texts into organized updates, tasks, and daily summaries. One shared number keeps the whole family on the same page." },
    { title: "How it works", body: "Family members text the shared CareRelay number like they already do. No app install required. The dashboard organizes everything for the person coordinating care." },
    { title: "Try it now", body: "Use the message box above to send a test message. Try 'Need: milk and bread' or 'Mom seemed confused tonight' to see how CareRelay categorizes and flags messages." },
    { title: "Dashboard views", body: "Switch between Timeline, Today, Needs Attention, Family, Activity, Handoff, and Export to see different angles of your care circle." },
    { title: "Safety first", body: "CareRelay is for family coordination only. It does not provide medical advice, diagnosis, or emergency monitoring. For emergencies, always call 911." },
    { title: "Your first actions", body: "1. Add family members in the Family tab. 2. Send a test message. 3. Generate today's summary or handoff. You're ready to pilot with real families." },
  ];

  const current = steps[step];

  return (
    <div className="glass p-5 sm:p-6 relative overflow-hidden" style={{ border: '1px solid var(--sage-glow)' }}>
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--sage)' }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{current.title}</h3>
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{step + 1} / {steps.length}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{current.body}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === step ? 24 : 6, background: i === step ? 'var(--sage)' : 'var(--bg-muted)' }} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="btn btn-soft text-xs" style={{ padding: '6px 14px' }}>Back</button>}
            {step < steps.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="btn btn-sage text-xs" style={{ padding: '6px 14px' }}>Next</button>
            ) : (
              <button type="button" onClick={onDismiss} className="btn text-xs text-white" style={{ background: 'var(--success)', padding: '6px 14px' }}>Get started</button>
            )}
            <button type="button" onClick={onDismiss} className="btn btn-soft text-xs" style={{ padding: '6px 14px' }}>Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
}
