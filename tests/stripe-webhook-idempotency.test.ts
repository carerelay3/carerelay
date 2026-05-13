import { afterEach, describe, expect, it, vi } from "vitest";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

function subscriptionPayload() {
  return {
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    metadata: { user_id: "user_1", plan_id: "starter" },
    items: {
      data: [
        {
          price: { id: "price_starter" },
          current_period_start: 1_700_000_000,
          current_period_end: 1_702_592_000,
        },
      ],
    },
    cancel_at_period_end: false,
  };
}

function stripeWebhookAdmin() {
  const processedEventIds = new Set<string>();
  const billingUpsert = vi.fn(async () => ({ error: null }));
  const billingUpdateEq = vi.fn(async () => ({ error: null }));
  const eventStatusUpdates: unknown[] = [];

  const admin = {
    from: vi.fn((table: string) => {
      if (table === "stripe_webhook_events") {
        return {
          insert: vi.fn(async (payload: { stripe_event_id?: string }) => {
            if (payload.stripe_event_id && processedEventIds.has(payload.stripe_event_id)) {
              return { error: { code: "23505", message: "duplicate key value violates unique constraint" } };
            }

            if (payload.stripe_event_id) processedEventIds.add(payload.stripe_event_id);
            return { error: null };
          }),
          update: vi.fn((payload: unknown) => {
            eventStatusUpdates.push(payload);
            return {
              eq: vi.fn(async () => ({ error: null })),
            };
          }),
        };
      }

      if (table === "billing_subscriptions") {
        return {
          upsert: billingUpsert,
          update: vi.fn(() => ({
            eq: billingUpdateEq,
          })),
        };
      }

      return {};
    }),
  };

  return { admin, billingUpsert, billingUpdateEq, eventStatusUpdates };
}

async function importStripeWebhookRoute(options: {
  event?: StripeEvent;
  signatureError?: Error;
}) {
  const admin = stripeWebhookAdmin();
  const constructEvent = vi.fn(() => {
    if (options.signatureError) throw options.signatureError;
    return options.event || {
      id: "evt_1",
      type: "customer.subscription.updated",
      data: { object: subscriptionPayload() },
    };
  });
  const retrieve = vi.fn(async () => subscriptionPayload());

  vi.doMock("@/lib/stripe/client", () => ({
    getStripeClient: () => ({
      webhooks: { constructEvent },
      subscriptions: { retrieve },
    }),
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    getSupabaseAdmin: () => admin.admin,
  }));

  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  const route = await import("@/app/api/stripe/webhook/route");
  return { ...route, ...admin, constructEvent, retrieve };
}

function signedWebhookRequest(body = "{}") {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "valid", "content-type": "application/json" },
    body,
  });
}

describe("Stripe webhook idempotency", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("duplicate Stripe event id does not double-process billing writes", async () => {
    const { POST, billingUpsert } = await importStripeWebhookRoute({});

    const first = await POST(signedWebhookRequest());
    const second = await POST(signedWebhookRequest());

    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ received: true });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ received: true, duplicate: true });
    expect(billingUpsert).toHaveBeenCalledTimes(1);
  });

  it("invalid Stripe signature is still rejected before idempotency writes", async () => {
    const { POST, admin, billingUpsert } = await importStripeWebhookRoute({
      signatureError: new Error("No signatures found matching the expected signature for payload"),
    });

    const res = await POST(signedWebhookRequest());

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid signature" });
    expect(admin.from).not.toHaveBeenCalled();
    expect(billingUpsert).not.toHaveBeenCalled();
  });

  it("unknown valid Stripe events are ignored safely and recorded once", async () => {
    const { POST, billingUpsert, billingUpdateEq, eventStatusUpdates } = await importStripeWebhookRoute({
      event: {
        id: "evt_unknown",
        type: "invoice.paid",
        data: { object: {} },
      },
    });

    const res = await POST(signedWebhookRequest());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });
    expect(billingUpsert).not.toHaveBeenCalled();
    expect(billingUpdateEq).not.toHaveBeenCalled();
    expect(eventStatusUpdates).toContainEqual(expect.objectContaining({ status: "ignored" }));
  });
});
