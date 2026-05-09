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
    <div className="glass-elevated p-6 rounded-2xl shadow-sm border border-slate-200 bg-white">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Demo Message Tester</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Simulate an SMS Update</label>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="E.g., I just took my afternoon meds."
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as CareCategory)}
              className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
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
            <label htmlFor="concernFlag" className="text-sm font-medium text-slate-700">Flag as concern</label>
          </div>
        </div>
        <button type="submit" className="w-full bg-slate-800 text-white font-medium py-2 px-4 rounded-xl hover:bg-slate-700 transition">
          Send Mock Update
        </button>
      </form>
    </div>
  );
}
