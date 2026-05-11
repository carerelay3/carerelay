"use client";

import { useState } from "react";

type AccountProfileFormProps = {
  initialFullName: string;
  initialPhone: string;
  initialTimezone: string;
};

export function AccountProfileForm({
  initialFullName,
  initialPhone,
  initialTimezone,
}: AccountProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, timezone }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(typeof body.error === "string" ? body.error : "Profile could not be updated.");
      return;
    }

    setStatus("success");
    setMessage("Profile updated.");
  }

  return (
    <form onSubmit={submit} className="product-card space-y-5 p-6">
      <div>
        <p className="section-kicker">Profile</p>
        <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>Account details</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Full name</span>
          <input className="input-glass" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Phone number</span>
          <input className="input-glass" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Timezone</span>
        <input className="input-glass" value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="America/Chicago" />
      </label>

      {message && (
        <p className="rounded-2xl p-3 text-sm font-medium" style={{
          background: status === "error" ? "var(--error-soft)" : "var(--success-soft)",
          color: status === "error" ? "var(--error)" : "var(--success)",
        }}>
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "saving"} className="btn btn-sage">
        {status === "saving" ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
