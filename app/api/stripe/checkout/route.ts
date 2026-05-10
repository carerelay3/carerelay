import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { checkoutSchema } from "@/lib/validation/schemas";
import { getStripeClient } from "@/lib/stripe/client";
import { STRIPE_PRICE_IDS } from "@/lib/stripe/plans";

const PLACEHOLDER_PRICE_IDS = new Set(["price_starter", "price_family", "price_family_plus"]);

export async function POST(req: Request) {
  const data = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { planId } = parsed.data;

  if (!appConfig.stripeConfigured) {
    return NextResponse.json({
      mode: "demo",
      message: `Demo checkout complete for ${(planId)}.`,
      redirectUrl: "/setup?demoCheckout=1",
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({
      mode: "demo",
      message: `Stripe not configured. Demo checkout complete for ${planId}.`,
      redirectUrl: "/setup?demoCheckout=1",
    });
  }

  const priceId = STRIPE_PRICE_IDS[planId];
  if (!priceId || PLACEHOLDER_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: "Invalid plan configuration" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appConfig.appUrl}/setup?checkout=success`,
    cancel_url: `${appConfig.appUrl}/`,
  });
  return NextResponse.json({ mode: "live", url: session.url });
}
