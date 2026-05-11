import Link from "next/link";
import { appConfig } from "@/lib/config";

const helpTopics = [
  {
    title: "Account help",
    body: "Use password reset if you cannot sign in. If your care circle is missing after sign-in, confirm you used the same email your owner invited.",
  },
  {
    title: "Billing help",
    body: "Open Settings to see your current plan and billing status. Paid subscription management is handled through Stripe when a Stripe customer is connected.",
  },
  {
    title: "SMS not showing",
    body: "Check that the sender phone number matches the invited family member and that the message went to the configured CareRelay number. Removed members cannot post live updates.",
  },
  {
    title: "Inviting family",
    body: "Owners and admins can add people from Team. Free plans have a smaller member limit, and duplicate phone numbers in the same care circle are blocked.",
  },
  {
    title: "Deleting or removing access",
    body: "Owners and admins can remove normal members from Team. Ownership must be transferred before removing the current owner.",
  },
];

export default function SupportPage() {
  const supportEmail = appConfig.supportEmail?.trim();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="section-kicker">Support</p>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: "var(--text)" }}>CareRelay help</h1>
        <p className="mt-2 max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Common account, billing, SMS, and family access questions for live care circles.
        </p>
      </div>

      <section className="product-card p-6">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Contact</h2>
        {supportEmail ? (
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Email support at{" "}
            <a className="font-semibold hover:text-[var(--teal)]" href={`mailto:${supportEmail}`} style={{ color: "var(--text)" }}>
              {supportEmail}
            </a>
            .
          </p>
        ) : (
          <div className="mt-3 rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--primary-soft)" }}>
            <p className="font-semibold" style={{ color: "var(--text)" }}>Support email not configured</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Add <code>NEXT_PUBLIC_SUPPORT_EMAIL=help@carerelay.xyz</code> to your environment to show a real support contact.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {helpTopics.map((topic) => (
          <article key={topic.title} className="product-card p-5">
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{topic.title}</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{topic.body}</p>
          </article>
        ))}
      </section>

      <section className="product-card mt-6 p-6" style={{ borderColor: "rgba(201,139,90,0.3)" }}>
        <p className="section-kicker">Safety</p>
        <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>Not for emergencies</h2>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          CareRelay organizes family-reported care coordination updates. It does not provide medical advice, emergency monitoring, diagnosis, treatment recommendations, or safety guarantees. If this is an emergency, call 911 or your local emergency number.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/settings" className="btn btn-soft">Back to settings</Link>
        <Link href="/team" className="btn btn-sage">Manage team</Link>
      </div>
    </main>
  );
}
