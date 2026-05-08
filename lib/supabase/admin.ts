import { createClient } from "@supabase/supabase-js";
import { appConfig } from "../config";

// Server-only service role client. Bypasses RLS. NEVER import in client components.
export function getSupabaseAdmin() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseServiceRole) return null;
  
  return createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}