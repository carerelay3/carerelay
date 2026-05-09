export default function PrivacyPage() {
  return (
    <main className="page-shell py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
      <div className="section-kicker">Privacy</div>
      <h1 className="mt-5 text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Plain-English privacy notes</h1>
      <div className="product-card mt-8 p-6 text-sm sm:p-8" style={{ color: 'var(--text-secondary)' }}>
        <div className="relative z-10 space-y-4">
        <p>CareRelay helps families coordinate care through shared SMS updates and a family dashboard.</p>
        <p>CareRelay may collect phone numbers, SMS message content, care circle details, care recipient details, family member activity, tasks, appointments, supply lists, medication confirmation logs, concerns, summaries, and billing records if billing is enabled.</p>
        <p>CareRelay uses this information to route updates by sender phone number, organize family-reported updates, show dashboard records, generate summaries, and operate the service.</p>
        <p>Demo mode may use sample data and local in-memory records. Do not enter highly sensitive information into demo mode.</p>
        <p>Third-party services may include Supabase for database/auth, Twilio for SMS, OpenAI for optional summaries, Stripe for billing, and analytics providers if enabled.</p>
        <p>Only invited care circle members should access care circle information. SMS is not ideal for highly sensitive information.</p>
        <p>Do not use CareRelay for emergencies. Call 911 or your local emergency number.</p>
        <p>CareRelay is for family coordination only and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services.</p>
        <p>Users can request deletion of their care circle data.</p>
        <p>CareRelay does not claim HIPAA or SOC-2 compliance in this MVP.</p>
        <p className="mt-6 pt-4 border-t border-gray-200" style={{ borderColor: 'var(--glass-border)' }}>
          <em>Note: This product is an MVP. Human legal review is required before public launch.</em>
        </p>
        </div>
      </div>
      </div>
    </main>
  );
}
