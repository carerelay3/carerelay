import { getSupabaseServer } from "@/lib/supabase/server";

export async function getSubscription(careCircleId: string) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("care_circle_id", careCircleId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getSubscriptionByUserId(userId: string) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("owner_id", userId)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}