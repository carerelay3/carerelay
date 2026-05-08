import Link from "next/link";
import { DisclaimerBanner } from "./DisclaimerBanner";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <DisclaimerBanner compact />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-lg font-bold text-slate-800 tracking-tight">CareRelay</p>
            <p className="text-sm text-slate-500 mt-1">
              Family care coordination, organized by text.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href="/demo" className="hover:text-slate-900 transition-colors">Demo</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>CareRelay does not provide medical advice. Human legal review required before public launch.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} CareRelay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}