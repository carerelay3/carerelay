export function ModeBadge({ mode }: { mode: "demo" | "live" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
      style={{
        background: mode === "demo" ? "var(--blue-glow)" : "var(--success-soft)",
        color: mode === "demo" ? "var(--blue-soft)" : "var(--success)",
        border: `1px solid ${mode === "demo" ? "rgba(107,142,174,0.15)" : "rgba(90,158,122,0.15)"}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: mode === "demo" ? "var(--blue-soft)" : "var(--success)" }}
      />
      {mode === "demo" ? "Demo Mode" : "Live SMS"}
    </span>
  );
}
