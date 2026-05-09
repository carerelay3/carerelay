import { getSupabaseServer } from "@/lib/supabase/server";

export async function getDashboardDataForCircle(circleId?: string) {
  const supabase = getSupabaseServer();
  const emptyState = { recentActivity: [], upcomingMedications: [], concerns: [] };

  if (!supabase) {
    return emptyState;
  }

  try {
    let activeCircleId = circleId;

    // If no circleId is passed, try to resolve the logged-in user's default circle
    if (!activeCircleId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: familyMember } = await supabase
          .from("family_members")
          .select("care_circle_id")
          .eq("user_id", user.id)
          .limit(1)
          .single();
          
        if (familyMember) {
          activeCircleId = familyMember.care_circle_id;
        }
      }
    }

    if (!activeCircleId) return emptyState;

    // 1. Fetch recent general activity
    const { data: recentActivity } = await supabase
      .from("inbound_messages")
      .select("*")
      .eq("care_circle_id", activeCircleId)
      .order("created_at", { ascending: false })
      .limit(15);

    // 2. Fetch active/recent concerns (messages where concern_flag is true)
    const { data: concerns } = await supabase
      .from("inbound_messages")
      .select("*")
      .eq("care_circle_id", activeCircleId)
      .eq("concern_flag", true)
      .order("created_at", { ascending: false })
      .limit(5);

    // 3. Fetch pending tasks (acting as upcoming items/medications for the MVP)
    const { data: upcomingMedications } = await supabase
      .from("tasks")
      .select("*")
      .eq("care_circle_id", activeCircleId)
      .eq("status", "open") // Assuming 'open' or 'pending' is used
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      recentActivity: recentActivity || [],
      upcomingMedications: upcomingMedications || [],
      concerns: concerns || [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return emptyState;
  }
}