"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isSigningOut}
      className="tap-target flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
      style={{ background: "var(--primary-soft)", color: "var(--text-secondary)" }}
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
