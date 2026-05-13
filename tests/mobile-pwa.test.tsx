import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import manifest from "@/app/manifest";
import { DashboardClient } from "@/components/DashboardClient";
import { DedicatedFamilyNumberComingSoon, PushNotificationsComingSoon } from "@/components/MobileFeatureScaffolds";
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

    expect(data.name).toBe("CareRelay");
    expect(data.short_name).toBe("CareRelay");
    expect(data.start_url).toBe("/dashboard");
    expect(data.display).toBe("standalone");
    expect(data.icons?.length).toBeGreaterThan(0);
    expect(data.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icons/icon-192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/icons/icon-512.png", sizes: "512x512" }),
        expect.objectContaining({ src: "/icons/maskable-512.png", purpose: "maskable" }),
      ]),
    );
  });

  it("mobile-friendly metadata exists", async () => {
    const { metadata, viewport } = await import("@/app/layout");

    expect(metadata.applicationName).toBe("CareRelay");
    expect(metadata.manifest).toBe("/manifest.webmanifest");
    expect(metadata.appleWebApp).toMatchObject({ capable: true, title: "CareRelay" });
    expect(viewport.themeColor).toBe("#0D6B63");
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
    expect(html).toContain("shared number");
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

  it("demo dashboard labels the demo shared line explicitly", () => {
    const html = renderToStaticMarkup(<DashboardClient initialSnapshot={getDemoSnapshot()} initialMode="demo" />);

    expect(html).toContain("Demo Mode");
    expect(html).toContain("Demo shared line");
    expect(html).toContain("+1 (555) 999-0000");
  });

  it("safety disclaimer wording remains intact", () => {
    const html = renderToStaticMarkup(<DisclaimerBanner />);

    expect(html).toContain("CareRelay is for family coordination only.");
    expect(html).toContain("does not provide medical advice, diagnosis, treatment, medication dosage recommendations, monitoring, or emergency services");
    expect(html).toContain("In an emergency, call 911 or your local emergency number.");
  });
});
