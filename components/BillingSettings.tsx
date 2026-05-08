"use client";

import { useState } from "react";
import { PlanId } from "@/lib/stripe/plans";

type BillingSettingsProps = {
  planId: PlanId;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  maxFamilyMembers: number;
  currentFamilyMembers: number;
};

export function BillingSettings({ planId, status, cancelAtPeriodEnd, currentPeriodEnd, maxFamilyMembers, currentFamilyMembers }: BillingSettingsProps) {
  const [busy, setBusy] = useState(false);

  const onManageBilling = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.alert(data.error || "Billing portal is not available in demo mode.");
      }
    } catch {
      window.alert("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const planNames: Record<string, string> = {
    starter: "Starter",
    family: "Family",
    family_plus: "Family Plus",
    demo: "Demo Mode"
  };

  const isDemo = planId === "demo";

  return (
    <div className="glass mt-6 mb-6">
      <div className="border-b p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--glass-border)' }}>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Billing & Subscription</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage your plan, limits, and payment methods</p>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-800">{planNames[planId] || "Unknown"}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${status === 'active' || status === 'trialing' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {status}
            </span>
          </div>
          {currentPeriodEnd && !isDemo && (
            <span className="text-xs text-slate-500 mt-1">
              {cancelAtPeriodEnd ? "Ends on " : "Renews on "}{new Date(currentPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5 sm:p-6 space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Plan Usage</p>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Family Members</span>
                <span className="text-slate-800 font-medium">{currentFamilyMembers} / {maxFamilyMembers}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${currentFamilyMembers >= maxFamilyMembers ? 'bg-amber-500' : 'bg-sage-500'}`}
                  style={{ width: `${Math.min(100, (currentFamilyMembers / maxFamilyMembers) * 100)}%`, backgroundColor: currentFamilyMembers >= maxFamilyMembers ? 'var(--warning)' : 'var(--sage)' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            type="button" 
            onClick={onManageBilling} 
            disabled={busy}
            aria-busy={busy}
            className="btn btn-soft text-sm px-4 py-2"
          >
            {busy ? "Please wait..." : "Manage Billing & Invoices"}
          </button>
          
          <a href="/pricing" className="btn btn-sage text-sm px-4 py-2 shadow-sm">
            Upgrade Plan
          </a>
        </div>

        {isDemo && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-700 font-medium">You are in Demo Mode. Billing features are inactive. Connect Stripe keys to enable live subscriptions.</p>
          </div>
        )}
      </div>
    </div>
  );
}