export default function TermsPage() {
  return (
    <main className="page-shell py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
      <div className="section-kicker">Terms</div>
      <h1 className="mt-5 text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Safe use boundaries</h1>
      <div className="product-card mt-8 p-6 text-sm sm:p-8" style={{ color: 'var(--text-secondary)' }}>
        <div className="relative z-10 space-y-4">
        <p>CircleRelay Care Mode is for family coordination only.</p>
        <p>CircleRelay Care Mode is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services.</p>
        <p>Do not use CircleRelay Care Mode for emergencies. If you have an emergency, please call 911 or your local emergency number.</p>
        <p>Medication confirmations are family-reported organization logs only. Always follow instructions from licensed medical professionals.</p>
        <p>Users are responsible for the accuracy of messages sent to the shared number.</p>
        <p>CircleRelay may categorize or summarize messages, but it does not verify medical truth or evaluate whether information is complete or accurate.</p>
        <p>Service availability is not guaranteed. CircleRelay is not an emergency notification system.</p>
        <p>Data deletion requests can be submitted by care circle admins.</p>
        <p>Subscription terms may change as the MVP evolves.</p>
        <p className="mt-6 pt-4 border-t border-gray-200" style={{ borderColor: 'var(--glass-border)' }}>
          <em>Note: This product is an MVP. Human legal review is required before public launch.</em>
        </p>
        </div>
      </div>
      </div>
    </main>
  );
}
