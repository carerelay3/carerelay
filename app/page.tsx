import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PricingCard } from "@/components/PricingCard";

function PulseDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sage)] opacity-40"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--sage)]"></span>
    </span>
  );
}

function LiveFeedPreview() {
  const items = [
    { name: "Sarah", color: "#6B9E75", text: "Meds done at 8:15 AM", time: "2m ago", type: "meds" },
    { name: "Jake", color: "#6B8EAE", text: "Need soup and paper towels", time: "12m ago", type: "supply" },
    { name: "Mark", color: "#8B7EAE", text: "Cardiology Tuesday at 2 PM", time: "1h ago", type: "appt" },
  ];
  return (
    <div className="glass-strong p-5 space-y-3 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <PulseDot />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Live care circle</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms`, opacity: 0 }}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: item.color }}>
            {item.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{item.name} · {item.time}</p>
          </div>
          <span className="badge-pill" style={{ fontSize: '10px', padding: '4px 10px', background: item.color + '18', color: item.color }}>
            {item.type}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full space-y-0">
      {/* HERO */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24 md:py-32">
        {/* Background ambient blobs */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full opacity-40 blur-[100px]" style={{ background: 'radial-gradient(circle, var(--sage-soft), transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full opacity-30 blur-[100px]" style={{ background: 'radial-gradient(circle, var(--blue-glow), transparent 70%)' }} />

        <div className="container-warm relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ background: 'var(--sage-soft)' }}>
                <PulseDot />
                <span className="text-xs font-semibold" style={{ color: 'var(--sage)' }}>Trusted by caregiving families</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                One shared number.
                <span className="block mt-2" style={{ color: 'var(--text-muted)' }}>Peace of mind.</span>
              </h1>

              <p className="text-lg sm:text-xl max-w-lg" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                CareRelay turns the chaos of family caregiving texts into a calm, organized timeline—so everyone knows what happened, what&apos;s needed, and what&apos;s next.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/setup" className="btn btn-sage text-center">
                  Start a care circle
                </Link>
                <Link href="/demo" className="btn btn-soft text-center">
                  See how it works
                </Link>
              </div>

              {/* Trust avatars */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {['#6B9E75', '#6B8EAE', '#8B7EAE', '#C98B5A'].map((c, i) => (
                    <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm" style={{ background: c, zIndex: 4 - i }}>
                      {['S', 'J', 'M', 'L'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>3,200+</span> families coordinating care
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <LiveFeedPreview />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / EMOTION */}
      <section className="px-4 py-16 sm:py-20">
        <div className="container-warm">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text)' }}>
              Caregiving is hard enough.
            </h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--text-muted)' }}>
              The family group chat should not make it harder.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              { icon: "💊", title: "Did Mom take her meds?", desc: "Scattered updates get lost in threads." },
              { icon: "🚗", title: "Who's driving to the appointment?", desc: "No one knows who confirmed what." },
              { icon: "🛒", title: "Can someone grab groceries?", desc: "Requests buried under other messages." },
              { icon: "⚠️", title: "Why didn't anyone tell me she fell?", desc: "Critical updates missed entirely." },
            ].map((item, i) => (
              <div key={i} className="glass p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: 'var(--bg-subtle)' }}>
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-subtle)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION — HOW IT WORKS */}
      <section className="px-4 py-16 sm:py-20" style={{ background: 'linear-gradient(180deg, var(--bg-warm) 0%, var(--bg) 100%)' }}>
        <div className="container-warm">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text)' }}>
              How CareRelay changes it
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              {[
                { num: "01", title: "Create a care circle", desc: "Set up a shared number for your parent or relative." },
                { num: "02", title: "Add family members", desc: "Invite siblings, cousins, anyone who helps with care." },
                { num: "03", title: "Everyone texts the number", desc: "No app install required. Just text like they already do." },
                { num: "04", title: "Get organized clarity", desc: "Tasks, appointments, supplies, and concerns—in one calm view." },
              ].map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold" style={{ background: 'var(--sage-soft)', color: 'var(--sage)' }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{step.title}</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--sage-glow), transparent 70%)' }} />
              <div className="glass-elevated relative p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm" style={{ background: 'var(--sage)' }}>S</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Sarah</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>2 minutes ago</p>
                  </div>
                </div>
                <div className="rounded-2xl rounded-tl-sm p-4" style={{ background: 'var(--sage-soft)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Meds: Mom took blood pressure pill at 8:15 AM.</p>
                </div>
                <div className="flex gap-2">
                  <span className="badge-pill badge-sage" style={{ fontSize: '10px' }}>Medication</span>
                  <span className="badge-pill badge-success" style={{ fontSize: '10px' }}>Logged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-16 sm:py-20">
        <div className="container-warm">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {[
              { title: "Shared care number", desc: "One number the whole family texts. No apps to install.", color: "var(--sage)" },
              { title: "Daily summaries", desc: "A calm recap of what happened and what's coming up.", color: "var(--blue-soft)" },
              { title: "Task tracking", desc: "Who's doing what, what's done, what needs attention.", color: "var(--purple-soft)" },
              { title: "Appointment reminders", desc: "Upcoming visits with transportation status.", color: "var(--sage)" },
              { title: "Supply list", desc: "What's needed, what's bought, what's delivered.", color: "var(--warning)" },
              { title: "Medication logs", desc: "Confirmation-only records. No dosage advice.", color: "var(--success)" },
            ].map((f, i) => (
              <div key={i} className="glass p-6 group">
                <div className="mb-4 h-1 w-10 rounded-full transition-all group-hover:w-16" style={{ background: f.color }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-4 py-16 sm:py-20" style={{ background: 'var(--bg-warm)' }}>
        <div className="container-warm">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text)' }}>Simple pricing</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--text-muted)' }}>No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto stagger-children">
            <PricingCard
              title="Starter"
              price="$9/month"
              planId="starter"
              features={["One care circle", "Up to 3 family members", "Daily summary", "Simple care timeline"]}
              accent="var(--text-subtle)"
            />
            <PricingCard
              title="Family"
              price="$19/month"
              planId="family"
              features={["One care circle", "Up to 8 family members", "Tasks, appointments, supplies, meds", "Daily and weekly summaries"]}
              accent="var(--sage)"
              popular
            />
            <PricingCard
              title="Family Plus"
              price="$39/month"
              planId="family_plus"
              features={["Multiple care circles", "Unlimited family members", "Exportable timeline", "Priority setup support"]}
              accent="var(--purple-soft)"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20">
        <div className="container-warm">
          <div className="glass-elevated mx-auto max-w-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: 'var(--sage)' }} />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--blue-soft)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Ready to bring calm to caregiving?</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-muted)' }}>Set up your care circle in under five minutes. No credit card required.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
                <Link href="/setup" className="btn btn-sage">Start free</Link>
                <Link href="/demo" className="btn btn-soft">View demo</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-warm pb-12">
        <DisclaimerBanner />
      </div>
    </main>
  );
}
