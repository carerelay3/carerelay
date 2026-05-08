export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Terms</h1>
      <div className="glass p-6 space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p>CareRelay is for family coordination only.</p>
        <p>CareRelay does not provide medical advice, diagnosis, or treatment.</p>
        <p>Do not use CareRelay for emergencies. If you have an emergency, please call 911 or your local emergency number.</p>
        <p>Users are responsible for the accuracy of messages sent to the shared number.</p>
        <p>Service availability is not guaranteed.</p>
        <p>Data deletion requests can be submitted by care circle admins.</p>
        <p>Subscription terms may change as the MVP evolves.</p>
        <p className="mt-6 pt-4 border-t border-gray-200" style={{ borderColor: 'var(--glass-border)' }}>
          <em>Note: This product is an MVP. Human legal review is required before public launch.</em>
        </p>
      </div>
    </main>
  );
}
