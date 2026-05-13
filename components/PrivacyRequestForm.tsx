"use client";

import { useState } from "react";
import { authFetch } from "@/lib/supabase/clientAuthFetch";

const requestOptions = [
  { value: "export_my_data", label: "Export my data" },
  { value: "delete_my_account", label: "Delete my account" },
  { value: "delete_care_circle_data", label: "Delete care circle data" },
  { value: "billing_help", label: "Billing help" },
  { value: "other", label: "Other" },
] as const;

export function PrivacyRequestForm() {
  const [requestType, setRequestType] = useState<(typeof requestOptions)[number]["value"]>("export_my_data");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const response = await authFetch("/api/privacy/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType, details }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(typeof body.error === "string" ? body.error : "Privacy request could not be submitted.");
      return;
    }

    setStatus("success");
    setDetails("");
    setMessage("Request received. CircleRelay will review it before any account or circle data action is taken.");
  }

  return (
    <form onSubmit={submit} className="product-card mt-8 space-y-5 p-6 sm:p-8">
      <div>
        <p className="section-kicker">Data request</p>
        <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>
          Tell us what you need
        </h2>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          Request type
        </span>
        <select
          className="input-glass"
          value={requestType}
          onChange={(event) => setRequestType(event.target.value as typeof requestType)}
        >
          {requestOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          Details
        </span>
        <textarea
          className="input-glass min-h-36"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={4000}
          placeholder="Share the account, circle, billing, or data request details that will help us review this safely."
        />
      </label>

      <p className="rounded border p-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        Submitting this form creates a review request only. CircleRelay does not automatically delete account, billing, SMS, or care circle records from this form.
      </p>

      {message && (
        <p
          className="rounded-2xl p-3 text-sm font-medium"
          style={{
            background: status === "error" ? "var(--error-soft)" : "var(--success-soft)",
            color: status === "error" ? "var(--error)" : "var(--success)",
          }}
        >
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "saving"} className="btn btn-sage w-full sm:w-auto">
        {status === "saving" ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
