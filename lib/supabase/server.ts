import "server-only";

import { createClient } from "@supabase/supabase-js";
import { appConfig, hasSupabase } from "../config";

// Server-side standard client (Subject to RLS).
// In a full Auth build, cookies would be injected here via @supabase/ssr.
export function getSupabaseServer() {
  if (!hasSupabase()) return null;
  return createClient(appConfig.supabaseUrl!, appConfig.supabaseAnonKey!);
}
