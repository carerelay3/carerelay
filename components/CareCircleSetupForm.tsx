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
    { num: 1, label: "Recipient" },
    { num: 2, label: "Family" },
    { num: 3, label: "Schedule" },
    { num: 4, label: "Number" },
    { num: 5, label: "Review" },
  ];

  return (
    <div className="glass-elevated relative overflow-hidden mx-auto w-full max-w-2xl transition-all duration-500">
      {/* Dynamic Background Glow based on Step */}
      <div 
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          background: step === 5 ? 'var(--success)' : step === 4 ? 'var(--sage)' : 'var(--blue-soft)',
          transform: `scale(${1 + (step * 0.1)})`
        }} 
      />

      <div className="border-b p-8 sm:p-10 relative z-10" style={{ borderColor: 'var(--glass-border)' }}>
        {/* Progress Steps (Neumorphic) */}
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            
            return (
              <div key={s.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2 relative z-10 w-full group">
                  <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300"
                    style={{
                      background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--glass-bg)',
                      color: isCompleted || isCurrent ? 'white' : 'var(--text-subtle)',
                      boxShadow: isCurrent ? '0 8px 24px rgba(45,43,40,0.3)' : isCompleted ? '0 4px 12px rgba(90,158,122,0.2)' : 'none',
                      border: !isCompleted && !isCurrent ? '1px solid var(--glass-border)' : 'none',
                      transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span 
                    className="hidden sm:block text-[10px] font-bold uppercase tracking-widest transition-colors duration-300" 
                    style={{ color: isCurrent ? 'var(--text)' : isCompleted ? 'var(--success)' : 'var(--text-subtle)' }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-1 flex-1 rounded-full mx-2 transition-colors duration-500 relative overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                    <div 
                      className="absolute top-0 left-0 h-full transition-all duration-500 ease-out" 
                      style={{ width: isCompleted ? '100%' : '0%', background: 'var(--success)' }} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 sm:p-10 relative z-10 min-h-[340px] flex flex-col justify-between">
        <div className="animate-fade-in-up">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Who are you caring for?</h2>
              <div>
                <input
                  id="name"
                  className="input-glass w-full text-lg font-medium"
                  style={{ padding: '16px 20px' }}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Mom, Linda, Dad"
                  autoFocus
                />
              </div>
              <div className="rounded-2xl p-5 flex items-start gap-4 border" style={{ background: 'var(--blue-glow)', borderColor: 'var(--blue-soft)' }}>
                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--blue-soft)' }}>
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--blue-soft)' }}>
                  Use everyday language. CareRelay is for organizing family updates and coordinating tasks, not for storing medical charts.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Add your care team</h2>
                <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  Add the people who coordinate care (names, roles, and phone numbers). They keep using normal
                  SMS—no app install required.
                </p>
              </div>
              <button type="button" className="w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all hover:bg-white/40 hover:border-solid group" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}>
                <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:shadow-md" style={{ background: 'var(--primary)', color: 'white' }}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-base font-bold" style={{ color: 'var(--text)' }}>Invite family member</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Up to 8 members</p>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Choose summary time</h2>
                <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  Select when you would like the system to generate a calm daily handoff summary.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'morning', label: 'Morning', time: '8:00 AM', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
                  { id: 'afternoon', label: 'Afternoon', time: '2:00 PM', icon: 'M3 15h18M12 3v12' }, // Abstract representation
                  { id: 'evening', label: 'Evening', time: '8:00 PM', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' }
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className="glass-elevated p-5 flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg group"
                  >
                    <svg className="h-6 w-6 text-[var(--sage)] transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={slot.icon} />
                    </svg>
                    <div className="text-center">
                      <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{slot.label}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-subtle)' }}>{slot.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Your shared number</h2>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                This is the single number your entire care circle will text to log updates, tasks, and vitals.
              </p>
              
              <div className="relative mx-auto max-w-sm mt-8">
                <div className="absolute inset-0 bg-[var(--sage)] blur-2xl opacity-20 rounded-full animate-pulse-soft" />
                <div className="glass-elevated rounded-[2rem] p-8 relative z-10 border-2" style={{ borderColor: 'var(--sage-soft)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sage)' }}>Demo Line Active</p>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{demoLine}</p>
                </div>
              </div>
              
              <p className="text-xs font-medium max-w-sm mx-auto mt-6" style={{ color: 'var(--text-subtle)' }}>
                In a live environment, Twilio provides this dedicated SMS line. Family members text it like any other contact; CareRelay organizes the chaos.
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-xl mb-6" style={{ background: 'linear-gradient(135deg, var(--success), var(--sage))' }}>
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Ready to activate</h2>
              <p className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
                Your command center for <span className="font-bold" style={{ color: 'var(--text)' }}>{firstName}</span> is prepared.
              </p>
              <div className="rounded-2xl border p-5 max-w-sm mx-auto text-left glass" style={{ borderColor: 'var(--glass-border)' }}>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  You can refine details once you see real messages flowing in. The family will be notified with a welcome text from the shared number.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t flex flex-wrap-reverse sm:flex-nowrap gap-4" style={{ borderColor: 'var(--glass-border)' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="btn btn-soft flex-1 sm:flex-none text-sm font-bold"
              style={{ padding: '14px 24px' }}
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn btn-primary flex-1 w-full text-base font-bold shadow-lg"
              style={{ padding: '14px 24px', marginLeft: step === 1 ? 'auto' : '0' }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn btn-sage flex-1 w-full text-base font-bold shadow-lg"
              style={{ padding: '14px 24px' }}
            >
              Enter Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
