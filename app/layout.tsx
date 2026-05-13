import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import { UserProvider } from "./user-provider";
import { getCurrentUser } from "./user-data";
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
  applicationName: "CircleRelay",
  title: "CircleRelay",
  description: "One shared line for every circle in your life.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CircleRelay",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [{ url: "/brand/icons/circlerelay-app-icon-192.png", sizes: "180x180", type: "image/png" }],
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icons/circlerelay-app-icon-192.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icons/circlerelay-app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icons/circlerelay-app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "CircleRelay",
    description: "One shared line for every circle in your life.",
    images: [{ url: "/brand/heroe/circlerelay-hero-banner.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CircleRelay",
    description: "One shared line for every circle in your life.",
    images: ["/brand/heroe/circlerelay-hero-banner.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#171326",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const userPromise = Promise.resolve(user);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // Add this attribute to allow Next.js to disable smooth scrolling during
      // route transitions, preventing a jarring user experience.
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <PwaRegistrar />
        <UserProvider userPromise={userPromise}>
          <SiteHeader user={user} />
          <div className="flex-1">{children}</div>
        </UserProvider>
        <footer className="py-10 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
              CircleRelay Care Mode is for family coordination only. It is not a medical provider and does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services. In an emergency, call 911 or your local emergency number.
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
