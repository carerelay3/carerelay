import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { checkoutSchema } from "@/lib/validation/schemas";
import { getStripeClient } from "@/lib/stripe/client";
import { STRIPE_PRICE_IDS } from "@/lib/stripe/plans";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";

const PLACEHOLDER_PRICE_IDS = new Set(["price_starter", "price_family", "price_family_plus"]);

type CheckoutDiagnostics = {
  planId: string;
  stripeSecretExists: boolean;
  stripeSecretStartsWithSkTest: boolean;
  stripeSecretStartsWithSkLive: boolean;
  selectedPlanExists: boolean;
  selectedPriceIdExists: boolean;
  selectedPriceIdStartsWithPrice: boolean;
  selectedPriceIdPrefix?: string;
  stripeErrorType?: string;
  stripeErrorMessage?: string;
};

function getStripeSecretDiagnostics() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
  return {
    stripeSecretExists: stripeSecretKey.length > 0,
    stripeSecretStartsWithSkTest: stripeSecretKey.startsWith("sk_test_"),
    stripeSecretStartsWithSkLive: stripeSecretKey.startsWith("sk_live_"),
  };
}

function redactStripeMessage(message: string) {
  return message
    .replace(/sk_(test|live)_[A-Za-z0-9_]+/g, "sk_$1_[redacted]")
    .replace(/mk_[A-Za-z0-9_]+/g, "mk_[redacted]")
    .replace(/price_[A-Za-z0-9_]+/g, (match) => `${match.slice(0, 12)}...`);
}

function stripeErrorDetails(error: unknown) {
  const maybeStripeError = error as { type?: unknown; message?: unknown };
  return {
    stripeErrorType: typeof maybeStripeError.type === "string" ? maybeStripeError.type : "unknown",
    stripeErrorMessage:
      typeof maybeStripeError.message === "string"
        ? redactStripeMessage(maybeStripeError.message)
        : "Unknown Stripe checkout error",
  };
}

function logCheckoutFailure(reason: string, diagnostics: CheckoutDiagnostics) {
  console.error("Stripe checkout failed", { reason, ...diagnostics });
}

function debugResponse(debug: CheckoutDiagnostics) {
  return process.env.NODE_ENV !== "production" ? { debug } : {};
}

export async function POST(req: Request) {
  const data = await req.json().catch(() => ({}));
  const requestedPlanId = typeof data.planId === "string" ? data.planId : "missing";
  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    logCheckoutFailure("invalid_plan_id", {
      planId: requestedPlanId,
      ...getStripeSecretDiagnostics(),
      selectedPlanExists: false,
      selectedPriceIdExists: false,
      selectedPriceIdStartsWithPrice: false,
    });
    return NextResponse.json(
      {
        error: "Invalid planId",
        ...debugResponse({
          planId: requestedPlanId,
          ...getStripeSecretDiagnostics(),
          selectedPlanExists: false,
          selectedPriceIdExists: false,
          selectedPriceIdStartsWithPrice: false,
        }),
      },
      { status: 400 },
    );
  }

  const { planId } = parsed.data;
  const user = await getCurrentSupabaseUser(req);
  const selectedPlanExists = planId in STRIPE_PRICE_IDS;
  const priceId = STRIPE_PRICE_IDS[planId];
  const selectedPriceIdExists = Boolean(priceId) && !PLACEHOLDER_PRICE_IDS.has(priceId);
  const selectedPriceIdStartsWithPrice = Boolean(priceId?.startsWith("price_"));
  const baseDiagnostics = {
    planId,
    ...getStripeSecretDiagnostics(),
    selectedPlanExists,
    selectedPriceIdExists,
    selectedPriceIdStartsWithPrice,
    selectedPriceIdPrefix: priceId ? priceId.slice(0, 12) : undefined,
  };

  if (
    !appConfig.stripeConfigured ||
    !baseDiagnostics.stripeSecretExists ||
    (!baseDiagnostics.stripeSecretStartsWithSkTest && !baseDiagnostics.stripeSecretStartsWithSkLive)
  ) {
    logCheckoutFailure("stripe_not_configured", baseDiagnostics);
    return NextResponse.json(
      {
        error: "Stripe is not configured for checkout.",
        ...debugResponse(baseDiagnostics),
      },
      { status: 503 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    logCheckoutFailure("stripe_client_unavailable", baseDiagnostics);
    return NextResponse.json(
      {
        error: "Stripe is not configured for checkout.",
        ...debugResponse(baseDiagnostics),
      },
      { status: 503 },
    );
  }

  if (!selectedPriceIdExists || !selectedPriceIdStartsWithPrice) {
    logCheckoutFailure("stripe_price_not_configured", baseDiagnostics);
    return NextResponse.json(
      {
        error: "Stripe is not configured for this plan.",
        ...debugResponse(baseDiagnostics),
      },
      { status: 503 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      client_reference_id: user?.id,
      metadata: {
        plan_id: planId,
        ...(user?.id ? { user_id: user.id } : {}),
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          ...(user?.id ? { user_id: user.id } : {}),
        },
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appConfig.appUrl}/setup?checkout=success`,
      cancel_url: `${appConfig.appUrl}/`,
    });
    return NextResponse.json({ mode: "live", url: session.url });
  } catch (error) {
    const diagnostics = { ...baseDiagnostics, ...stripeErrorDetails(error) };
    logCheckoutFailure("stripe_checkout_creation_failed", diagnostics);
    return NextResponse.json(
      {
        error: "Stripe checkout could not be created.",
        ...debugResponse(diagnostics),
      },
      { status: 500 },
    );
  }
}
