import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("privacy request workflow", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("unauthenticated privacy request is rejected", async () => {
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

    const { POST } = await import("@/app/api/privacy/request/route");
    const res = await POST(new Request("http://localhost/api/privacy/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "export_my_data" }),
    }));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Authentication required" });
  });

  it("authenticated user can create their own privacy request", async () => {
    const single = vi.fn(async () => ({
      data: { id: "privacy-1", status: "open", created_at: "2026-05-13T12:00:00.000Z" },
      error: null,
    }));
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const admin = { from: vi.fn(() => ({ insert })) };

    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));

    const { POST } = await import("@/app/api/privacy/request/route");
    const res = await POST(new Request("http://localhost/api/privacy/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "delete_care_circle_data", details: "Review circle-1 before deletion." }),
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "user-1",
      request_type: "delete_care_circle_data",
      details: "Review circle-1 before deletion.",
      status: "open",
    }));
  });

  it("normal user cannot view all privacy requests in admin", async () => {
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "user@example.com" })),
    }));
    vi.doMock("@/lib/admin/platform", () => ({
      requirePlatformAdmin: vi.fn(async () => {
        throw new Error("Platform admin access required");
      }),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));

    const { default: AdminPage } = await import("@/app/admin/page");
    await expect(AdminPage()).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });

  it("privacy page links to request flow", async () => {
    const { default: PrivacyPage } = await import("@/app/(marketing)/privacy/page");
    const html = renderToStaticMarkup(<PrivacyPage />);

    expect(html).toContain("Submit a privacy or data request");
    expect(html).toContain('href="/privacy/request"');
  });
});
