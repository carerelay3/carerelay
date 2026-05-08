import { DemoSupply } from "@/lib/types";
import { EmptyState } from "./EmptyState";

export function SupplyList({ supplies }: { supplies: DemoSupply[] }) {
  return (
    <div className="space-y-4 glass-elevated p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">Supplies & Groceries</h2>
      
      {supplies.length === 0 ? (
        <EmptyState title="No needed supplies right now" text="Text if you need anything picked up." />
      ) : (
        <div className="space-y-3">
          {supplies.map(s => (
            <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm flex gap-3 items-center">
              <input type="checkbox" checked={s.status !== 'needed'} readOnly className="h-4 w-4 rounded text-green-500 border-slate-300" />
              <div className={`flex-1 text-slate-700 font-medium ${s.status !== 'needed' ? 'line-through opacity-50' : ''}`}>
                {s.item}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}