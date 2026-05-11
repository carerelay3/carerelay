import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const liveSnapshot = {
  careCircleId: "circle-1",
  careCircleName: "Mom's Care Circle",
  recipientName: "Mom",
  sharedPhone: "+15551234567",
  members: [],
  messages: [],
  tasks: [],
  appointments: [],
  supplies: [],
  concerns: [],
  activity: [],
  handoffs: [],
};

function setupAdmin(existingCircles: Array<{ id: string }> = []) {
  const inserts: Record<string, ReturnType<typeof vi.fn>> = {
    profiles: vi.fn(async () => ({ error: null })),
    care_recipients: vi.fn(async () => ({ error: null })),
    family_members: vi.fn(async () => ({ error: null })),
  };

  const admin = {
    from: vi.fn((table: string) => {
      if (table === "care_circles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(async () => ({ data: existingCircles, error: null })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: { id: "circle-new" }, error: null })),
            })),
          })),
        };
      }

      if (table === "profiles") {
        return { upsert: inserts.profiles };
      }

      if (table === "care_recipients") {
        return { insert: inserts.care_recipients };
      }

      if (table === "family_members") {
        return { insert: inserts.family_members };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({ data: null, error: null })),
              })),
            })),
          })),
        })),
      };
    }),
  };

  return { admin, inserts };
}

describe("onboarding and live account state", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("free plan fallback returns free, not demo", async () => {
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));

    const { getCurrentUserPlan } = await import("@/lib/stripe/getCurrentUserPlan");
    const plan = await getCurrentUserPlan("user-1");

    expect(plan.planId).toBe("free");
    expect(plan.status).toBe("inactive");
  });

  it("free user can create one care circle", async () => {
    vi.doMock("@/lib/config", () => ({
      hasSupabase: () => true,
      appConfig: { twilioPhoneNumber: "+15559990000" },
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({
        id: "user-1",
        email: "care@example.com",
        user_metadata: { full_name: "Care User" },
      })),
      AuthError: class AuthError extends Error {
        status = 401;
      },
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({
        planId: "free",
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })),
    }));
    const { admin } = setupAdmin([]);
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));

    const { POST } = await import("@/app/api/setup/route");
    const res = await POST(new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Mom", keyword: "MOM", members: [] }),
    }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.mode).toBe("live-ready");
    expect(body.planId).toBe("free");
  });

  it("setup returns safe error when service role is missing", async () => {
    vi.doMock("@/lib/config", () => ({
      hasSupabase: () => true,
      appConfig: { twilioPhoneNumber: "+15559990000" },
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com", user_metadata: {} })),
      AuthError: class AuthError extends Error {
        status = 401;
      },
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));

    const { POST } = await import("@/app/api/setup/route");
    const res = await POST(new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Mom", keyword: "MOM", members: [] }),
    }));

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toMatchObject({ code: "service_role_missing" });
  });

  it("dashboard does not show Demo Mode for live authenticated user", async () => {
    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/dashboardRecords", () => ({
      getDashboardSnapshotForUser: vi.fn(async () => liveSnapshot),
    }));
    vi.doMock("@/lib/supabase/careCircleSelection", () => ({
      getSelectedCareCircleForUser: vi.fn(async () => ({
        circles: [{ id: "circle-1", name: "Mom's Care Circle" }],
        selectedCircle: { id: "circle-1", name: "Mom's Care Circle" },
        requestedCareCircleDenied: false,
      })),
    }));

    const { default: DashboardPage } = await import("@/app/dashboard/page");
    const html = renderToStaticMarkup(await DashboardPage());

    expect(html).not.toContain("Demo Mode");
    expect(html).toContain("Live SMS");
  });

  it("settings shows current plan and billing status", async () => {
    vi.doMock("@/lib/config", () => ({ appConfig: { stripeConfigured: false }, hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));
    vi.doMock("@/lib/supabase/careCircleSelection", () => ({
      getSelectedCareCircleForUser: vi.fn(async () => ({
        circles: [],
        selectedCircle: null,
        requestedCareCircleDenied: false,
      })),
    }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({
        planId: "family",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })),
    }));

    const { default: SettingsPage } = await import("@/app/settings/page");
    const html = renderToStaticMarkup(await SettingsPage());

    expect(html).toContain("Family");
    expect(html).toContain("Billing status: active");
    expect(html).toContain("Upgrade Plan");
    expect(html).not.toContain("Demo Mode");
  });

  it("setup plan limit returns clear error", async () => {
    vi.doMock("@/lib/config", () => ({
      hasSupabase: () => true,
      appConfig: { twilioPhoneNumber: "+15559990000" },
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com", user_metadata: {} })),
      AuthError: class AuthError extends Error {
        status = 401;
      },
      authErrorResponse: vi.fn(() => Response.json({ error: "Request could not be completed" }, { status: 500 })),
    }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({
        planId: "free",
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })),
    }));
    const { admin } = setupAdmin([{ id: "circle-existing" }]);
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));

    const { POST } = await import("@/app/api/setup/route");
    const res = await POST(new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Dad", keyword: "DAD", members: [] }),
    }));

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({ code: "plan_limit_reached" });
  });
});
