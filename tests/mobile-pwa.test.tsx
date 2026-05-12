import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import manifest from "@/app/manifest";
import { DedicatedFamilyNumberComingSoon, PushNotificationsComingSoon } from "@/components/MobileFeatureScaffolds";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

describe("mobile and PWA foundation", () => {
  it("manifest route has installability basics", () => {
    const data = manifest();

    expect(data.name).toBe("CareRelay");
    expect(data.short_name).toBe("CareRelay");
    expect(data.start_url).toBe("/dashboard");
    expect(data.display).toBe("standalone");
    expect(data.icons?.length).toBeGreaterThan(0);
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
});
