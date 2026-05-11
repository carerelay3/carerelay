import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";
import { AccountPlanId, STRIPE_PRICE_IDS } from "@/lib/stripe/plans";

function planIdFromPriceId(priceId: string | undefined | null): AccountPlanId {
  if (priceId === STRIPE_PRICE_IDS.starter) return "starter";
  if (priceId === STRIPE_PRICE_IDS.family) return "family";
  if (priceId === STRIPE_PRICE_IDS.family_plus) return "family_plus";
  return "free";
}

function normalizePlanId(planId: string | undefined | null, priceId: string | undefined | null): AccountPlanId {
  if (planId === "starter" || planId === "family" || planId === "family_plus") return planId;
  return planIdFromPriceId(priceId);
}

function subscriptionPeriod(subscriptionItem: Stripe.SubscriptionItem | undefined) {
  return {
    current_period_start: subscriptionItem
      ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscriptionItem ? new Date(subscriptionItem.current_period_end * 1000).toISOString() : null,
  };
}

export async function POST(req: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown webhook error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (customerId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionItem = subscription.items.data[0];
          const priceId = subscriptionItem?.price.id;
          const userId =
            session.metadata?.user_id ||
            session.client_reference_id ||
            subscription.metadata?.user_id ||
            null;
          const planId = normalizePlanId(session.metadata?.plan_id || subscription.metadata?.plan_id, priceId);
          const period = subscriptionPeriod(subscriptionItem);

          await supabase
            .from("billing_subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              plan_id: planId,
              status: subscription.status,
              ...period,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            }, { onConflict: "stripe_subscription_id" });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionItem = subscription.items.data[0];
        const priceId = subscriptionItem?.price.id;
        const userId = subscription.metadata?.user_id || null;
        const planId = normalizePlanId(subscription.metadata?.plan_id, priceId);
        const period = subscriptionPeriod(subscriptionItem);

        if (userId) {
          await supabase
            .from("billing_subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              plan_id: planId,
              status: subscription.status,
              ...period,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            }, { onConflict: "stripe_subscription_id" });
        } else {
          await supabase
            .from("billing_subscriptions")
            .update({
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              plan_id: planId,
              status: subscription.status,
              ...period,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionItem = subscription.items.data[0];
        const priceId = subscriptionItem?.price.id;
        const period = subscriptionPeriod(subscriptionItem);

        await supabase
          .from("billing_subscriptions")
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_id: normalizePlanId(subscription.metadata?.plan_id, priceId),
            status: "canceled",
            ...period,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler failed", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
