import { getSupabaseServer } from "@/lib/supabase/server";

export async function getDashboardDataForCircle(circleId?: string) {
  return { recentActivity: [], upcomingMedications: [], concerns: [] };
}