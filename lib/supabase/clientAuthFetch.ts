"use client";

import { getSupabaseClient } from "./client";

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const supabase = getSupabaseClient();
  const headers = new Headers(init.headers);

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
