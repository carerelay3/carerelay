"use client";

import { useState } from "react";

export function ExportPanel({ careCircleId, onExport }: { careCircleId: string; onExport: () => void }) {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ format: string; content: string } | null>(null);

  const runExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careCircleId, format, fromDate: fromDate || undefined, toDate: toDate || undefined }),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); onExport(); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carerelay-timeline-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="glass p-5">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Export timeline</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Download a record of messages, tasks, appointments, and more.</p>
        <p className="mt-2 text-xs" style={{ color: 'var(--warning)' }}>This export is a family coordination record, not a medical record.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-subtle)' }}>
            <button type="button" onClick={() => setFormat("json")} className="rounded-lg px-4 py-2 text-xs font-medium transition-all" style={{ background: format === "json" ? 'var(--primary)' : 'transparent', color: format === "json" ? 'white' : 'var(--text-muted)' }}>JSON</button>
            <button type="button" onClick={() => setFormat("csv")} className="rounded-lg px-4 py-2 text-xs font-medium transition-all" style={{ background: format === "csv" ? 'var(--primary)' : 'transparent', color: format === "csv" ? 'white' : 'var(--text-muted)' }}>CSV</button>
          </div>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-glass w-auto" style={{ padding: '10px 14px' }} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-glass w-auto" style={{ padding: '10px 14px' }} />
          <button type="button" onClick={() => void runExport()} disabled={loading} className="btn btn-sage" style={{ padding: '10px 20px' }}>
            {loading ? "Generating…" : "Generate export"}
          </button>
        </div>
      </div>

      {result && (
        <div className="glass">
          <div className="p-5 flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Export ready</h4>
            <button type="button" onClick={download} className="btn text-xs text-white" style={{ background: 'var(--success)', padding: '6px 14px' }}>
              Download .{format}
            </button>
          </div>
          <div className="border-t p-5" style={{ borderColor: 'var(--glass-border)' }}>
            <pre className="max-h-[400px] overflow-auto text-xs" style={{ color: 'var(--text-muted)' }}>{result.content.slice(0, 2000)}{result.content.length > 2000 ? "\n… (truncated)" : ""}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
