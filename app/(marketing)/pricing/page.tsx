import { PricingCard } from "@/components/PricingCard";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 md:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>
          Simple plans for family coordination
        </h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>
          Start in demo mode without a card. When Stripe is configured, checkout can create a live subscription.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <PricingCard
          title="Starter"
          price="$9/month"
          planId="starter"
          features={[
            "1 care circle",
            "Up to 3 family members",
            "Shared SMS update feed",
            "Daily summary",
            "Tasks, supplies, appointments, medication confirmations, and concern flags",
          ]}
          accent="var(--text-subtle)"
        />
        <PricingCard
          title="Family"
          price="$19/month"
          planId="family"
          features={[
            "1 care circle",
            "Up to 8 family members",
            "Everything in Starter",
            "Daily and weekly summaries",
            "More dashboard history and family activity tracking",
          ]}
          accent="var(--sage)"
          popular
        />
        <PricingCard
          title="Family Plus"
          price="$39/month"
          planId="family_plus"
          features={[
            "Multiple care circles",
            "Higher practical family member limits",
            "Exportable timeline",
            "Priority setup support",
            "Future option for a dedicated family number if supported later",
          ]}
          accent="var(--purple-soft)"
        />
      </section>

      <DisclaimerBanner />
    </main>
  );
}
