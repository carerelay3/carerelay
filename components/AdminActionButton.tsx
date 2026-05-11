"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminActionButtonProps = {
  label: string;
  confirmText: string;
  payload: Record<string, unknown>;
  disabled?: boolean;
};

export function AdminActionButton({ label, confirmText, payload, disabled = false }: AdminActionButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function runAction() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || "Admin action failed.");
        return;
      }
      setMessage("Updated.");
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button type="button" onClick={() => void runAction()} disabled={disabled || busy} className="btn btn-soft text-xs">
        {busy ? "Working..." : label}
      </button>
      {message && <p className="text-xs" style={{ color: message === "Updated." ? "var(--teal)" : "#b91c1c" }}>{message}</p>}
    </div>
  );
}
