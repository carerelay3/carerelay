import { getSupabaseServer } from "../supabase/server";

export async function getCareCircleById(id: string) {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const { data, error } = await supabase.from("care_circles").select("*").eq("id", id).single();
  if (error) console.error("Error fetching care circle:", error);
  return data;
}

export async function getCareCircleForUser() {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  // Automatically scoped by RLS to the authenticated user
  const { data, error } = await supabase.from("care_circles").select("*").limit(1).single();
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching care circle for user:", error);
    return null;
  }
  return data;
}