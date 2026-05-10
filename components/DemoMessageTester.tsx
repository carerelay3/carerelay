"use client";

import { useState } from "react";
import { CareCategory } from "@/lib/types";

export function DemoMessageTester({ onSend }: { onSend?: (msg: string, category: CareCategory, concern: boolean) => void }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CareCategory>("general_update");
  const [concern, setConcern] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend?.(text, category, concern);
    setText("");
  };

  return (
    <div className="product-card p-5 sm:p-6">
      <div className="relative z-10">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--teal)" }}>Try an update</p>
      <h2 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>Demo message tester</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--text)" }}>Simulate an SMS update</label>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="input-glass min-h-32 resize-none"
            rows={3}
            placeholder="E.g., I just took my afternoon meds."
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as CareCategory)}
              className="input-glass min-w-44"
            >
              <option value="general_update">General Update</option>
              <option value="medication">Medication</option>
              <option value="appointment">Appointment</option>
              <option value="task">Task</option>
              <option value="supply">Supply</option>
              <option value="concern">Concern</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="concernFlag" 
              checked={concern} 
              onChange={e => setConcern(e.target.checked)} 
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="concernFlag" className="text-sm font-semibold" style={{ color: "var(--text)" }}>Flag as concern</label>
          </div>
        </div>
        <button type="submit" className="btn btn-sage w-full">
          Send Mock Update
        </button>
      </form>
      </div>
    </div>
  );
}
