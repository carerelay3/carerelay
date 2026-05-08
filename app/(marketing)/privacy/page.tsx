export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Privacy</h1>
      <div className="glass p-6 space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p>CareRelay stores care circle details, family messages, tasks, appointments, supply lists, medication confirmations, concerns, and summaries.</p>
        <p>Only invited care circle members should access that information.</p>
        <p>SMS is not ideal for highly sensitive information.</p>
        <p>Do not use CareRelay for emergencies. Call 911 or your local emergency number.</p>
        <p>CareRelay does not provide medical advice.</p>
        <p>Users can request deletion of their care circle data.</p>
        <p>This MVP is not a HIPAA-covered clinical system.</p>
        <p className="mt-6 pt-4 border-t border-gray-200" style={{ borderColor: 'var(--glass-border)' }}>
          <em>Note: This product is an MVP. Human legal review is required before public launch.</em>
        </p>
      </div>
    </main>
  );
}
