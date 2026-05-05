import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { PricingCard } from "@/components/PricingCard";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 md:px-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-4xl font-bold tracking-tight">One shared number to keep the whole family on the same page.</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-700">
          CareRelay turns scattered caregiver texts into organized updates, tasks, reminders, supply lists, medication logs, appointment notes, and daily family summaries.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/setup" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">Start a care circle</Link>
          <Link href="/demo" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800">View live demo</Link>
        </div>
      </section>
      <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Caregiving group chats get chaotic</h2>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li>Did Mom take her meds?</li><li>Who is taking Dad to the appointment?</li><li>Can someone grab groceries?</li><li>What did the doctor say?</li><li>Why did not anyone tell me she fell?</li><li>Who checked in today?</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">How CareRelay fixes it</h2>
          <p className="mt-3 text-slate-700">Family members text one shared number. CareRelay organizes each message into tasks, logs, appointments, supplies, concerns, and summaries.</p>
          <ol className="mt-3 space-y-2 text-slate-700">
            <li>1. Create a care circle</li><li>2. Add family members</li><li>3. Text the shared number</li><li>4. Get organized summaries</li>
          </ol>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <PricingCard title="Starter" price="$9/month" planId="starter" features={["One care circle", "Up to 3 family members", "Daily summary", "Basic logs"]} />
        <PricingCard title="Family" price="$19/month" planId="family" features={["One care circle", "Up to 8 family members", "Tasks, appointments, supplies, medication confirmations", "Daily and weekly summaries"]} />
        <PricingCard title="Family Plus" price="$39/month" planId="family_plus" features={["Multiple care circles", "Unlimited family members", "Exportable timeline", "Priority setup support"]} />
      </section>
      <DisclaimerBanner />
    </main>
  );
}
