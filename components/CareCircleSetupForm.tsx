"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_SHARED_PHONE } from "@/lib/demo/constants";
import { formatUsPhoneDisplay } from "@/lib/utils/phone";

export function CareCircleSetupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("Linda");
  const demoLine = formatUsPhoneDisplay(DEMO_SHARED_PHONE);

  const steps = [
    { num: 1, label: "Who" },
    { num: 2, label: "Family" },
    { num: 3, label: "Schedule" },
    { num: 4, label: "Number" },
    { num: 5, label: "Review" },
  ];

  return (
    <div className="glass">
      <div className="border-b p-5 sm:p-6" style={{ borderColor: 'var(--glass-border)' }}>
        {/* Progress Steps */}
        <div className="mb-4 flex items-center justify-between gap-1 sm:mb-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: step > s.num ? 'var(--success)' : step === s.num ? 'var(--primary)' : 'var(--bg-muted)',
                  color: step > s.num || step === s.num ? 'white' : 'var(--text-subtle)',
                }}
              >
                {step > s.num ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="h-px flex-1" style={{ background: step > s.num ? 'var(--success)' : 'var(--glass-border)' }} />
              )}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text)' }}>Set up your care circle</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Step {step} of {steps.length}</p>
      </div>

      <div className="p-5 sm:p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Who are you caring for?
              </label>
              <input
                id="name"
                className="input-glass w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--blue-glow)', border: '1px solid var(--blue-glow)' }}>
              <p className="text-sm" style={{ color: 'var(--blue-soft)' }}>
                Use everyday language. CareRelay is for organizing family updates, not storing medical charts.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Add your care team</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Add the people who text most about care (names, roles, and phone numbers). They keep using normal
              SMS—no app install required.
            </p>
            <div className="rounded-xl border-2 border-dashed p-6 text-center transition-colors" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-subtle)' }}>
              <svg className="mx-auto h-10 w-10" fill="none" stroke="var(--text-subtle)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Add up to 8 family members</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Choose summary time</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Choose when you would like a calm daily summary (for you or other admins). This is a coordination recap,
              not a medical decision.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {["Morning", "Afternoon", "Evening"].map((time) => (
                <button
                  key={time}
                  type="button"
                  className="btn btn-soft text-sm"
                  style={{ padding: '12px 16px' }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Your shared CareRelay number</h3>
            <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.5)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>In demo, everyone texts</p>
              <p className="mt-1 text-2xl font-bold tracking-tight" style={{ color: 'var(--sage)' }}>{demoLine}</p>
              <p className="mt-3 text-xs" style={{ color: 'var(--text-subtle)' }}>
                With Twilio live, this becomes your real shared number. Family members text it as usual; CareRelay
                quietly organizes what comes in.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Review & create</h3>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.5)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--sage-soft)' }}>
                  <svg className="h-5 w-5" fill="none" stroke="var(--sage)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Care circle for {firstName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>Ready to activate</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.5)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                You can refine details once you see real messages flowing in. The family will text the shared number.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="btn btn-soft flex-1 sm:flex-none"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn btn-primary flex-1 sm:flex-none"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn btn-sage flex-1 sm:flex-none"
            >
              Create care circle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
