import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appConfig, hasSupabase } from "../config";

export async function getSupabaseServer() {
  if (!hasSupabase()) return null;
  const cookieStore = await cookies();

  return createServerClient(appConfig.supabaseUrl!, (appConfig.supabasePublishableKey || appConfig.supabaseAnonKey)!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component. Proxy refreshes sessions.
        }
      },
    },
  });
}
