import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import manifest from "@/app/manifest";
import HomePage from "@/app/(marketing)/page";
import OfflinePage from "@/app/offline/page";
import { DashboardClient } from "@/components/DashboardClient";
import { DedicatedFamilyNumberComingSoon, PushNotificationsComingSoon } from "@/components/MobileFeatureScaffolds";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { getDemoSnapshot } from "@/lib/demo/data";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("mobile and PWA foundation", () => {
  it("manifest route has installability basics", () => {
    const data = manifest();

    expect(data.name).toBe("CircleRelay");
    expect(data.short_name).toBe("CircleRelay");
    expect(data.description).toBe("One shared line for every circle in your life.");
    expect(data.start_url).toBe("/dashboard");
    expect(data.display).toBe("standalone");
    expect(data.icons?.length).toBeGreaterThan(0);
    expect(data.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/brand/icons/circlerelay-app-icon-192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/brand/icons/circlerelay-app-icon-512.png", sizes: "512x512" }),
        expect.objectContaining({ src: "/brand/icons/circlerelay-app-icon-1024.png", purpose: "maskable" }),
      ]),
    );
  });

  it("offline page exists and keeps live-data boundary clear", () => {
    const html = renderToStaticMarkup(<OfflinePage />);

    expect(html).toContain("CircleRelay needs a connection for live circle updates.");
    expect(html).toContain("live SMS updates, team changes, billing, and summaries require network access");
    expect(html).toContain("Try dashboard again");
  });

  it("PWA registrar renders safely during server rendering", () => {
    const html = renderToStaticMarkup(<PwaRegistrar />);

    expect(html).toBe("");
  });

  it("service worker keeps authenticated and API data out of runtime cache", () => {
    const sw = fs.readFileSync(path.join(process.cwd(), "public/sw.js"), "utf8");

    expect(sw).toContain("CACHE_VERSION");
    expect(sw).toContain("caches.delete");
    expect(sw).toContain("SKIP_WAITING");
    expect(sw).toContain('url.pathname.startsWith("/api/")');
    expect(sw).toContain('url.pathname.startsWith("/dashboard")');
    expect(sw).toContain('url.pathname.startsWith("/account")');
    expect(sw).toContain('url.pathname.startsWith("/settings")');
    expect(sw).not.toContain("auth");
    expect(sw).not.toContain("supabase");
    expect(sw).not.toContain("billing_subscriptions");
    expect(sw).not.toContain("inbound_messages");
  });

  it("mobile-friendly metadata exists", async () => {
    const { metadata, viewport } = await import("@/app/layout");

    expect(metadata.applicationName).toBe("CircleRelay");
    expect(metadata.description).toBe("One shared line for every circle in your life.");
    expect(metadata.manifest).toBe("/manifest.webmanifest");
    expect(metadata.appleWebApp).toMatchObject({ capable: true, title: "CircleRelay" });
    expect(viewport.themeColor).toBe("#171326");
  });

  it("homepage shows CircleRelay soft rebrand positioning", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("CircleRelay");
    expect(html).toContain("One shared line for every circle in your life.");
    expect(html).toContain("Start your circle");
    expect(html).toContain("Care Mode");
    expect(html).toContain("Family Mode");
    expect(html).toContain("Household Mode");
    expect(html).toContain("Team Mode");
    expect(html).toContain("Group Mode");
  });

  it("push notification disabled state is clear", () => {
    const html = renderToStaticMarkup(<PushNotificationsComingSoon />);

    expect(html).toContain("Push notifications are coming soon.");
    expect(html).not.toContain("Enable push notifications");
    expect(html).not.toContain("Notifications enabled");
  });

  it("dedicated number feature is disabled safely", () => {
    const html = renderToStaticMarkup(<DedicatedFamilyNumberComingSoon />);

    expect(html).toContain("Dedicated family number is planned for Family Plus.");
    expect(html).toContain("shared line");
    expect(html).toContain("Twilio number provisioning is not active yet");
    expect(html).not.toContain("Provision number");
    expect(html).not.toContain("Purchase number");
  });

  it("logged-in mobile nav is compact and excludes logged-out actions", () => {
    const html = renderToStaticMarkup(
      <SiteHeader user={{ id: "user-1", email: "care@example.com", name: "Care User" }} />,
    );

    expect(html).toContain("Menu");
    expect(html).toContain("Dashboard");
    expect(html).toContain("Account");
    expect(html).toContain("Team");
    expect(html).toContain("Settings");
    expect(html).toContain("Support");
    expect(html).toContain("Sign out");
    expect(html).not.toContain("Create account");
    expect(html).not.toContain("Sign in");
  });

  it("live dashboard does not render demo mode or the demo shared line", () => {
    const snapshot = {
      ...getDemoSnapshot(),
      careCircleId: "circle-live",
      careCircleName: "Mom's Care Circle",
      sharedPhone: "",
    };

    const html = renderToStaticMarkup(
      <DashboardClient
        initialSnapshot={snapshot}
        initialMode="live"
        smsStatus="SMS not configured yet"
        liveSmsReady={false}
      />,
    );

    expect(html).not.toContain("Demo Mode");
    expect(html).not.toContain("+15551230000");
    expect(html).toContain("Live dashboard");
    expect(html).toContain("SMS not configured yet");
  });

  it("dashboard renders circle type label and hides Care Mode disclaimer for non-care modes", () => {
    const snapshot = {
      ...getDemoSnapshot(),
      careCircleId: "circle-team",
      careCircleName: "Tigers Team Circle",
      circleType: "team" as const,
    };

    const html = renderToStaticMarkup(<DashboardClient initialSnapshot={snapshot} initialMode="live" />);

    expect(html).toContain("Team Mode");
    expect(html).toContain("Circle command center");
    expect(html).toContain("Updates and confirmations");
    expect(html).toContain("Important updates");
    expect(html).toContain("Games/events");
    expect(html).not.toContain("Medication confirmations are family-reported logs");
    expect(html).not.toContain("In an emergency, call 911");
    expect(html).not.toContain("medical advice, diagnosis");
  });

  it.each(["family", "household", "team", "group"] as const)("%s dashboard copy avoids medical claims", (circleType) => {
    const snapshot = {
      ...getDemoSnapshot(),
      careCircleId: `circle-${circleType}`,
      careCircleName: `${circleType} circle`,
      circleType,
      dailySummary: undefined,
    };

    const html = renderToStaticMarkup(<DashboardClient initialSnapshot={snapshot} initialMode="live" />);

    expect(html).not.toContain("medical advice");
    expect(html).not.toContain("diagnosis");
    expect(html).not.toContain("medication dosage");
    expect(html).not.toContain("emergency services");
    expect(html).not.toContain("Medication confirmations");
  });

  it("demo dashboard labels the demo shared line explicitly", () => {
    const html = renderToStaticMarkup(<DashboardClient initialSnapshot={getDemoSnapshot()} initialMode="demo" />);

    expect(html).toContain("Demo Mode");
    expect(html).toContain("Demo shared line");
    expect(html).toContain("+1 (555) 999-0000");
  });

  it("safety disclaimer wording remains intact", () => {
    const html = renderToStaticMarkup(<DisclaimerBanner />);

    expect(html).toContain("CircleRelay Care Mode is for family coordination only.");
    expect(html).toContain("does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services");
    expect(html).toContain("In an emergency, call 911 or your local emergency number.");
  });
});
