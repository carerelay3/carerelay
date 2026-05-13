import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  useRouter: () => ({ refresh: vi.fn() }),
}));

function countOrRowsBuilder(rows: unknown[] = [], count = rows.length) {
  return {
    select: vi.fn((_columns?: string, options?: { count?: string; head?: boolean }) => {
      if (options?.head) return Promise.resolve({ count, error: null });
      const builder: Record<string, unknown> = {};
      builder.order = vi.fn(() => builder);
      builder.limit = vi.fn(async () => ({ data: rows, error: null }));
      return builder;
    }),
  };
}

describe("platform admin tools", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("/admin rejects normal users", async () => {
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

  it("founder/admin can access admin", async () => {
    const admin = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return countOrRowsBuilder([{ id: "user-1", email: "founder@example.com", platform_role: "founder" }], 1);
        }
        if (table === "care_circles") {
          return countOrRowsBuilder([{ id: "circle-1", name: "Mom's Care Circle", owner_id: "user-1" }], 1);
        }
        if (table === "family_members") return countOrRowsBuilder([], 0);
        if (table === "sms_events") {
          return countOrRowsBuilder([
            {
              id: "sms-event-1",
              created_at: "2026-05-13T12:00:00.000Z",
              from_phone: "+15551234567",
              to_phone: "+15557654321",
              routing_status: "matched_single_circle",
              parse_category: "task",
              persistence_status: "success",
              error_code: null,
            },
          ], 1);
        }
        if (table === "privacy_requests") {
          return countOrRowsBuilder([
            {
              id: "privacy-1",
              user_id: "user-1",
              request_type: "delete_my_account",
              details: "Please review my account deletion request.",
              status: "open",
              created_at: "2026-05-13T12:30:00.000Z",
              handled_at: null,
            },
          ], 1);
        }
        return countOrRowsBuilder([{ plan_id: "family", status: "active" }], 1);
      }),
    };

    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "founder-user", email: "founder@example.com" })),
    }));
    vi.doMock("@/lib/admin/platform", () => ({
      requirePlatformAdmin: vi.fn(async () => "founder"),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));

    const { default: AdminPage } = await import("@/app/admin/page");
    const html = renderToStaticMarkup(await AdminPage());

    expect(html).toContain("CircleRelay operations");
    expect(html).toContain("Total users");
    expect(html).toContain("Recent care circles");
    expect(html).toContain("SMS Operations");
    expect(html).toContain("matched_single_circle");
    expect(html).toContain("Privacy Requests");
    expect(html).toContain("delete_my_account");
  });

  it("platform role helper works", async () => {
    vi.doUnmock("@/lib/admin/platform");
    const builder: Record<string, unknown> = {};
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.maybeSingle = vi.fn(async () => ({ data: { platform_role: "admin" }, error: null }));

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => ({ from: vi.fn(() => builder) }) }));

    const { getPlatformRole, isPlatformAdminRole } = await import("@/lib/admin/platform");
    await expect(getPlatformRole("user-1")).resolves.toBe("admin");
    expect(isPlatformAdminRole("admin")).toBe(true);
    expect(isPlatformAdminRole("user")).toBe(false);
  });

  it("make-owner script validates required args", async () => {
    const { parseMakeOwnerArgs } = await import("@/scripts/make-owner");

    expect(() => parseMakeOwnerArgs([])).toThrow("Missing required --email");
    expect(() => parseMakeOwnerArgs(["--email", "founder@example.com"])).toThrow("Missing required --care-circle-id");
    expect(parseMakeOwnerArgs([
      "--email",
      "founder@example.com",
      "--care-circle-id",
      "11111111-1111-4111-8111-111111111111",
      "--platform-founder",
      "true",
    ])).toEqual({
      email: "founder@example.com",
      careCircleId: "11111111-1111-4111-8111-111111111111",
      platformFounder: true,
    });
  });

  it("normal admin cannot make platform admin unless founder", async () => {
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "admin-user" })),
        authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
      };
    });
    vi.doMock("@/lib/admin/platform", async () => {
      const { AuthError } = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        requirePlatformAdmin: vi.fn(async () => "admin"),
        requirePlatformFounder: vi.fn(async () => {
          throw new AuthError("Founder access required", 403);
        }),
      };
    });
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => ({ from: vi.fn() }) }));

    const { POST } = await import("@/app/api/admin/action/route");
    const res = await POST(new Request("http://localhost/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_platform_role",
        userId: "11111111-1111-4111-8111-111111111111",
        platformRole: "admin",
      }),
    }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe("permission_denied");
  });

  it("admin nav is visible only to founder/admin", async () => {
    const { SiteHeader } = await import("@/components/SiteHeader");

    const normalHtml = renderToStaticMarkup(<SiteHeader user={{ id: "user-1", email: "user@example.com", platformRole: "user" }} />);
    const adminHtml = renderToStaticMarkup(<SiteHeader user={{ id: "admin-1", email: "admin@example.com", platformRole: "admin" }} />);

    expect(normalHtml).not.toContain(">Admin<");
    expect(adminHtml).toContain(">Admin<");
  });
});
