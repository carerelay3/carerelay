import Link from "next/link";
import Image from "next/image";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PricingCard } from "@/components/PricingCard";
import { SectionHeader } from "@/components/SectionHeader";

const flowSteps = [
  "Text arrives",
  "Phone recognized",
  "Care circle matched",
  "Dashboard updated",
];

const trackItems = [
  ["Notes", "Small updates that keep everyone oriented."],
  ["Medication confirmations", "Family-reported logs for organization only."],
  ["Appointments", "Upcoming visits and transportation details."],
  ["Tasks", "Who is handling what and what is still open."],
  ["Groceries and supplies", "Needed, purchased, and delivered items."],
  ["Concerns", "Calm flags for family review."],
  ["Daily summaries", "A factual recap of what the family reported."],
];

const faqs = [
  ["Does everyone need an app?", "No. Family members can text the shared CareRelay number from their own phones."],
  ["How does CareRelay know where a message belongs?", "It matches the sender phone number to the care circle. Helpers in multiple circles can start with a keyword like GRANDMA."],
  ["Is this for emergencies?", "No. CareRelay is for family coordination only. In an emergency, call 911 or your local emergency number."],
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-6 rounded-[3rem] opacity-70 blur-3xl" style={{ background: "linear-gradient(135deg, var(--teal-glow), var(--amber-glow))" }} />
      <div className="product-card p-2 sm:p-3">
        <Image
          src="/brand/heroes/carerelay-hero-main.png"
          alt="CareRelay homepage hero showing family coordination dashboard"
          width={1672}
          height={941}
          priority
          sizes="(min-width: 1024px) 48vw, 92vw"
          className="relative z-10 h-auto w-full rounded-[1.35rem] object-cover shadow-2xl"
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="page-shell grid min-h-[calc(100vh-96px)] gap-12 py-14 sm:py-18 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-7">
          <div className="section-kicker">One shared SMS number</div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style={{ color: "var(--text)", lineHeight: 1.04 }}>
              One shared number to keep the whole family on the same page.
            </h1>
            <p className="max-w-2xl text-lg sm:text-xl" style={{ color: "var(--text-muted)" }}>
              CareRelay turns family text updates into a simple shared dashboard for notes, tasks, appointments, medication confirmations, groceries, supplies, concerns, and daily summaries.
            </p>
          </div>
          <div className="product-card p-4 lg:hidden">
            <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-2xl bg-white/75 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>Text</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>Need: wipes and milk</p>
              </div>
              <div className="text-lg font-bold" style={{ color: "var(--teal)" }}>→</div>
              <div className="rounded-2xl p-3" style={{ background: "var(--teal-soft)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--teal)" }}>Dashboard</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>Supply item</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-sage text-center">Try the Demo</Link>
            <Link href="/setup" className="btn btn-soft text-center">Create a Care Circle</Link>
          </div>
          <p className="max-w-xl text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
            Built for family coordination only. Not for medical advice or emergencies.
          </p>
        </div>
        <HeroVisual />
      </section>

      <section className="page-shell py-16 sm:py-20">
        <SectionHeader eyebrow="Less chaos" title="The group chat is where updates happen. It is also where updates disappear." text="CareRelay keeps the familiar texting habit, then turns scattered updates into calm, shared structure." />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {["Was that done?", "Who is going?", "What is needed?", "Should we review this?"].map((question) => (
            <div key={question} className="product-card p-6">
              <div className="relative z-10">
                <div className="mb-5 h-10 w-10 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--teal-soft), var(--blue-glow))" }} />
                <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{question}</h3>
                <p className="mt-2 text-sm">CareRelay gives the family one shared place to check.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg, rgba(237,244,242,0.5), rgba(244,241,235,0.45))" }}>
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionHeader align="left" eyebrow="How it works" title="Text normally. CareRelay handles the organization." text="Family members keep using SMS. CareRelay recognizes the sender, routes the update to the right care circle, and turns the message into an organized dashboard item." />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {flowSteps.map((step, index) => (
                  <div key={step} className="surface-panel p-6">
                    <p className="text-sm font-bold" style={{ color: "var(--teal)" }}>0{index + 1}</p>
                    <h3 className="mt-3 text-lg font-bold" style={{ color: "var(--text)" }}>{step}</h3>
                    <p className="mt-2 text-sm">{index === 0 ? "A family member texts the shared number." : index === 1 ? "The sender phone number is matched." : index === 2 ? "A keyword is used only when needed." : "The right record appears for the family."}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="product-card p-2 sm:p-3">
              <Image
                src="/brand/heroes/carerelay-hero-family.png"
                alt="CareRelay family texting organization hero graphic"
                width={1672}
                height={941}
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="relative z-10 h-auto w-full rounded-[1.35rem] object-cover shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <SectionHeader align="left" eyebrow="Shared-number routing" title="One number for everyone, with simple routing behind the scenes." text="Everyone texts the same CareRelay number. CareRelay knows where the message belongs based on the phone numbers linked to each care circle. If someone helps with more than one care circle, they can add a simple keyword like GRANDMA or DAD before the message." />
          <div className="product-card p-5 sm:p-7">
            <div className="relative z-10 space-y-4">
              {["Meds: Grandma took her night pills at 8pm.", "Need: low on wipes and milk.", "GRANDMA Appointment: therapy Tuesday at 2pm."].map((message) => (
                <div key={message} className="rounded-3xl bg-white/75 p-4 shadow-sm">
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{message}</p>
                </div>
              ))}
              <div className="soft-divider" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {flowSteps.map((step) => (
                  <div key={step} className="rounded-2xl p-3 text-center" style={{ background: "var(--teal-soft)" }}>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--teal)" }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="product-card p-2 sm:p-3">
            <Image
              src="/brand/ads/carerelay-feature-promo.png"
              alt="CareRelay feature promo showing caregiver command center"
              width={1122}
              height={1402}
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="relative z-10 h-auto w-full rounded-[1.35rem] object-cover shadow-xl"
            />
          </div>
          <div>
            <SectionHeader align="left" eyebrow="What families track" title="A practical command center for the real work of caregiving." text="CareRelay organizes the everyday family-reported updates that usually get scattered across calls and group texts." />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {trackItems.map(([title, text]) => (
                <div key={title} className="surface-panel p-5">
                  <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h3>
                  <p className="mt-2 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="product-card grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-center">
          <div className="relative z-10">
            <div className="section-kicker">Daily summaries</div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>A calm recap when the day has too many moving parts.</h2>
            <p className="mt-4">CareRelay summarizes family-reported updates into factual notes, open items, upcoming appointments, supply needs, and concerns for family review.</p>
          </div>
          <div className="relative z-10 rounded-3xl bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>Tonight at 7:00</p>
            <p className="mt-3 text-lg font-semibold" style={{ color: "var(--text)" }}>Today: 4 updates, 1 open task, 2 supply needs, no open concerns.</p>
            <p className="mt-3 text-sm">Based only on family-reported updates. CareRelay does not provide medical advice.</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <SectionHeader eyebrow="Pricing" title="Simple plans for families." text="Start in demo mode. If Stripe is configured, checkout can create a live subscription." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <PricingCard title="Starter" price="$5" planId="starter" features={["1 care circle", "Up to 3 family members", "Shared SMS update feed", "Daily summary", "Tasks, supplies, appointments, medication confirmations, and concern flags"]} accent="var(--text-subtle)" />
          <PricingCard title="Family" price="$10" planId="family" features={["1 care circle", "Up to 8 family members", "Everything in Starter", "Daily and weekly summaries", "More dashboard history and family activity tracking"]} accent="var(--teal)" popular />
          <PricingCard title="Family Plus" price="$20" planId="family_plus" features={["Multiple care circles", "Higher practical family member limits", "Exportable timeline", "Priority setup support", "Future option for a dedicated family number if supported later"]} accent="var(--blue-soft)" />
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader align="left" eyebrow="Questions" title="Clear answers for stressed families." />
          <div className="space-y-4">
            {faqs.map(([question, answer]) => (
              <div key={question} className="surface-panel p-5">
                <h3 className="font-bold" style={{ color: "var(--text)" }}>{question}</h3>
                <p className="mt-2 text-sm">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-16 sm:pb-20">
        <div className="product-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative z-10 p-8 sm:p-12">
              <div className="section-kicker">Bring order to the family group chat</div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>One shared number. One calmer place to see what happened.</h2>
              <p className="mt-4">Try the demo in under a minute, then create a care circle when you are ready.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className="btn btn-sage">Try the Demo</Link>
                <Link href="/setup" className="btn btn-soft">Create a Care Circle</Link>
              </div>
            </div>
            <Image
              src="/brand/banners/carerelay-wide-banner.png"
              alt="CareRelay wide banner for organizing family group chat"
              width={2172}
              height={724}
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="relative z-10 h-full min-h-64 w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-8 surface-panel p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>Marketing assets</h3>
              <p className="mt-1 text-sm">Social square and vertical caregiving graphics are organized for future campaign pages.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--teal)" }}>
              <span className="rounded-full px-3 py-2" style={{ background: "var(--teal-soft)" }}>/brand/ads/carerelay-social-square.png</span>
              <span className="rounded-full px-3 py-2" style={{ background: "var(--teal-soft)" }}>/brand/ads/carerelay-social-vertical-caregiving.png</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </section>
    </main>
  );
}
