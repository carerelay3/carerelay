import { createClient } from "@supabase/supabase-js";
import { appConfig, hasSupabase } from "../config";

// Safe browser client
export function getSupabaseClient() {
  if (!hasSupabase()) return null;
  return createClient(appConfig.supabaseUrl!, appConfig.supabaseAnonKey!);
}

export function getSupabaseAdmin() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseServiceRole) return null;
  return createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRole);
}
