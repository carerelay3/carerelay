"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  supabaseConfigured: boolean;
};

export function AuthForm({ mode, supabaseConfigured }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!supabaseConfigured) {
      router.push(mode === "sign-in" ? "/dashboard" : "/setup");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Account access is not configured. Add Supabase environment variables and try again.");
      setLoading(false);
      return;
    }

    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in to create a care circle.");
      setLoading(false);
      return;
    }

    const accessToken = result.data.session?.access_token;
    if (accessToken) {
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      if (!sessionResponse.ok) {
        setError("Signed in, but the server session could not be established. Please try again.");
        setLoading(false);
        return;
      }
    }

    router.push(mode === "sign-in" ? "/dashboard" : "/setup");
  };

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="space-y-4">
        {mode === "sign-up" && (
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Sarah Jenkins"
              className="input-glass"
              autoComplete="name"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor={`${mode}-email`} className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            Email Address
          </label>
          <input
            id={`${mode}-email`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="input-glass"
            autoComplete="email"
            inputMode="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={`${mode}-password`} className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            Password
          </label>
          <input
            id={`${mode}-password`}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "sign-in" ? "Enter your password" : "Create a strong password"}
            className="input-glass"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
        </div>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      {message && <p className="rounded-2xl p-3 text-sm font-medium" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>{message}</p>}

      <button type="submit" disabled={loading} className="btn btn-sage w-full text-base">
        {loading ? "Please wait..." : mode === "sign-in" ? "Sign In" : "Continue to setup"}
      </button>
    </form>
  );
}
