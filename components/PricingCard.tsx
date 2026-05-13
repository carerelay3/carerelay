"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/track";

type Props = {
  title: string;
  price: string;
  planId: "free" | "starter" | "family" | "family_plus";
  features: string[];
  accent?: string;
  popular?: boolean;
};

export function PricingCard({ title, price, features, planId, accent = "var(--teal)", popular }: Props) {
  const [busy, setBusy] = useState(false);

  const onCheckout = async () => {
    if (planId === "free") {
      trackEvent("pricing_cta_clicked", { planId });
      window.location.href = "/setup";
      return;
    }

    setBusy(true);
    trackEvent("pricing_cta_clicked", { planId });
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        trackEvent("checkout_failed", { planId, reason: data.error });
        window.alert(typeof data.error === "string" ? data.error : "Checkout failed. Try again or use demo mode.");
        return;
      }
      if (data.url) {
        trackEvent("checkout_started", { planId });
        window.location.href = data.url;
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      trackEvent("checkout_failed", { planId, reason: data.message });
      window.alert(data.message || "Unable to start checkout.");
    } catch {
      trackEvent("checkout_failed", { planId, reason: "network" });
      window.alert("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="product-card relative flex flex-col p-6 transition-all hover:-translate-y-1" style={popular ? { border: `2px solid ${accent}` } : {}}>
      <div className="relative z-10 flex h-full flex-col">
        {popular && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2">
            <span className="badge-pill text-[10px]" style={{ background: accent, color: "white" }}>Most popular</span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{title}</h3>
          <p className="mt-3 text-4xl font-bold tracking-tight" style={{ color: accent }}>{price}</p>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>per month</p>
        </div>
        <div className="my-5 soft-divider" />
        <ul className="flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${accent}18`, color: accent }}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => void onCheckout()}
          disabled={busy}
          aria-busy={busy}
          className="btn mt-6 w-full"
          style={{
            background: popular ? `linear-gradient(135deg, ${accent} 0%, var(--teal) 100%)` : "rgba(255,255,255,0.72)",
            color: popular ? "white" : "var(--text-secondary)",
            border: popular ? "none" : "1px solid var(--border)",
            boxShadow: popular ? `0 12px 26px ${accent}33` : "var(--shadow-sm)",
          }}
        >
          {busy ? "Please wait..." : `Start with ${title}`}
        </button>
      </div>
    </div>
  );
}
