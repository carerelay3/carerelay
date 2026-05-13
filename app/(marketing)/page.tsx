import Link from "next/link";
import Image from "next/image";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PricingCard } from "@/components/PricingCard";
import { SectionHeader } from "@/components/SectionHeader";

const flowSteps = [
  "Text arrives",
  "Phone recognized",
  "Circle matched",
  "Dashboard updated",
];

const modeCards = [
  {
    title: "Care Mode",
    text: "Coordinate care updates, appointments, supplies, medication confirmations, concerns, and daily summaries.",
    image: "/brand/stock/care-mode-family-support.png.png",
    alt: "Family members coordinating support together in Care Mode",
  },
  {
    title: "Family Mode",
    text: "Keep chores, groceries, school notes, errands, appointments, and reminders in one shared place.",
    image: "/brand/stock/household-mode-roommates.png.png",
    alt: "A household table representing shared family coordination",
  },
  {
    title: "Household Mode",
    text: "Organize roommates, dorms, supplies, bills, maintenance, chores, and house updates.",
    image: "/brand/stock/household-mode-roommates.png.png",
    alt: "Roommates coordinating a shared household",
  },
  {
    title: "Team Mode",
    text: "Coordinate practices, games, rides, equipment, volunteers, reminders, and announcements.",
    image: "/brand/stock/team-mode-sports.png.png",
    alt: "A sports team gathered for practice coordination",
  },
  {
    title: "Group Mode",
    text: "Plan trips, clubs, events, frats, friend groups, decisions, and shared responsibilities without losing everything in the chat.",
    image: "/brand/stock/group-mode-planning.png.png",
    alt: "A group planning shared events and responsibilities",
  },
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
  ["Does everyone need an app?", "No. Members can text the shared CircleRelay line from their own phones."],
  ["How does CircleRelay know where a message belongs?", "It matches the sender phone number to the right circle. Helpers in multiple circles can start with a keyword like GRANDMA, HOUSE, or TEAM."],
  ["Is Care Mode for emergencies?", "No. CircleRelay Care Mode is for family coordination only. In an emergency, call 911 or your local emergency number."],
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[1.5rem] border shadow-2xl sm:rounded-[2rem]" style={{ borderColor: "var(--border)" }}>
        <Image
          src="/brand/heroe/circlerelay-hero-banner.png"
          alt="CircleRelay hero artwork showing one shared line connecting different life circles"
          width={1920}
          height={1080}
          priority
          sizes="(min-width: 1024px) 48vw, 92vw"
          className="h-auto w-full object-cover"
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
          <div className="section-kicker">CircleRelay</div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style={{ color: "var(--text)", lineHeight: 1.04 }}>
              One shared line for every circle in your life.
            </h1>
            <p className="max-w-2xl text-lg sm:text-xl" style={{ color: "var(--text-muted)" }}>
              Turn group texts into organized updates, tasks, reminders, supplies, events, and summaries.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-[420px]:flex-row">
            <Link href="/setup" className="btn btn-sage text-center">Start your circle</Link>
            <Link href="/demo" className="btn btn-soft text-center">Try the demo</Link>
          </div>
          <p className="max-w-xl text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
            Care Mode keeps the existing caregiving safety boundary. Broader modes use non-medical coordination language.
          </p>
        </div>
        <HeroVisual />
      </section>

      <section className="page-shell py-16 sm:py-20">
        <SectionHeader eyebrow="Product modes" title="Start with the circle you need today." text="CircleRelay keeps one shared-line pattern and adapts the dashboard language to the group you are coordinating." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {modeCards.map((mode) => (
            <div key={mode.title} className="surface-panel overflow-hidden">
              <Image
                src={mode.image}
                alt={mode.alt}
                width={1448}
                height={1086}
                sizes="(min-width: 1024px) 18vw, (min-width: 768px) 45vw, 92vw"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{mode.title}</h3>
                <p className="mt-3 text-sm leading-relaxed">{mode.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <SectionHeader eyebrow="Less chaos" title="The group chat is where updates happen. It is also where updates disappear." text="CircleRelay keeps the familiar texting habit, then turns scattered updates into calm, shared structure." />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {["Was that done?", "Who is going?", "What is needed?", "Should we review this?"].map((question) => (
            <div key={question} className="product-card p-6">
              <div className="relative z-10">
                <div className="mb-5 h-10 w-10 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--soft-rose), rgba(201,120,0,0.16))" }} />
                <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{question}</h3>
                <p className="mt-2 text-sm">CircleRelay gives the circle one shared place to check.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20" style={{ background: "linear-gradient(180deg, rgba(237,244,242,0.5), rgba(244,241,235,0.45))" }}>
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionHeader align="left" eyebrow="How it works" title="Text normally. CircleRelay handles the organization." text="Members keep using SMS. CircleRelay recognizes the sender, routes the update to the right circle, and turns the message into an organized dashboard item." />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {flowSteps.map((step, index) => (
                  <div key={step} className="surface-panel p-6">
                    <p className="text-sm font-bold" style={{ color: "var(--teal)" }}>0{index + 1}</p>
                    <h3 className="mt-3 text-lg font-bold" style={{ color: "var(--text)" }}>{step}</h3>
                    <p className="mt-2 text-sm">{index === 0 ? "A member texts the shared line." : index === 1 ? "The sender phone number is matched." : index === 2 ? "A keyword is used only when needed." : "The right record appears for the circle."}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="product-card p-2 sm:p-3">
              <Image
                src="/brand/heroe/circlerelay-hero-banner.png"
                alt="CircleRelay shared-line coordination banner"
                width={1920}
                height={1080}
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="relative z-10 h-auto w-full rounded-[1.35rem] object-cover shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <SectionHeader align="left" eyebrow="Shared-line routing" title="One line for everyone, with simple routing behind the scenes." text="Everyone texts the same CircleRelay line. CircleRelay knows where the message belongs based on the phone numbers linked to each circle. If someone helps with more than one circle, they can add a simple keyword like GRANDMA, HOUSE, or TEAM before the message." />
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
              src="/brand/stock/care-mode-family-support.png.png"
              alt="Family support scene for CircleRelay Care Mode"
              width={1448}
              height={1086}
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="relative z-10 h-auto w-full rounded-[1.35rem] object-cover shadow-xl"
            />
          </div>
          <div>
            <SectionHeader align="left" eyebrow="Care Mode" title="A practical command center for family caregiving coordination." text="CircleRelay Care Mode organizes the everyday family-reported updates that usually get scattered across calls and group texts." />
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
            <p className="mt-4">CircleRelay summarizes reported updates into factual notes, open items, upcoming appointments, supply needs, events, and concerns for review.</p>
          </div>
          <div className="relative z-10 rounded-3xl bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>Tonight at 7:00</p>
            <p className="mt-3 text-lg font-semibold" style={{ color: "var(--text)" }}>Today: 4 updates, 1 open task, 2 supply needs, no open concerns.</p>
            <p className="mt-3 text-sm">Based only on reported updates. CircleRelay Care Mode does not provide medical advice.</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <SectionHeader eyebrow="Pricing" title="Simple plans for circles." text="Start in demo mode. If Stripe is configured, checkout can create a live subscription." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PricingCard title="Free" price="$0" planId="free" features={["1 circle", "Up to 2 members", "Shared SMS update feed", "Basic dashboard"]} accent="var(--text-subtle)" />
          <PricingCard title="Starter" price="$5" planId="starter" features={["1 circle", "Up to 3 members", "Shared SMS update feed", "Daily summary"]} accent="var(--text-subtle)" />
          <PricingCard title="Family" price="$10" planId="family" features={["1 circle", "Up to 8 members", "Daily and weekly summaries", "Mode-aware dashboard categories"]} accent="var(--teal)" popular />
          <PricingCard title="Family Plus" price="$20" planId="family_plus" features={["Multiple circles", "Larger teams, groups, and households", "Exports", "Future dedicated number option"]} accent="var(--blue-soft)" />
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
              <div className="section-kicker">Bring order to the group chat</div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>One shared line. One calmer place to see what happened.</h2>
              <p className="mt-4">Try the demo in under a minute, then start your circle when you are ready.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/setup" className="btn btn-sage">Start your circle</Link>
                <Link href="/demo" className="btn btn-soft">Try the demo</Link>
              </div>
            </div>
            <Image
              src="/brand/heroe/circlerelay-hero-banner.png"
              alt="CircleRelay banner showing shared coordination across circles"
              width={1920}
              height={1080}
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="relative z-10 h-full min-h-64 w-full object-cover"
            />
          </div>
        </div>
        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </section>
    </main>
  );
}
