import { describe, expect, it, vi } from "vitest";
import { POST as mockPost } from "@/app/api/sms/mock/route";

vi.mock("@/lib/openai/createSummary", () => ({
  createOpenAiSummary: vi.fn().mockResolvedValue(null)
}));
import { POST as inboundPost } from "@/app/api/sms/inbound/route";
import { GET as seedGet } from "@/app/api/demo/seed/route";
import { GET as healthGet } from "@/app/api/health/route";
import { POST as parsePost } from "@/app/api/messages/parse/route";
import { POST as summaryPost } from "@/app/api/summaries/generate/route";
import { POST as checkoutPost } from "@/app/api/stripe/checkout/route";
import { POST as concernAckPost } from "@/app/api/concerns/acknowledge/route";
import { POST as taskAssignPost } from "@/app/api/tasks/assign/route";
import { POST as taskStatusPost } from "@/app/api/tasks/status/route";
import { POST as supplyStatusPost } from "@/app/api/supplies/status/route";
import { POST as handoffGenPost } from "@/app/api/handoffs/generate/route";
import { POST as handoffReviewPost } from "@/app/api/handoffs/review/route";
import { POST as exportPost } from "@/app/api/export/timeline/route";
import { POST as invitePost } from "@/app/api/members/invite/route";
import { POST as prefsPost } from "@/app/api/preferences/update/route";

describe("sms routes", () => {
  it("validates empty message on inbound", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ From: "+15550000001", To: "+15551230000", Body: "" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(400);
  });

  it("handles mock sms and returns snapshot", async () => {
    const req = new Request("http://localhost/api/sms/mock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "circle-demo-1", fromName: "Sarah", fromPhone: "+15550000001", body: "Task: call pharmacy" }),
    });
    const res = await mockPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot).toBeDefined();
    expect(json.snapshot.careCircleId).toBe("circle-demo-1");
    expect(json.parsed?.category).toBe("task");
  });

  it("handles unknown sender response", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ From: "+19998887777", To: "+15551230000", Body: "hello" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("not listed");
  });

  it("handles unknown CareRelay number", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ From: "+15550000001", To: "+19998887777", Body: "hello" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toContain("not connected");
  });

  it("returns TwiML for form-encoded concern message", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: "+15550000001", To: "+15551230000", Body: "She fell down" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("CareRelay flagged this for family attention");
    expect(text).toContain("does not provide medical advice");
    expect(text).toContain("911");
  });

  it("returns normal TwiML for form-encoded non-concern message", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: "+15550000001", To: "+15551230000", Body: "Meds done" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("CareRelay logged this as: medication");
  });

  it("returns summary command response via TwiML", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: "+15550000001", To: "+15551230000", Body: "Summary" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("CareRelay summary:");
    expect(text).toContain("open tasks");
    expect(text).toContain("CareRelay does not provide medical advice");
  });

  it("returns help command response via TwiML", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: "+15550000001", To: "+15551230000", Body: "Help" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("CareRelay commands:");
    expect(text).toContain("Task:");
    expect(text).toContain("STOP");
  });

  it("handles STOP opt-out command", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ From: "+15550000001", To: "+15551230000", Body: "Stop" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("opted out");
  });

  it("handles YES opt-in command", async () => {
    const req = new Request("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ From: "+15550000001", To: "+15551230000", Body: "Yes" }),
    });
    const res = await inboundPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("Welcome back");
  });

  it("rejects mock sms for unknown care circle", async () => {
    const req = new Request("http://localhost/api/sms/mock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "unknown-circle", fromName: "X", fromPhone: "+15551234567", body: "hello" }),
    });
    const res = await mockPost(req);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/health", () => {
  it("returns status and configuration flags", async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(typeof json.supabaseConfigured).toBe("boolean");
    expect(typeof json.twilioConfigured).toBe("boolean");
    expect(typeof json.openaiConfigured).toBe("boolean");
    expect(typeof json.stripeConfigured).toBe("boolean");
    expect(json.currentMode).toMatch(/demo|live/);
  });
});

describe("GET /api/demo/seed", () => {
  it("returns demo snapshot", async () => {
    const res = await seedGet();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.careCircleId).toBe("circle-demo-1");
    expect(Array.isArray(json.messages)).toBe(true);
    expect(Array.isArray(json.tasks)).toBe(true);
    expect(Array.isArray(json.activity)).toBe(true);
    expect(Array.isArray(json.handoffs)).toBe(true);
    expect(json.preferences).toBeDefined();
  });
});

describe("POST /api/messages/parse", () => {
  it("rejects empty message", async () => {
    const req = new Request("http://localhost/api/messages/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    const res = await parsePost(req);
    expect(res.status).toBe(400);
  });

  it("parses a valid message", async () => {
    const req = new Request("http://localhost/api/messages/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Task: pick up meds" }),
    });
    const res = await parsePost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.category).toBe("task");
  });

  it("returns validation error for missing field", async () => {
    const req = new Request("http://localhost/api/messages/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await parsePost(req);
    expect(res.status).toBe(400);
  });

  it("parses SMS command correctly", async () => {
    const req = new Request("http://localhost/api/messages/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Done: pick up prescription" }),
    });
    const res = await parsePost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.command).toBe("complete_task");
    expect(json.result.commandTarget).toBe("pick up prescription");
  });
});

