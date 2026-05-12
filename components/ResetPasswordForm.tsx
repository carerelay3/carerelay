"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

type ResetPasswordFormProps = {
  supabaseConfigured: boolean;
};

export function ResetPasswordForm({ supabaseConfigured }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"checking" | "idle" | "saving" | "success" | "error">("checking");
  const [message, setMessage] = useState("Checking your recovery link...");

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      if (!supabaseConfigured) {
        setStatus("error");
        setMessage("Password reset is unavailable until Supabase environment variables are configured.");
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setStatus("error");
        setMessage("Account recovery is not configured. Add Supabase environment variables and try again.");
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error_description") || hashParams.get("error");
      if (hashError) {
        setStatus("error");
        setMessage(hashError);
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!mounted) return;
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        if (data.session?.access_token) {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: data.session.access_token }),
          }).catch(() => undefined);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        setStatus("error");
        setMessage("This reset link is missing or expired. Request a new password reset email.");
        return;
      }

      setReady(true);
      setStatus("idle");
      setMessage("");
    }

    void prepareRecoverySession();
    return () => {
      mounted = false;
    };
  }, [supabaseConfigured]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Account recovery is not configured.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    await supabase.auth.signOut().catch(() => undefined);
    setStatus("success");
    setMessage("Your password has been updated. Sign in with your new password.");
  }

  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={submit}>
        <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-glass mt-2"
            autoComplete="new-password"
            disabled={!ready || status === "saving" || status === "success"}
            required
            minLength={6}
          />
        </label>

        <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input-glass mt-2"
            autoComplete="new-password"
            disabled={!ready || status === "saving" || status === "success"}
            required
            minLength={6}
          />
        </label>

        {message && (
          <p
            className="rounded-2xl p-3 text-sm font-medium"
            style={{
              background: status === "success" ? "var(--teal-soft)" : status === "checking" ? "var(--primary-soft)" : "#fef2f2",
              color: status === "success" ? "var(--teal)" : status === "checking" ? "var(--text-secondary)" : "#b91c1c",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={!ready || status === "saving" || status === "success"}
          className="btn btn-sage w-full text-base"
        >
          {status === "saving" ? "Updating..." : "Update password"}
        </button>
      </form>

      {status === "success" && (
        <Link href="/sign-in" className="btn btn-soft block w-full text-center text-sm">
          Back to sign in
        </Link>
      )}
    </div>
  );
}
