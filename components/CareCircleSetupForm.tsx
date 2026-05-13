"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsPhoneDisplay, normalizePhone } from "@/lib/utils/phone";
import { authFetch } from "@/lib/supabase/clientAuthFetch";
import { ModeSelector } from "@/components/ModeSelector";
import {
  type CircleType,
  getCircleTypeLabel,
  isCareMode,
} from "@/lib/circles/circleTypes";

const setupErrorLabels: Record<string, string> = {
  auth_missing: "Please sign in again before creating a circle.",
  service_role_missing: "Live setup is missing the server database key. Add the Supabase service role key in your deployment settings.",
  validation_failed: "Please check the setup fields and try again.",
  profile_upsert_failed: "We could not create your account profile. Please try again.",
  care_circle_insert_failed: "We could not create your circle. Please try again.",
  care_recipient_insert_failed: "Your circle was created, but the initial record could not be added.",
  owner_member_insert_failed: "Your circle was created, but owner access could not be added.",
  invited_member_insert_failed: "Your circle was created, but invited members could not be added.",
  plan_limit_reached: "Your current plan limit has been reached.",
};

function setupErrorMessage(data: { code?: unknown; error?: unknown }) {
  const code = typeof data.code === "string" ? data.code : "";
  const error = typeof data.error === "string" ? data.error : "";
  if (code && error) return `${setupErrorLabels[code] || "Setup could not be completed"} ${error}`;
  if (code) return setupErrorLabels[code] || "Setup could not be completed.";
  return error || "Could not create circle. Please sign in and try again.";
}

