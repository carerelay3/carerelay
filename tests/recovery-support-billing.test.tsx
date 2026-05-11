import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  usePathname: () => "/settings",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("recovery, support, and billing UX", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("forgot password page renders", async () => {
    vi.doMock("@/lib/config", () => ({
      appConfig: {
        appUrl: "https://carerelay.xyz",
        supabaseConfigured: true,
      },
    }));

    const { default: ForgotPasswordPage } = await import("@/app/(marketing)/forgot-password/page");
    const html = renderToStaticMarkup(<ForgotPasswordPage />);

    expect(html).toContain("Reset your password");
    expect(html).toContain("https://carerelay.xyz/reset-password");
  });

  it("reset password page renders", async () => {
    vi.doMock("@/lib/config", () => ({
      appConfig: {
        supabaseConfigured: true,
      },
    }));

    const { default: ResetPasswordPage } = await import("@/app/(marketing)/reset-password/page");
    const html = renderToStaticMarkup(<ResetPasswordPage />);

    expect(html).toContain("Set a new password");
    expect(html).toContain("Update password");
  });

  it("support page renders", async () => {
    vi.doMock("@/lib/config", () => ({
      appConfig: {
        supportEmail: "help@carerelay.xyz",
      },
    }));

    const { default: SupportPage } = await import("@/app/(marketing)/support/page");
    const html = renderToStaticMarkup(<SupportPage />);

    expect(html).toContain("CareRelay help");
    expect(html).toContain("Account help");
    expect(html).toContain("Billing help");
    expect(html).toContain("SMS not showing");
    expect(html).toContain("help@carerelay.xyz");
    expect(html).toContain("If this is an emergency");
  });

  it("billing portal requires auth", async () => {
    class AuthError extends Error {
      status = 401;
    }

    vi.doMock("@/lib/config", () => ({
      appConfig: {
        stripeConfigured: true,
        appUrl: "https://carerelay.xyz",
      },
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => {
        throw new AuthError("Authentication required");
      }),
      authErrorResponse: vi.fn((error: unknown) =>
        Response.json(
          { error: error instanceof Error ? error.message : "Request could not be completed" },
          { status: error instanceof AuthError ? error.status : 500 },
        ),
      ),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));
    vi.doMock("@/lib/stripe/client", () => ({ getStripeClient: () => null }));

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST(new Request("http://localhost/api/billing/portal", { method: "POST" }));

    expect(res.status).toBe(401);
  });

  it("billing portal does not accept arbitrary customer ID", async () => {
    const createPortal = vi.fn(async () => ({ url: "https://billing.stripe.test/session" }));
    const subscriptionBuilder: Record<string, unknown> = {};
    subscriptionBuilder.select = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.eq = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.not = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.order = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.limit = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.maybeSingle = vi.fn(async () => ({
      data: { stripe_customer_id: "cus_real_customer" },
      error: null,
    }));

    vi.doMock("@/lib/config", () => ({
      appConfig: {
        stripeConfigured: true,
        appUrl: "https://carerelay.xyz",
      },
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user-1" })),
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({
      getSupabaseAdmin: () => ({ from: vi.fn(() => subscriptionBuilder) }),
    }));
    vi.doMock("@/lib/stripe/client", () => ({
      getStripeClient: () => ({
        billingPortal: { sessions: { create: createPortal } },
      }),
    }));

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST(new Request("http://localhost/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: "cus_attacker" }),
    }));

    expect(res.status).toBe(200);
    expect(createPortal).toHaveBeenCalledWith({
      customer: "cus_real_customer",
      return_url: "https://carerelay.xyz/settings",
    });
  });

  it("settings links to account, team, and support", async () => {
    const careCircleBuilder: Record<string, unknown> = {};
    careCircleBuilder.select = vi.fn(() => careCircleBuilder);
    careCircleBuilder.eq = vi.fn(() => careCircleBuilder);
    careCircleBuilder.limit = vi.fn(() => careCircleBuilder);
    careCircleBuilder.maybeSingle = vi.fn(async () => ({ data: { id: "circle-1" }, error: null }));

    const subscriptionBuilder: Record<string, unknown> = {};
    subscriptionBuilder.select = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.eq = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.not = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.order = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.limit = vi.fn(() => subscriptionBuilder);
    subscriptionBuilder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));

    const memberCountBuilder: Record<string, unknown> = {};
    memberCountBuilder.select = vi.fn(() => memberCountBuilder);
    memberCountBuilder.eq = vi.fn(() => memberCountBuilder);
    memberCountBuilder.neq = vi.fn(async () => ({ count: 1, error: null }));

    vi.doMock("@/lib/config", () => ({
      appConfig: {
        stripeConfigured: false,
      },
      hasSupabase: () => true,
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn((table: string) => {
          if (table === "care_circles") return careCircleBuilder;
          if (table === "billing_subscriptions") return subscriptionBuilder;
          return memberCountBuilder;
        }),
      }),
    }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({
        planId: "free",
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })),
    }));
    vi.doMock("@/lib/stripe/getPlanLimits", () => ({
      getPlanLimits: vi.fn(() => ({
        maxFamilyMembers: 2,
      })),
    }));
    vi.doMock("@/lib/supabase/careCircleSelection", () => ({
      getSelectedCareCircleForUser: vi.fn(async () => ({
        circles: [{ id: "circle-1", name: "Mom's Care Circle" }],
        selectedCircle: { id: "circle-1", name: "Mom's Care Circle" },
        requestedCareCircleDenied: false,
      })),
    }));

    const { default: SettingsPage } = await import("@/app/settings/page");
    const html = renderToStaticMarkup(await SettingsPage());

    expect(html).toContain('href="/account?careCircleId=circle-1"');
    expect(html).toContain('href="/team?careCircleId=circle-1"');
    expect(html).toContain('href="/support"');
  });

  it("unavailable billing portal returns safe error", async () => {
    vi.doMock("@/lib/config", () => ({
      appConfig: {
        stripeConfigured: false,
        appUrl: "https://carerelay.xyz",
      },
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user-1" })),
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));
    vi.doMock("@/lib/stripe/client", () => ({ getStripeClient: () => null }));

    const { POST } = await import("@/app/api/billing/portal/route");
    const res = await POST(new Request("http://localhost/api/billing/portal", { method: "POST" }));
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.code).toBe("stripe_not_configured");
    expect(json.error).toContain("Billing portal is not configured");
  });
});
