import { afterEach, describe, expect, it, vi } from "vitest";

const circleId = "11111111-1111-4111-8111-111111111111";

function jsonRequest(path: string, body: Record<string, unknown>) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

class TestAuthError extends Error {
  status: number;

  constructor(message = "Authentication required", status = 401) {
    super(message);
    this.status = status;
  }
}

function mockAuth(overrides: {
  requireUser?: () => Promise<unknown>;
  requireCareCircleAdminOrOwner?: () => Promise<unknown>;
  requireCareCircleMembership?: () => Promise<unknown>;
} = {}) {
  vi.doMock("@/lib/supabase/auth", () => ({
    AuthError: TestAuthError,
    requireUser: overrides.requireUser || vi.fn(async () => ({ id: "user-1" })),
    requireCareCircleAdminOrOwner: overrides.requireCareCircleAdminOrOwner || vi.fn(async () => ({ role: "owner", careCircleId: circleId })),
    requireCareCircleMembership: overrides.requireCareCircleMembership || vi.fn(async () => ({ role: "member", careCircleId: circleId })),
    authErrorResponse: vi.fn((error: unknown) =>
      Response.json(
        { error: error instanceof Error ? error.message : "Request could not be completed" },
        { status: error instanceof TestAuthError ? error.status : 500 },
      ),
    ),
  }));
}

function mockPlan(planId: "free" | "starter" | "family" | "family_plus") {
  vi.doMock("@/lib/team/server", () => ({
    getCareCircleOwnerId: vi.fn(async () => "owner-user"),
  }));
  vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
    getCurrentUserPlan: vi.fn(async () => ({
      planId,
      status: planId === "free" ? "inactive" : "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    })),
  }));
}

function selectColumns(row: Record<string, unknown>, columns: string) {
  const selected = new Set(columns.split(",").map((column) => column.trim().split(/\s+/)[0]));
  return Object.fromEntries(Object.entries(row).filter(([key]) => selected.has(key)));
}

function mockExportAdmin() {
  const records: Record<string, Array<Record<string, unknown>>> = {
    inbound_messages: [
      { id: "msg-1", care_circle_id: circleId, sender_name: "Sarah", sender_phone: "+15550000000", cleaned_body: "Update", raw_body: "Raw", category: "general_update", created_at: "2026-01-01T00:00:00.000Z" },
      { id: "msg-cross", care_circle_id: "other-circle", sender_name: "Other", cleaned_body: "Private", raw_body: "Private", category: "concern", created_at: "2026-01-01T00:00:00.000Z" },
    ],
    tasks: [{ id: "task-1", care_circle_id: circleId, title: "Pickup", status: "open", created_at: "2026-01-02T00:00:00.000Z" }],
    supplies: [],
    medication_logs: [],
    appointments: [],
    concerns: [],
    daily_summaries: [],
  };

  const admin = {
    from: vi.fn((table: string) => {
      let selectedColumns = "id";
      let careCircleFilter: string | null = null;
      const builder = {
        select: vi.fn((columns: string) => {
          selectedColumns = columns;
          return builder;
        }),
        eq: vi.fn((column: string, value: string) => {
          if (column === "care_circle_id") careCircleFilter = value;
          return builder;
        }),
        gte: vi.fn(() => builder),
        lte: vi.fn(() => builder),
        order: vi.fn(async () => ({
          data: (records[table] || [])
            .filter((row) => !careCircleFilter || row.care_circle_id === careCircleFilter)
            .map((row) => selectColumns(row, selectedColumns)),
          error: null,
        })),
      };
      return builder;
    }),
  };

  vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
}

describe("export timeline and weekly summary beta", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("export requires auth", async () => {
    mockAuth({
      requireUser: vi.fn(async () => {
        throw new TestAuthError("Authentication required", 401);
      }),
    });

    const { POST } = await import("@/app/api/export/timeline/route");
    const res = await POST(jsonRequest("/api/export/timeline", { careCircleId: circleId, format: "json" }));

    expect(res.status).toBe(401);
  });

  it("export requires membership with owner or admin role", async () => {
    mockAuth({
      requireCareCircleAdminOrOwner: vi.fn(async () => {
        throw new TestAuthError("Care circle admin access required", 403);
      }),
    });
    mockPlan("family_plus");

    const { POST } = await import("@/app/api/export/timeline/route");
    const res = await POST(jsonRequest("/api/export/timeline", { careCircleId: circleId, format: "json" }));

    expect(res.status).toBe(403);
  });

  it("export excludes cross-circle data and selected secrets", async () => {
    mockAuth();
    mockPlan("family_plus");
    mockExportAdmin();

    const { POST } = await import("@/app/api/export/timeline/route");
    const res = await POST(jsonRequest("/api/export/timeline", { careCircleId: circleId, format: "json" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.content).toContain("msg-1");
    expect(json.content).not.toContain("msg-cross");
    expect(json.content).not.toContain("+15550000000");
    expect(json.content).toContain("CareRelay is for family coordination only and does not provide medical advice.");
  });

  it("export plan gate works", async () => {
    mockAuth();
    mockPlan("family");

    const { POST } = await import("@/app/api/export/timeline/route");
    const res = await POST(jsonRequest("/api/export/timeline", { careCircleId: circleId, format: "json" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe("plan_upgrade_required");
    expect(json.error).toContain("Family Plus");
  });

  it("weekly summary requires auth and membership", async () => {
    mockAuth({
      requireCareCircleMembership: vi.fn(async () => {
        throw new TestAuthError("Care circle access denied", 403);
      }),
    });
    mockPlan("family");

    const { POST } = await import("@/app/api/summaries/weekly/route");
    const res = await POST(jsonRequest("/api/summaries/weekly", { careCircleId: circleId }));

    expect(res.status).toBe(403);
  });

  it("weekly summary includes safety disclaimer", async () => {
    mockAuth();
    mockPlan("family");
    vi.doMock("@/lib/summaries/generateWeeklySummary", () => ({
      generateWeeklySummary: vi.fn(async () => ({
        summaryText: "This week had 3 family-reported updates.",
        source: "weekly_deterministic",
      })),
    }));

    const { POST } = await import("@/app/api/summaries/weekly/route");
    const res = await POST(jsonRequest("/api/summaries/weekly", { careCircleId: circleId }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.summaryText).toContain("does not provide medical advice");
    expect(json.summaryText).toContain("If this is an emergency");
    expect(json.html).toContain("CareRelay Weekly Summary");
  });

  it("disabled PDF state is clear because printable HTML is implemented first", async () => {
    mockAuth();
    mockPlan("family");
    vi.doMock("@/lib/summaries/generateWeeklySummary", () => ({
      generateWeeklySummary: vi.fn(async () => ({
        summaryText: "Factual weekly summary.",
        source: "weekly_deterministic",
      })),
    }));

    const { POST } = await import("@/app/api/summaries/weekly/route");
    const res = await POST(jsonRequest("/api/summaries/weekly", { careCircleId: circleId }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.format).toBe("html");
    expect(json.pdfAvailable).toBe(false);
    expect(json.pdfMessage).toContain("PDF generation is not enabled yet");
  });
});
