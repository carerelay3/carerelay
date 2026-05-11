import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("account auth foundation", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("logged-in nav hides sign-up and create-account actions", async () => {
    const { SiteHeader } = await import("@/components/SiteHeader");

    const html = renderToStaticMarkup(
      <SiteHeader user={{ id: "user-1", email: "care@example.com", name: "Care User" }} />,
    );

    expect(html).toContain("Dashboard");
    expect(html).toContain("Account");
    expect(html).toContain("Settings");
    expect(html).not.toContain("Create account");
    expect(html).not.toContain("Sign in");
  });

  it("logged-in nav shows sign out", async () => {
    const { SiteHeader } = await import("@/components/SiteHeader");

    const html = renderToStaticMarkup(
      <SiteHeader user={{ id: "user-1", email: "care@example.com" }} />,
    );

    expect(html).toContain("Sign out");
  });

  it("/account requires auth", async () => {
    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({ getCurrentSupabaseUser: vi.fn(async () => null) }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({
        planId: "free",
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })),
    }));

    const { default: AccountPage } = await import("@/app/account/page");

    await expect(AccountPage()).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("profile update requires auth", async () => {
    class AuthError extends Error {
      status = 401;
    }

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

    const { POST } = await import("@/app/api/profile/update/route");
    const res = await POST(new Request("http://localhost/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Care User" }),
    }));

    expect(res.status).toBe(401);
  });

  it("profile update only updates the current user's profile", async () => {
    const upsert = vi.fn(async () => ({ error: null }));
    const admin = {
      from: vi.fn(() => ({ upsert })),
    };

    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "current-user", email: "current@example.com" })),
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));

    const { POST } = await import("@/app/api/profile/update/route");
    const res = await POST(new Request("http://localhost/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "someone-else",
        fullName: "Care User",
        phone: "(555) 123-4567",
        timezone: "America/Chicago",
      }),
    }));

    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "current-user",
        email: "current@example.com",
        full_name: "Care User",
        phone_normalized: "+15551234567",
        timezone: "America/Chicago",
      }),
      { onConflict: "id" },
    );
  });

  it("profile page renders account fields", async () => {
    const query = (table: string) => {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.order = vi.fn(async () => {
        if (table === "care_circles") return { data: [{ id: "circle-1", name: "Mom's Care Circle" }], error: null };
        return { data: [], error: null };
      });
      builder.maybeSingle = vi.fn(async () => ({
        data: {
          email: "care@example.com",
          full_name: "Care User",
          phone: "(555) 123-4567",
          timezone: "America/Chicago",
          created_at: "2026-01-02T00:00:00.000Z",
        },
        error: null,
      }));
      builder.in = vi.fn(async () => ({ data: [], error: null }));
      return builder;
    };

    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({
        id: "user-1",
        email: "care@example.com",
        created_at: "2026-01-01T00:00:00.000Z",
        user_metadata: { full_name: "Care User" },
      })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => ({ from: query }) }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({
        planId: "family",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })),
    }));

    const { default: AccountPage } = await import("@/app/account/page");
    const html = renderToStaticMarkup(await AccountPage());

    expect(html).toContain("care@example.com");
    expect(html).toContain("Care User");
    expect(html).toContain("(555) 123-4567");
    expect(html).toContain("America/Chicago");
    expect(html).toContain("family");
    expect(html).toContain("Mom&#x27;s Care Circle");
  });
});
