export function MultipleRecipientsNotice() {
  return (
    <section className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--primary-soft)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        Multiple care recipients are coming soon for Family Plus.
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        CareRelay currently keeps the live dashboard on one selected care circle recipient so today&apos;s SMS routing and summaries stay reliable.
      </p>
    </section>
  );
}
