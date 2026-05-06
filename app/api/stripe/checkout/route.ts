import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { checkoutSchema } from "@/lib/validation/schemas";
import { getStripeClient } from "@/lib/stripe/client";

const planMap = {
  starter: { name: "Starter", amount: 900 },
  family: { name: "Family", amount: 1900 },
  family_plus: { name: "Family Plus", amount: 3900 },
};

export async function POST(req: Request) {
  const data = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!appConfig.stripeConfigured) {
    return NextResponse.json({
      mode: "demo",
      message: `Demo checkout complete for ${planMap[parsed.data.planId].name}.`,
      redirectUrl: "/setup?demoCheckout=1",
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    // Should not happen because we checked stripeConfigured, but fallback
    return NextResponse.json({
      mode: "demo",
      message: `Stripe not configured. Demo checkout complete for ${planMap[parsed.data.planId].name}.`,
      redirectUrl: "/setup?demoCheckout=1",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: planMap[parsed.data.planId].name },
        recurring: { interval: "month" },
        unit_amount: planMap[parsed.data.planId].amount,
      },
      quantity: 1,
    }],
    success_url: `${appConfig.appUrl}/setup?checkout=success`,
    cancel_url: `${appConfig.appUrl}/`,
  });
  return NextResponse.json({ mode: "live", url: session.url });
}
