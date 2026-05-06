"use client";

import type { DemoSnapshot } from "@/lib/demo/types";

export function SupplyList({
  supplies,
  onUpdate,
}: {
  supplies: Array<{ id: string; item: string; status: string }>;
  onUpdate?: (snapshot: DemoSnapshot) => void;
}) {
  const needsSupplies = supplies.filter((s) => s.status.toLowerCase() === "needed");

  const handleStatus = async (supplyId: string, status: "needed" | "purchased" | "delivered") => {
    if (onUpdate) {
      const res = await fetch("/api/supplies/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplyId, status, by: "Coordinator" }),
      });
      const data = await res.json();
      if (data.snapshot) onUpdate(data.snapshot);
    }
  };

  const statusBadge = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "needed") return { bg: 'var(--warning-soft)', color: 'var(--warning)' };
    if (lower === "purchased") return { bg: 'var(--blue-glow)', color: 'var(--blue-soft)' };
    return { bg: 'var(--success-soft)', color: 'var(--success)' };
  };

  return (
    <div className="glass">
      <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Supplies</h3>
          {needsSupplies.length > 0 && (
            <span className="badge-pill badge-warm">{needsSupplies.length} needed</span>
          )}
        </div>
      </div>
      {supplies.length > 0 && (
        <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
          {supplies.map((s) => {
            const badge = statusBadge(s.status);
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-white/40">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.item}</span>
                <div className="flex items-center gap-2">
                  <span className="badge-pill text-[10px]" style={{ background: badge.bg, color: badge.color }}>
                    {s.status}
                  </span>
                  {onUpdate && s.status.toLowerCase() === "needed" && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void handleStatus(s.id, "purchased")}
                        className="btn btn-soft text-[10px]"
                        style={{ padding: '4px 10px' }}
                      >
                        Bought
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStatus(s.id, "delivered")}
                        className="btn text-[10px] text-white"
                        style={{ background: 'var(--success)', padding: '4px 10px' }}
                      >
                        Delivered
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
