import { DemoMessage } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function MessageFeed({ messages }: { messages: DemoMessage[] }) {
  if (messages.length === 0) {
    return <EmptyState title="No updates yet" text="Text the CareRelay number or try the demo message tester to see how updates get organized." />;
  }

  const sorted = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Recent Updates</h2>
      {sorted.map(msg => (
        <div key={msg.id} className="glass-elevated p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="font-medium text-slate-700">{msg.sender || "Unknown Sender"}</div>
            <div className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString()}</div>
          </div>
          <p className="text-slate-600">{msg.body}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider rounded-md">
              {msg.category.replace('_', ' ')}
            </span>
            {msg.concernFlag && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold tracking-wider rounded-md">
                Flagged
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}