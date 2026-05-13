import { PricingCard } from "@/components/PricingCard";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 md:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>
          Simple plans for circles
        </h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>
          Start in demo mode without a card. When Stripe is configured, checkout can create a live subscription.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PricingCard
          title="Free"
          price="$0"
          planId="free"
          features={[
            "1 circle",
            "Up to 2 members",
            "Shared SMS update feed",
            "Basic dashboard",
          ]}
          accent="var(--text-subtle)"
        />
        <PricingCard
          title="Starter"
          price="$5"
          planId="starter"
          features={[
            "1 circle",
            "Up to 3 members",
            "Shared SMS update feed",
            "Daily summary",
          ]}
          accent="var(--text-subtle)"
        />
        <PricingCard
          title="Family"
          price="$10"
          planId="family"
          features={[
            "1 circle",
            "Up to 8 members",
            "Everything in Starter",
            "Daily and weekly summaries",
            "More dashboard history and circle activity tracking",
          ]}
          accent="var(--sage)"
          popular
        />
        <PricingCard
          title="Family Plus"
          price="$20"
          planId="family_plus"
          features={[
            "Multiple circles",
            "Larger teams, groups, and households",
            "Exportable timeline",
            "Future dedicated number option",
          ]}
          accent="var(--purple-soft)"
        />
      </section>

      <DisclaimerBanner />
    </main>
  );
}
