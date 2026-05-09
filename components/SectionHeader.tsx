type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, text, align = "center" }: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={align === "center" ? "mx-auto section-kicker" : "section-kicker"}>{eyebrow}</div>
      <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      {text && (
        <p className="mt-4 text-base sm:text-lg" style={{ color: "var(--text-muted)" }}>
          {text}
        </p>
      )}
    </div>
  );
}
