import { afterEach, describe, expect, it, vi } from "vitest";

const baseRouting = {
  routingStatus: "matched_single_circle",
  careCircleId: "circle-1",
  familyMemberId: "member-1",
  cleanedBody: "Need: wipes",
};

function smsEventAdmin(events: unknown[]) {
  const processedMessageSids = new Set<string>();

  return {
    from: vi.fn((table: string) => {
      if (table === "sms_events") {
        return {
          insert: vi.fn(async (payload: unknown) => {
            events.push(payload);
            return { error: null };
          }),
        };
      }

      if (table === "processed_twilio_messages") {
        return {
          insert: vi.fn(async (payload: { message_sid?: string }) => {
            if (payload.message_sid && processedMessageSids.has(payload.message_sid)) {
              return { error: { code: "23505", message: "duplicate key value violates unique constraint" } };
            }

            if (payload.message_sid) processedMessageSids.add(payload.message_sid);
            return { error: null };
          }),
          update: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }
      return {};
    }),
  };
}

async function importInboundRoute(options: {
  events: unknown[];
  twilioAuthToken?: string;
  signatureValid?: boolean;
  routing?: unknown;
  persistError?: Error;
}) {
  const createLinkedRecords = vi.fn(async () => {
    if (options.persistError) throw options.persistError;
    return { inboundMessageId: "msg-1", linkedRecordId: "task-1", category: "supply", demoMode: false };
  });
  const validateRequest = vi.fn(() => options.signatureValid ?? false);
  const admin = smsEventAdmin(options.events);

  vi.doMock("@/lib/config", () => ({
    appConfig: { twilioAuthToken: options.twilioAuthToken || "" },
  }));
  vi.doMock("twilio", () => ({
    validateRequest,
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    getSupabaseAdmin: () => admin,
  }));
  vi.doMock("@/lib/routing/resolveCareCircleFromSender", () => ({
    resolveCareCircleFromSender: vi.fn(async () => options.routing || baseRouting),
  }));
  vi.doMock("@/lib/messages/createLinkedRecords", () => ({
    createLinkedRecords,
  }));

  const route = await import("@/app/api/sms/inbound/route");
  return { ...route, createLinkedRecords, validateRequest };
}

describe("inbound SMS event logging", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("creates sms_event on success", async () => {
    const events: unknown[] = [];
    const { POST } = await importInboundRoute({ events });

    const res = await POST(new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ From: "+15551234567", To: "+15557654321", Body: "Need: wipes", MessageSid: "SM123" }),
    }));

    expect(res.status).toBe(200);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      message_sid: "SM123",
      from_phone: "+15551234567",
      to_phone: "+15557654321",
      body_preview: "Need: wipes",
      routing_status: "matched_single_circle",
      care_circle_id: "circle-1",
      family_member_id: "member-1",
      parse_category: "supply",
      persistence_status: "success",
      error_code: null,
    });
  });

  it("invalid signature creates safe sms_event failure when possible", async () => {
    process.env.APP_BASE_URL = "http://localhost:3000";
    const events: unknown[] = [];
    const { POST } = await importInboundRoute({ events, twilioAuthToken: "token" });
    const form = new URLSearchParams({
      From: "+15551234567",
      To: "+15557654321",
      Body: "Need: wipes",
      MessageSid: "SMBAD",
    });

    const res = await POST(new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": "bad" },
      body: form,
    }));

    expect(res.status).toBe(403);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      message_sid: "SMBAD",
      signature_valid: false,
      persistence_status: "not_attempted",
      error_code: "signature_invalid",
    });
    expect(JSON.stringify(events[0])).not.toContain("token");
  });

  it("uses APP_BASE_URL for Twilio signature validation when set", async () => {
    process.env.APP_BASE_URL = "https://carerelay.xyz";
    process.env.NEXT_PUBLIC_APP_URL = "https://wrong.example";
    const events: unknown[] = [];
    const { POST, validateRequest } = await importInboundRoute({
      events,
      twilioAuthToken: "token",
      signatureValid: true,
    });
    const form = new URLSearchParams({
      From: "+15551234567",
      To: "+15557654321",
      Body: "Need: wipes",
      MessageSid: "SMAPPBASE",
    });

    const res = await POST(new Request("https://carerelay.xyz/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": "valid" },
      body: form,
    }));

    expect(res.status).toBe(200);
    expect(validateRequest).toHaveBeenCalledWith(
      "token",
      "valid",
      "https://carerelay.xyz/api/sms/inbound",
      expect.objectContaining({ MessageSid: "SMAPPBASE" }),
    );
  });

  it("falls back to NEXT_PUBLIC_APP_URL for Twilio validation outside production only", async () => {
    delete process.env.APP_BASE_URL;
    vi.stubEnv("NODE_ENV", "test");
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const events: unknown[] = [];
    const { POST, validateRequest } = await importInboundRoute({
      events,
      twilioAuthToken: "token",
      signatureValid: true,
    });
    const form = new URLSearchParams({
      From: "+15551234567",
      To: "+15557654321",
      Body: "Need: wipes",
      MessageSid: "SMFALLBACK",
    });

    const res = await POST(new Request("http://localhost:3000/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": "valid" },
      body: form,
    }));

    expect(res.status).toBe(200);
    expect(validateRequest).toHaveBeenCalledWith(
      "token",
      "valid",
      "http://localhost:3000/api/sms/inbound",
      expect.objectContaining({ MessageSid: "SMFALLBACK" }),
    );
  });

  it("does not fall back to NEXT_PUBLIC_APP_URL for Twilio validation in production", async () => {
    delete process.env.APP_BASE_URL;
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_APP_URL = "https://public.example";
    const events: unknown[] = [];
    const { POST, validateRequest } = await importInboundRoute({ events, twilioAuthToken: "token" });
    const form = new URLSearchParams({
      From: "+15551234567",
      To: "+15557654321",
      Body: "Need: wipes",
      MessageSid: "SMPRODNOBASE",
    });

    const res = await POST(new Request("https://public.example/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": "valid" },
      body: form,
    }));

    expect(res.status).toBe(403);
    expect(validateRequest).not.toHaveBeenCalled();
    expect(events[0]).toMatchObject({
      message_sid: "SMPRODNOBASE",
      persistence_status: "not_attempted",
      error_code: "missing_app_base_url",
    });
  });

  it("invalid Twilio validation URL config returns safe error and logs without validating", async () => {
    process.env.APP_BASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const events: unknown[] = [];
    const { POST, validateRequest } = await importInboundRoute({ events, twilioAuthToken: "token" });
    const form = new URLSearchParams({
      From: "+15551234567",
      To: "+15557654321",
      Body: "Need: wipes",
      MessageSid: "SMBADURL",
    });

    const res = await POST(new Request("http://localhost:3000/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": "valid" },
      body: form,
    }));

    expect(res.status).toBe(403);
    expect(await res.text()).toContain("CircleRelay could not log this update right now");
    expect(validateRequest).not.toHaveBeenCalled();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      message_sid: "SMBADURL",
      persistence_status: "not_attempted",
      error_code: "invalid_app_base_url",
    });
  });

  it("unknown sender creates sms_event", async () => {
    const events: unknown[] = [];
    const { POST } = await importInboundRoute({
      events,
      routing: {
        routingStatus: "unknown_sender",
        cleanedBody: "Hello",
        safeReply: "Could not match sender.",
      },
    });

    const res = await POST(new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: "+15551234567", to: "+15557654321", body: "Hello" }),
    }));

    expect(res.status).toBe(200);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      routing_status: "unknown_sender",
      persistence_status: "not_attempted",
      error_code: "unknown_sender",
    });
  });

  it("persistence failure creates sms_event", async () => {
    const events: unknown[] = [];
    const { POST } = await importInboundRoute({ events, persistError: new Error("database insert failed") });

    const res = await POST(new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: "+15551234567", to: "+15557654321", body: "Need: wipes" }),
    }));

    expect(res.status).toBe(200);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      routing_status: "matched_single_circle",
      parse_category: "supply",
      persistence_status: "failed",
      error_code: "persistence_failed",
      error_message: "database insert failed",
    });
  });

  it("duplicate Twilio MessageSid does not duplicate linked records and logs safely", async () => {
    const events: unknown[] = [];
    const { POST, createLinkedRecords } = await importInboundRoute({ events });
    const body = JSON.stringify({ From: "+15551234567", To: "+15557654321", Body: "Need: wipes", MessageSid: "SMDUP" });

    const first = await POST(new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    }));
    const second = await POST(new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    }));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await second.text()).toContain("CircleRelay already logged this update.");
    expect(createLinkedRecords).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      message_sid: "SMDUP",
      persistence_status: "duplicate",
      error_code: "duplicate_message_sid",
    });
  });
});
