export function PushNotificationsComingSoon() {
  return (
    <section className="product-card p-5">
      <p className="section-kicker">Mobile</p>
      <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Push notifications</h2>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
        Push notifications are coming soon.
      </p>
      <p className="mt-3 text-sm" style={{ color: "var(--text-subtle)" }}>
        CareRelay will not ask your browser for notification permission until notification delivery is fully implemented and tied to your signed-in account.
      </p>
    </section>
  );
}

export function DedicatedFamilyNumberComingSoon() {
  return (
    <section className="product-card p-5">
      <p className="section-kicker">Family Plus</p>
      <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Dedicated family number</h2>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
        Dedicated family number is planned for Family Plus.
      </p>
      <p className="mt-3 text-sm" style={{ color: "var(--text-subtle)" }}>
        Today, CareRelay routes SMS through the configured shared number using each care circle&apos;s keyword and known sender phone numbers. Twilio number provisioning is not active yet.
      </p>
    </section>
  );
}
