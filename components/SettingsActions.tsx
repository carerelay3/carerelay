"use client";

export function SettingsActions() {
  const exportJson = async () => {
    try {
      const res = await fetch("/api/demo/seed");
      if (!res.ok) {
        window.alert("Export failed. If you are not in demo mode, wire this to your database export.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carerelay-demo-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Could not export.");
    }
  };

  const confirmDelete = () => {
    const ok = window.confirm(
      "Delete care circle? In this MVP build, data lives in memory on the server for demo sessions only—it resets when the server restarts. A full delete flow with Supabase is not finished here.",
    );
    if (ok) window.alert("Demo session: nothing else to delete on the server. Restart `npm run dev` to fully reset in-memory demo data.");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void exportJson()}
        className="btn btn-soft text-sm"
        style={{ padding: '10px 18px' }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export data (JSON)
      </button>
      <button
        type="button"
        onClick={() => void confirmDelete()}
        className="btn text-sm text-white"
        style={{ background: 'var(--error)', padding: '10px 18px' }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete care circle
      </button>
    </div>
  );
}
