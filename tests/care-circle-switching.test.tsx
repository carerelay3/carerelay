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

const baseSnapshot = {
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

describe("care circle switching", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("user can only switch to care circles they belong to", async () => {
    vi.doMock("@/lib/supabase/dashboardRecords", () => ({
      getUserCareCircles: vi.fn(async () => [
        { id: "circle-1", name: "Mom's Care Circle" },
        { id: "circle-2", name: "Dad's Care Circle" },
      ]),
    }));

    const { getSelectedCareCircleForUser } = await import("@/lib/supabase/careCircleSelection");
    const result = await getSelectedCareCircleForUser("user-1", "circle-not-mine");

    expect(result.selectedCircle?.id).toBe("circle-1");
    expect(result.circles.map((circle) => circle.id)).toEqual(["circle-1", "circle-2"]);
    expect(result.requestedCareCircleDenied).toBe(true);
  });

  it("dashboard uses the selected care circle", async () => {
    const getDashboardSnapshotForUser = vi.fn(async (careCircleId?: string) => ({
      ...baseSnapshot,
      careCircleId,
      careCircleName: "Dad's Care Circle",
      recipientName: "Dad",
    }));

    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/dashboardRecords", () => ({
      getDashboardSnapshotForUser,
    }));
    vi.doMock("@/lib/supabase/careCircleSelection", () => ({
      getSelectedCareCircleForUser: vi.fn(async () => ({
        circles: [
          { id: "circle-1", name: "Mom's Care Circle" },
          { id: "circle-2", name: "Dad's Care Circle" },
        ],
        selectedCircle: { id: "circle-2", name: "Dad's Care Circle" },
        requestedCareCircleDenied: false,
      })),
    }));

    const { default: DashboardPage } = await import("@/app/dashboard/page");
    const html = renderToStaticMarkup(
      await DashboardPage({ searchParams: Promise.resolve({ careCircleId: "circle-2" }) }),
    );

    expect(getDashboardSnapshotForUser).toHaveBeenCalledWith("circle-2");
    expect(html).toContain("Dad&#x27;s Care Circle");
  });

  it("no care circle shows setup CTA", async () => {
    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/dashboardRecords", () => ({
      getDashboardSnapshotForUser: vi.fn(async () => ({
        ...baseSnapshot,
        careCircleId: undefined,
        careCircleName: "No care circle yet",
      })),
    }));
    vi.doMock("@/lib/supabase/careCircleSelection", () => ({
      getSelectedCareCircleForUser: vi.fn(async () => ({
        circles: [],
        selectedCircle: null,
        requestedCareCircleDenied: false,
      })),
    }));

    const { default: DashboardPage } = await import("@/app/dashboard/page");
    const html = renderToStaticMarkup(await DashboardPage());

    expect(html).toContain("Create your first care circle");
    expect(html).toContain("Start setup");
  });

  it("one care circle does not show a confusing switcher", async () => {
    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/dashboardRecords", () => ({
      getDashboardSnapshotForUser: vi.fn(async () => baseSnapshot),
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

    expect(html).toContain("Selected care circle");
    expect(html).not.toContain("Care circle switcher");
  });

  it("multiple recipients UI is disabled safely", async () => {
    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => ({ id: "user-1", email: "care@example.com" })),
    }));
    vi.doMock("@/lib/supabase/dashboardRecords", () => ({
      getDashboardSnapshotForUser: vi.fn(async () => baseSnapshot),
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

    expect(html).toContain("Multiple care recipients are coming soon for Family Plus.");
    expect(html).not.toContain("Add recipient");
  });
});
