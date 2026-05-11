import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

const circleId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";

function jsonRequest(path: string, body: Record<string, unknown>) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function careCircleOwnerBuilder(ownerId = "owner-user") {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => ({ data: { owner_id: ownerId }, error: null }));
  return builder;
}

function memberCountBuilder(count: number) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.neq = vi.fn(async () => ({ count, error: null }));
  return builder;
}

function duplicatePhoneBuilder(found = false) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.neq = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => ({ data: found ? { id: "existing" } : null, error: null }));
  return builder;
}

function targetMemberBuilder(role = "member", userId: string | null = "target-user") {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => ({
    data: {
      id: memberId,
      care_circle_id: circleId,
      user_id: userId,
      name: "Aunt June",
      role,
      permission_level: role === "owner" || role === "admin" ? "admin" : "contributor",
      status: "active",
    },
    error: null,
  }));
  return builder;
}

describe("team management", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("/team requires auth", async () => {
    vi.doMock("@/lib/config", () => ({ hasSupabase: () => true }));
    vi.doMock("@/lib/supabase/auth", () => ({
      getCurrentSupabaseUser: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => null }));

    const { default: TeamPage } = await import("@/app/team/page");

    await expect(TeamPage()).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("owner can add member", async () => {
    const insert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(async () => ({
          data: { id: memberId, name: "Aunt June", phone: "(555) 123-4567", email: null, role: "member", status: "active" },
          error: null,
        })),
      })),
    }));
    const familyBuilders = [memberCountBuilder(1), duplicatePhoneBuilder(false), { insert }];
    const admin = {
      from: vi.fn((table: string) => (table === "care_circles" ? careCircleOwnerBuilder() : familyBuilders.shift())),
    };

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({ planId: "family", status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false })),
    }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "owner-user" })),
        requireCareCircleAdminOrOwner: vi.fn(async () => ({ role: "owner", careCircleId: circleId })),
      };
    });

    const { POST } = await import("@/app/api/team/add/route");
    const res = await POST(jsonRequest("/api/team/add", {
      careCircleId: circleId,
      name: "Aunt June",
      phone: "(555) 123-4567",
      role: "member",
    }));

    expect(res.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      care_circle_id: circleId,
      name: "Aunt June",
      phone_normalized: "+15551234567",
      role: "member",
      status: "active",
    }));
  });

  it("member cannot add member", async () => {
    const admin = { from: vi.fn() };
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "member-user" })),
        requireCareCircleAdminOrOwner: vi.fn(async () => {
          throw new actual.AuthError("Care circle admin access required", 403);
        }),
      };
    });

    const { POST } = await import("@/app/api/team/add/route");
    const res = await POST(jsonRequest("/api/team/add", { careCircleId: circleId, name: "Aunt June", phone: "(555) 123-4567" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe("permission_denied");
  });

  it("owner cannot remove last owner", async () => {
    const familyBuilders = [targetMemberBuilder("owner", "owner-user"), memberCountBuilder(1)];
    const admin = { from: vi.fn(() => familyBuilders.shift()) };

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "owner-user" })),
        requireCareCircleAdminOrOwner: vi.fn(async () => ({ role: "owner", careCircleId: circleId })),
      };
    });

    const { POST } = await import("@/app/api/team/remove/route");
    const res = await POST(jsonRequest("/api/team/remove", { careCircleId: circleId, memberId }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe("last_owner_blocked");
  });

  it("admin cannot remove owner", async () => {
    const admin = { from: vi.fn(() => targetMemberBuilder("owner", "owner-user")) };

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "admin-user" })),
        requireCareCircleAdminOrOwner: vi.fn(async () => ({ role: "admin", careCircleId: circleId })),
      };
    });

    const { POST } = await import("@/app/api/team/remove/route");
    const res = await POST(jsonRequest("/api/team/remove", { careCircleId: circleId, memberId }));

    expect(res.status).toBe(403);
  });

  it("owner can transfer ownership", async () => {
    const updateCircle = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }));
    const updateMember = vi.fn(() => {
      const builder: Record<string, unknown> = {};
      builder.eq = vi.fn(() => builder);
      builder.neq = vi.fn(async () => ({ error: null }));
      return builder;
    });
    const familyBuilders = [targetMemberBuilder("member", "new-owner"), { update: updateMember }, { update: updateMember }];
    const admin = {
      from: vi.fn((table: string) => (table === "care_circles" ? { update: updateCircle } : familyBuilders.shift())),
    };

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "owner-user" })),
        requireCareCircleOwner: vi.fn(async () => ({ role: "owner", careCircleId: circleId })),
      };
    });

    const { POST } = await import("@/app/api/team/transfer-owner/route");
    const res = await POST(jsonRequest("/api/team/transfer-owner", { careCircleId: circleId, memberId, confirmation: "TRANSFER" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ownerUserId).toBe("new-owner");
    expect(updateCircle).toHaveBeenCalledWith(expect.objectContaining({ owner_id: "new-owner" }));
  });

  it("duplicate phone is blocked", async () => {
    const familyBuilders = [memberCountBuilder(1), duplicatePhoneBuilder(true)];
    const admin = {
      from: vi.fn((table: string) => (table === "care_circles" ? careCircleOwnerBuilder() : familyBuilders.shift())),
    };

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({ planId: "family", status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false })),
    }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "owner-user" })),
        requireCareCircleAdminOrOwner: vi.fn(async () => ({ role: "owner", careCircleId: circleId })),
      };
    });

    const { POST } = await import("@/app/api/team/add/route");
    const res = await POST(jsonRequest("/api/team/add", { careCircleId: circleId, name: "Aunt June", phone: "(555) 123-4567" }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.code).toBe("duplicate_phone");
  });

  it("removed member loses access", async () => {
    vi.doUnmock("@/lib/supabase/auth");
    const admin = {
      from: vi.fn((table: string) => {
        if (table === "care_circles") {
          const builder: Record<string, unknown> = {};
          builder.select = vi.fn(() => builder);
          builder.eq = vi.fn(() => builder);
          builder.maybeSingle = vi.fn(async () => ({ data: { id: circleId, owner_id: "owner-user" }, error: null }));
          return builder;
        }
        const builder: Record<string, unknown> = {};
        builder.select = vi.fn(() => builder);
        builder.eq = vi.fn(() => builder);
        builder.maybeSingle = vi.fn(async () => ({ data: { id: memberId, status: "removed", role: "member" }, error: null }));
        return builder;
      }),
    };
    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));

    const { getUserCareCircleRole } = await import("@/lib/supabase/auth");
    await expect(getUserCareCircleRole("removed-user", circleId)).resolves.toBeNull();
  });

  it("plan limit blocks extra member clearly", async () => {
    const familyBuilders = [memberCountBuilder(2)];
    const admin = {
      from: vi.fn((table: string) => (table === "care_circles" ? careCircleOwnerBuilder() : familyBuilders.shift())),
    };

    vi.doMock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => admin }));
    vi.doMock("@/lib/stripe/getCurrentUserPlan", () => ({
      getCurrentUserPlan: vi.fn(async () => ({ planId: "free", status: "inactive", currentPeriodEnd: null, cancelAtPeriodEnd: false })),
    }));
    vi.doMock("@/lib/supabase/auth", async () => {
      const actual = await vi.importActual<typeof import("@/lib/supabase/auth")>("@/lib/supabase/auth");
      return {
        ...actual,
        requireUser: vi.fn(async () => ({ id: "owner-user" })),
        requireCareCircleAdminOrOwner: vi.fn(async () => ({ role: "owner", careCircleId: circleId })),
      };
    });

    const { POST } = await import("@/app/api/team/add/route");
    const res = await POST(jsonRequest("/api/team/add", { careCircleId: circleId, name: "Aunt June", phone: "(555) 123-4567" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.code).toBe("plan_limit_reached");
    expect(json.error).toContain("Upgrade");
  });
});
