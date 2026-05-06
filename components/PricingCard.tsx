"use client";

import { useState } from "react";

type Props = {
  title: string;
  price: string;
  planId: "starter" | "family" | "family_plus";
  features: string[];
  accent?: string;
  popular?: boolean;
};

export function PricingCard({ title, price, features, planId, accent, popular }: Props) {
  const [busy, setBusy] = useState(false);

  const onCheckout = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(typeof data.error === "string" ? data.error : "Checkout failed. Try again or use demo mode.");
        return;
      }
      if (data.url) { window.location.href = data.url; return; }
      if (data.redirectUrl) { window.location.href = data.redirectUrl; return; }
      window.alert(data.message || "Unable to start checkout.");
    } catch {
      window.alert("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-6 flex flex-col relative transition-all hover:-translate-y-1" style={popular ? { border: `2px solid ${accent || 'var(--sage)'}` } : {}}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge-pill text-[10px]" style={{ background: accent || 'var(--sage)', color: 'white' }}>Most popular</span>
        </div>
      )}
      <div className="mb-2">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: accent || 'var(--text)' }}>{price}</p>
        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>per month</p>
      </div>
      <div className="border-t my-5" style={{ borderColor: 'var(--border)' }} />
      <ul className="flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke={accent || 'var(--sage)'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => void onCheckout()}
        disabled={busy}
        className="btn w-full mt-6"
        style={{
          background: popular ? `linear-gradient(135deg, ${accent || 'var(--sage)'} 0%, ${accent ? accent + 'cc' : '#5A8E65'} 100%)` : 'var(--glass-bg)',
          color: popular ? 'white' : 'var(--text-secondary)',
          border: popular ? 'none' : '1px solid var(--glass-border)',
          boxShadow: popular ? `0 4px 16px ${accent || 'var(--sage)'}40` : 'var(--shadow-sm)',
        }}
      >
        {busy ? "Please wait…" : `Start with ${title}`}
      </button>
    </div>
  );
}
