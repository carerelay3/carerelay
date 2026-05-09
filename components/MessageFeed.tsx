import { DemoMessage } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { CategoryBadge } from "./CategoryBadge";

export function MessageFeed({ messages }: { messages: DemoMessage[] }) {
  if (messages.length === 0) {
    return <EmptyState title="No updates yet" text="Text the CareRelay number or try the demo message tester to see how updates get organized." />;
  }

  const sorted = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="surface-panel space-y-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>Shared timeline</p>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Recent updates</h2>
        </div>
      </div>
      {sorted.map(msg => (
        <div key={msg.id} className="rounded-3xl border bg-white/70 p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, var(--teal), var(--blue-soft))" }}>
              {(msg.sender || "?").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold" style={{ color: "var(--text)" }}>{msg.sender || "Unknown sender"}</div>
                <div className="text-xs" style={{ color: "var(--text-subtle)" }}>{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{msg.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CategoryBadge category={msg.category} />
                <span className="badge-pill badge-teal">Demo SMS</span>
                {msg.concernFlag && <span className="badge-pill badge-warm">For family review</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
