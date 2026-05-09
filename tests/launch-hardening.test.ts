import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("launch hardening guardrails", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("does not export the service-role admin client from the browser client module", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "lib/supabase/client.ts"), "utf8");
    expect(source).not.toContain("getSupabaseAdmin");
    expect(source).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("keeps non-SQL files out of Supabase migrations", () => {
    const files = fs.readdirSync(path.join(process.cwd(), "supabase/migrations"));
    expect(files.every((file) => file.endsWith(".sql"))).toBe(true);
  });

  it("rejects Twilio form posts without a signature when a Twilio token is configured", async () => {
    vi.resetModules();
    process.env.TWILIO_AUTH_TOKEN = "test-token";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const { POST } = await import("@/app/api/sms/inbound/route");
    const req = new Request("http://localhost:3000/api/sms/inbound", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "From=%2B15551234567&To=%2B15559990000&Body=Hello",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("CareRelay could not log this update right now");
  });

  it("rejects Twilio JSON posts when a Twilio token is configured", async () => {
    vi.resetModules();
    process.env.TWILIO_AUTH_TOKEN = "test-token";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const { POST } = await import("@/app/api/sms/inbound/route");
    const req = new Request("http://localhost:3000/api/sms/inbound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: "+15551234567",
        To: "+15559990000",
        Body: "Meds: Mom took morning pills at 8am.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("CareRelay could not log this update right now");
  });

  it("requires auth before live setup can create a Supabase care circle", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    process.env.NEXT_PUBLIC_SMS_MODE = "live";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";

    const { POST } = await import("@/app/api/setup/route");
    const req = new Request("http://localhost:3000/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Mom", keyword: "MOM", members: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("does not fall back to demo data for live task status updates when admin is missing", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    process.env.NEXT_PUBLIC_SMS_MODE = "live";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { POST } = await import("@/app/api/tasks/status/route");
    const req = new Request("http://localhost:3000/api/tasks/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "task-demo-1", status: "done" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "Live data is not configured." });
  });

  it("does not fall back to demo data for live supply status updates when admin is missing", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    process.env.NEXT_PUBLIC_SMS_MODE = "live";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { POST } = await import("@/app/api/supplies/status/route");
    const req = new Request("http://localhost:3000/api/supplies/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplyId: "supply-demo-1", status: "purchased" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "Live data is not configured." });
  });

  it("does not fall back to demo data for live concern acknowledgements when admin is missing", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    process.env.NEXT_PUBLIC_SMS_MODE = "live";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { POST } = await import("@/app/api/concerns/acknowledge/route");
    const req = new Request("http://localhost:3000/api/concerns/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concernId: "concern-demo-1", by: "Sarah" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "Live data is not configured." });
  });

  it("rejects live task assignment when the assignee belongs to another care circle", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    process.env.NEXT_PUBLIC_SMS_MODE = "live";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";

    const updateTask = vi.fn();
    const admin = {
      from: vi.fn((table: string) => {
        if (table === "family_members") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(async () => ({ data: null, error: null })),
                })),
              })),
            })),
          };
        }

        return {
          update: updateTask,
        };
      }),
    };

    vi.doMock("@/lib/supabase/admin", () => ({
      getSupabaseAdmin: () => admin,
    }));
    vi.doMock("@/lib/supabase/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user-1" })),
      requireRecordMembership: vi.fn(async () => ({ id: "task-1", care_circle_id: "circle-1" })),
      authErrorResponse: vi.fn((error: unknown) =>
        Response.json({ error: error instanceof Error ? error.message : "Request could not be completed" }, { status: 500 }),
      ),
    }));

    const { POST } = await import("@/app/api/tasks/assign/route");
    const req = new Request("http://localhost:3000/api/tasks/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "task-1", memberId: "member-other-circle", memberName: "Jordan" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "Assignee must belong to this care circle." });
    expect(updateTask).not.toHaveBeenCalled();
  });
});
