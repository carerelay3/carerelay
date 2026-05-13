export function ModeBadge({ mode, liveSmsReady = true }: { mode: "demo" | "live"; liveSmsReady?: boolean }) {
  const isDemo = mode === "demo";
  const label = isDemo ? "Demo Mode" : liveSmsReady ? "Live SMS" : "Live dashboard";

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
      style={{
        background: isDemo ? "var(--blue-glow)" : liveSmsReady ? "var(--success-soft)" : "var(--amber-soft)",
        color: isDemo ? "var(--blue-soft)" : liveSmsReady ? "var(--success)" : "var(--warning)",
        border: `1px solid ${isDemo ? "rgba(107,142,174,0.15)" : liveSmsReady ? "rgba(90,158,122,0.15)" : "rgba(244,178,71,0.28)"}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: isDemo ? "var(--blue-soft)" : liveSmsReady ? "var(--success)" : "var(--warning)" }}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
