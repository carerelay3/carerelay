import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function OfflinePage() {
  return (
    <main className="page-shell flex min-h-[70vh] items-center py-12">
      <section className="product-card mx-auto w-full max-w-2xl p-6 text-center sm:p-8">
        <div className="relative z-10">
          <p className="section-kicker mx-auto">Offline</p>
          <h1 className="mt-4 text-3xl font-bold" style={{ color: "var(--text)" }}>
            CareRelay needs a connection for live care updates.
          </h1>
          <p className="mt-4" style={{ color: "var(--text-muted)" }}>
            You can reopen the dashboard when your connection returns. Cached pages may be visible, but live SMS updates, team changes, billing, and summaries require network access.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn btn-sage">
              Try dashboard again
            </Link>
            <Link href="/support" className="btn btn-soft">
              Support
            </Link>
          </div>
          <div className="mt-8 text-left">
            <DisclaimerBanner compact />
          </div>
        </div>
      </section>
    </main>
  );
}
