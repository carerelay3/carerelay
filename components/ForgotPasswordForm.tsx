"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type ForgotPasswordFormProps = {
  supabaseConfigured: boolean;
  resetRedirectUrl: string;
};

export function ForgotPasswordForm({ supabaseConfigured, resetRedirectUrl }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectUrl,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("If an account exists for that email, Supabase will send a password reset link.");
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
        Email address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="input-glass mt-2"
          autoComplete="email"
          inputMode="email"
          required
        />
      </label>

      {message && (
        <p
          className="rounded-2xl p-3 text-sm font-medium"
          style={{
            background: status === "sent" ? "var(--teal-soft)" : "#fef2f2",
            color: status === "sent" ? "var(--teal)" : "#b91c1c",
          }}
        >
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn btn-sage w-full text-base">
        {status === "sending" ? "Sending..." : "Send reset email"}
      </button>
    </form>
  );
}
