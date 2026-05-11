import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { authErrorResponse, requireUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);

    if (!appConfig.stripeConfigured) {
      return NextResponse.json(
        {
          code: "stripe_not_configured",
          error: "Billing portal is not configured. Stripe server keys are required before customers can manage billing.",
        },
        { status: 503 },
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        {
          code: "service_role_missing",
          error: "Billing portal lookup needs the Supabase service role key on the server.",
        },
        { status: 503 },
      );
    }

    const { data, error } = await admin
      .from("billing_subscriptions")
      .select("stripe_customer_id, status, updated_at, created_at")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { code: "customer_lookup_failed", error: "Could not look up your Stripe customer record." },
        { status: 500 },
      );
    }

    if (!data?.stripe_customer_id) {
      return NextResponse.json(
        {
          code: "stripe_customer_missing",
          error: "No Stripe customer is connected to this account yet. Start or upgrade a plan first, or contact support for billing help.",
        },
        { status: 404 },
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        {
          code: "stripe_not_configured",
          error: "Billing portal is not configured. Stripe server keys are required before customers can manage billing.",
        },
        { status: 503 },
      );
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: data.stripe_customer_id,
        return_url: `${appConfig.appUrl.replace(/\/$/, "")}/settings`,
      });

      return NextResponse.json({ url: session.url });
    } catch (stripeError) {
      const message = stripeError instanceof Error ? stripeError.message : "Stripe billing portal could not be created.";
      console.error("Stripe billing portal failed", {
        reason: "portal_session_creation_failed",
        userId: user.id,
        stripeErrorMessage: message.replace(/cus_[A-Za-z0-9_]+/g, "cus_[redacted]"),
      });
      return NextResponse.json(
        {
          code: "billing_portal_unavailable",
          error: "Billing portal is not available yet. Confirm Stripe Customer Portal is configured, or contact support for billing help.",
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return authErrorResponse(error);
  }
}
