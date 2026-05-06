import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareRelay",
  description: "One shared number to keep the whole family on the same page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="py-10 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
              CareRelay is for family coordination only. Not for emergencies.
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Link href="/privacy" className="transition-colors hover:text-[var(--text)]">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="transition-colors hover:text-[var(--text)]">Terms</Link>
              <span>·</span>
              <Link href="/founder" className="transition-colors hover:text-[var(--text)]">Founder</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
