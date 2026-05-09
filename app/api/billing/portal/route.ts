import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { authErrorResponse, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  if (!appConfig.stripeConfigured) {
    return NextResponse.json(
      {
        mode: "demo",
        error: "Billing portal is not available in demo mode. Connect Stripe keys to enable live billing.",
      },
      { status: 200 },
    );
  }

  try {
    await requireUser(req);
    return NextResponse.json(
      {
        error: "Billing portal sessions are not configured yet. Use the Stripe dashboard until customer lookup is connected.",
      },
      { status: 501 },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