describe("POST /api/summaries/generate", () => {
  it("returns fallback summary without crashing when no openai key", async () => {
    const req = new Request("http://localhost/api/summaries/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "circle-demo-1" }),
    });
    const res = await summaryPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summaryText).toBeTruthy();
    expect(json.generatedBy).toBe("fallback");
    expect(Array.isArray(json.openTasks)).toBe(true);
  });

  it("rejects invalid request body", async () => {
    const req = new Request("http://localhost/api/summaries/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await summaryPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/stripe/checkout", () => {
  it("returns demo checkout when stripe is not configured", async () => {
    const orig = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = "";

    const req = new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planId: "starter" }),
    });
    const res = await checkoutPost(req);
    
    process.env.STRIPE_SECRET_KEY = orig;
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.mode).toBe("demo");
    expect(json.redirectUrl).toBe("/setup?demoCheckout=1");
  });

  it("rejects invalid planId", async () => {
    const req = new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planId: "invalid" }),
    });
    const res = await checkoutPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/concerns/acknowledge", () => {
  it("acknowledges a concern", async () => {
    const req = new Request("http://localhost/api/concerns/acknowledge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ concernId: "con-1", by: "Sarah", note: "Will check tonight" }),
    });
    const res = await concernAckPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot).toBeDefined();
  });

  it("rejects invalid body", async () => {
    const req = new Request("http://localhost/api/concerns/acknowledge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await concernAckPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/tasks/assign", () => {
  it("assigns a task to a member", async () => {
    const req = new Request("http://localhost/api/tasks/assign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "task-1", memberId: "fm-1", memberName: "Sarah" }),
    });
    const res = await taskAssignPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot).toBeDefined();
  });

  it("rejects invalid body", async () => {
    const req = new Request("http://localhost/api/tasks/assign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await taskAssignPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/tasks/status", () => {
  it("updates task status", async () => {
    const req = new Request("http://localhost/api/tasks/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "task-1", status: "done", by: "Sarah" }),
    });
    const res = await taskStatusPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot).toBeDefined();
  });

  it("rejects invalid status", async () => {
    const req = new Request("http://localhost/api/tasks/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "task-1", status: "invalid" }),
    });
    const res = await taskStatusPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/supplies/status", () => {
  it("updates supply status", async () => {
    const req = new Request("http://localhost/api/supplies/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ supplyId: "sup-1", status: "purchased", by: "Sarah" }),
    });
    const res = await supplyStatusPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot).toBeDefined();
  });

  it("rejects invalid status", async () => {
    const req = new Request("http://localhost/api/supplies/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ supplyId: "sup-1", status: "invalid" }),
    });
    const res = await supplyStatusPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/handoffs/generate", () => {
  it("generates a handoff", async () => {
    const req = new Request("http://localhost/api/handoffs/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "circle-demo-1" }),
    });
    const res = await handoffGenPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.handoffText).toBeTruthy();
    expect(json.handoffText).toContain("Daily Handoff");
    expect(json.handoffText).toContain("CareRelay does not provide medical advice");
    expect(json.snapshot).toBeDefined();
  });

  it("rejects invalid body", async () => {
    const req = new Request("http://localhost/api/handoffs/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await handoffGenPost(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/handoffs/review", () => {
  it("reviews a handoff", async () => {
    // First generate one
    const genReq = new Request("http://localhost/api/handoffs/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "circle-demo-1" }),
    });
    const genRes = await handoffGenPost(genReq);
    const genJson = await genRes.json();
    const handoffId = genJson.snapshot.handoffs[0].id;

    const req = new Request("http://localhost/api/handoffs/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handoffId }),
    });
    const res = await handoffReviewPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot.handoffs[0].reviewed).toBe(true);
  });
});

describe("POST /api/export/timeline", () => {
  it("exports JSON timeline", async () => {
    const req = new Request("http://localhost/api/export/timeline", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "circle-demo-1", format: "json" }),
    });
    const res = await exportPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.format).toBe("json");
    expect(json.content).toContain("careCircleName");
    expect(json.content).toContain("This export is a family coordination record, not a medical record.");
  });

  it("exports CSV timeline", async () => {
    const req = new Request("http://localhost/api/export/timeline", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ careCircleId: "circle-demo-1", format: "csv" }),
    });
    const res = await exportPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.format).toBe("csv");
    expect(json.content).toContain("Type,ID,Date,Actor,Details");
  });
});

describe("POST /api/members/invite", () => {
  it("invites a member", async () => {
    const req = new Request("http://localhost/api/members/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: "fm-3" }),
    });
    const res = await invitePost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot.members.find((m: { id: string }) => m.id === "fm-3")?.inviteStatus).toBe("invited");
  });

  it("adds a new member", async () => {
    const req = new Request("http://localhost/api/members/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Emily", role: "Daughter", phone: "+15550000004", permissionLevel: "contributor" }),
    });
    const res = await invitePost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot.members.length).toBeGreaterThan(3);
  });
});

describe("POST /api/preferences/update", () => {
  it("updates preferences", async () => {
    const req = new Request("http://localhost/api/preferences/update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ summaryTime: "08:00", timezone: "America/Chicago" }),
    });
    const res = await prefsPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.snapshot.preferences.summaryTime).toBe("08:00");
    expect(json.snapshot.preferences.timezone).toBe("America/Chicago");
  });
});
