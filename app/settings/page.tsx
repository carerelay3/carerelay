import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PricingCard } from "@/components/PricingCard";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-slate-500">
            CareRelay is for family coordination. Choose the plan that fits your family's needs.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full">
          <PricingCard
            title="Starter"
            price="$9"
            planId="starter"
            features={[
              "1 care circle",
              "Up to 3 family members",
              "Shared SMS update feed",
              "Daily summary",
              "Medication confirmation logs",
              "Concern flags",
            ]}
          />
          <PricingCard
            title="Family"
            price="$19"
            planId="family"
            accent="var(--blue-soft)"
            popular
            features={[
              "Everything in Starter",
              "Up to 8 family members",
              "Weekly summaries",
              "More dashboard history",
              "Extended family activity tracking",
            ]}
          />
          <PricingCard
            title="Family Plus"
            price="$39"
            planId="family_plus"
            accent="var(--purple-soft)"
            features={[
              "Everything in Family",
              "Up to 50 family members",
              "Up to 5 care circles",
              "Exportable timeline",
              "Priority setup support",
            ]}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}