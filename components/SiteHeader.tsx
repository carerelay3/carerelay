import Link from "next/link";
import { DEMO_SHARED_PHONE } from "@/lib/demo/constants";
import { formatUsPhoneDisplay } from "@/lib/utils/phone";

export function SiteHeader() {
  const phone = formatUsPhoneDisplay(DEMO_SHARED_PHONE);
  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(250, 249, 247, 0.8)', backdropFilter: 'blur(20px) saturate(1.4)', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight transition-colors hover:opacity-80" style={{ color: 'var(--text)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md" style={{ background: 'linear-gradient(135deg, var(--sage), var(--blue-soft))' }}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="hidden sm:inline">CareRelay</span>
        </Link>

        <p className="order-3 w-full truncate text-center text-[11px] font-medium md:order-none md:w-auto md:text-left" style={{ color: 'var(--text-subtle)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Shared line:</span>{" "}
          <span className="tabular-nums font-semibold" style={{ color: 'var(--sage)' }}>{phone}</span>
        </p>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {[
            { href: "/demo", label: "Demo" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/setup", label: "Setup" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors" style={{ color: 'var(--text-muted)' }}>
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors" style={{ background: 'var(--primary-soft)', color: 'var(--text-secondary)' }}>
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
