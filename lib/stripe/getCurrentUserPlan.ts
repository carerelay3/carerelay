import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AccountPlanId } from "@/lib/stripe/plans";

export type CurrentUserPlan = {
  planId: AccountPlanId;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const DEFAULT_PLAN: CurrentUserPlan = {
  planId: "free",
  status: "inactive",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

function normalizePlanId(planId: string | null | undefined): AccountPlanId {
  if (planId === "starter" || planId === "family" || planId === "family_plus") {
    return planId;
  }
  return "free";
}

export async function getCurrentUserPlan(userId: string): Promise<CurrentUserPlan> {
  const admin = getSupabaseAdmin();
  if (!admin) return DEFAULT_PLAN;

  const { data, error } = await admin
    .from("billing_subscriptions")
    .select("plan_id, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return DEFAULT_PLAN;

  const status = data.status || DEFAULT_PLAN.status;
  const paidPlanIsUsable = status === "active" || status === "trialing";

  return {
    planId: paidPlanIsUsable ? normalizePlanId(data.plan_id) : "free",
    status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
  };
}
