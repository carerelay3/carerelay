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
});