export function CareCircleSetupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [circleType, setCircleType] = useState<CircleType>("care");
  const [firstName, setFirstName] = useState("Linda");
  const [keyword, setKeyword] = useState("LINDA");
  
  const [members, setMembers] = useState<{name: string, phone: string}[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { num: 1, label: "Type" },
    { num: 2, label: "Members" },
    { num: 3, label: "Keyword" },
    { num: 4, label: "Number" },
    { num: 5, label: "Review" },
  ];

  const handleAddMember = () => {
    const normalized = normalizePhone(newMemberPhone);
    if (!normalized) {
      setPhoneError("Please enter a valid phone number (e.g. 555-555-5555)");
      return;
    }
    setPhoneError("");
    setMembers([...members, { name: newMemberName, phone: normalized }]);
    setNewMemberName("");
    setNewMemberPhone("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await authFetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, keyword, members, circleType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(setupErrorMessage(data));
        return;
      }
      router.push("/dashboard");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const careMode = isCareMode(circleType);
  const modeLabel = getCircleTypeLabel(circleType);
  const circleNamePlaceholder = careMode ? "e.g., Mom, Linda, Dad" : "e.g., Smith family, Pine House, Tigers U12";

  return (
    <div className="glass-elevated relative overflow-hidden mx-auto w-full max-w-2xl transition-all duration-500">
      <div 
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          background: step === 5 ? 'var(--success)' : step === 4 ? 'var(--sage)' : 'var(--blue-soft)',
          transform: `scale(${1 + (step * 0.1)})`
        }} 
      />

      <div className="border-b p-5 sm:p-10 relative z-10" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2 relative z-10 w-full group">
                  <div
                    className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300"
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
                    <div className="absolute top-0 left-0 h-full transition-all duration-500 ease-out" style={{ width: isCompleted ? '100%' : '0%', background: 'var(--success)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-10 relative z-10 min-h-[340px] flex flex-col justify-between">
        <div className="animate-fade-in-up">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>What kind of circle are you starting?</h2>
                <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Choose a starting mode. You can keep the current caregiving flow with Care Mode or start broader group coordination.
                </p>
              </div>
              <ModeSelector selectedType={circleType} onSelect={setCircleType} />
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {careMode ? "Who are you caring for?" : "What should this circle be called?"}
              </h3>
              <div>
                <input
                  id="name"
                  className="input-glass w-full text-lg font-medium"
                  style={{ padding: '16px 20px' }}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setKeyword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  }}
                  placeholder={circleNamePlaceholder}
                  autoComplete="given-name"
                  autoFocus
                />
              </div>
              <div className="rounded-2xl p-5 flex items-start gap-4 border" style={{ background: 'var(--blue-glow)', borderColor: 'var(--blue-soft)' }}>
                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--blue-soft)' }}>
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--blue-soft)' }}>
                  {careMode
                    ? "Use everyday language. CircleRelay Care Mode is for organizing family updates and coordinating tasks, not for storing medical charts."
                    : "CircleRelay helps organize group updates, tasks, reminders, supplies, and summaries."}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{careMode ? "Add your care team" : "Add circle members"}</h2>
                <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  Each member texts the same CircleRelay shared line from their own phone. CircleRelay uses the phone numbers you add here to route updates to the right circle.
                </p>
              </div>

              <div className="space-y-3">
                {members.map((m, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-3 border rounded-xl glass min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{m.name}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatUsPhoneDisplay(m.phone)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 p-4 border rounded-2xl glass-elevated">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="input-glass text-sm"
                    autoComplete="name"
                  />
                  <input
                    placeholder="Phone number"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="input-glass text-sm"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
                {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
                <button type="button" onClick={handleAddMember} disabled={!newMemberName || !newMemberPhone} className="btn btn-soft w-full text-sm">
                  Add member
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Set a circle keyword</h2>
                <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  If a member helps with more than one circle, they can use this keyword so CircleRelay knows which dashboard to update.
                </p>
              </div>
              <div>
                <input
                  className="input-glass w-full text-lg font-bold uppercase tracking-widest text-center"
                  style={{ padding: '16px 20px' }}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. GRANDMA"
                />
              </div>
              <div className="rounded-2xl border p-5 glass">
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Example:</strong> {careMode ? <>If Aunt Sarah is in two care circles, she can text <em>&quot;{keyword || 'LINDA'} Meds: gave morning pills&quot;</em> and we will route it here automatically.</> : <>If someone belongs to multiple circles, they can text <em>&quot;{keyword || 'HOUSE'} Need: paper towels&quot;</em> and we will route it here automatically.</>}
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Your shared number</h2>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                This is the single number your entire {modeLabel.toLowerCase().replace(" mode", "")} circle will text to log {careMode ? "updates, tasks, appointments, supplies, medication confirmations, and concerns" : "updates, tasks, reminders, supplies, and summaries"}.
              </p>
              
              <div className="relative mx-auto max-w-sm mt-8">
                <div className="absolute inset-0 bg-[var(--sage)] blur-2xl opacity-20 rounded-full animate-pulse-soft" />
                <div className="glass-elevated rounded-[2rem] p-5 sm:p-8 relative z-10 border-2" style={{ borderColor: 'var(--sage-soft)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--sage)' }}>Shared line setup</p>
                  <p className="text-xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Assigned from Twilio config</p>
                </div>
              </div>
              
              <p className="text-xs font-medium max-w-sm mx-auto mt-6" style={{ color: 'var(--text-subtle)' }}>
                If Twilio is not configured yet, the dashboard will show SMS not configured instead of a fake number.
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
                Your {modeLabel} command center for <span className="font-bold" style={{ color: 'var(--text)' }}>{firstName}</span> is prepared.
              </p>
              
              <div className="rounded-2xl p-4 text-left border" style={{ background: 'var(--warning-soft)', borderColor: 'var(--warning)' }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" required />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {careMode
                      ? "I acknowledge that CircleRelay Care Mode is for family coordination only. It does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services. For emergencies, call 911."
                      : "I acknowledge that CircleRelay organizes group coordination updates and that this circle is not being set up for medical advice, monitoring, emergency services, or safety guarantees."}
                  </span>
                </label>
              </div>
              {submitError && (
                <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">{submitError}</p>
              )}

            </div>
          )}
        </div>

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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-sage flex-1 w-full text-base font-bold shadow-lg"
              style={{ padding: '14px 24px' }}
            >
              {isSubmitting ? "Creating..." : "Enter Dashboard"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
