"use client";

import { useState } from "react";

export function PhoneMockup({ messages }: { messages: Array<{ sender: string; body: string }> }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2.5rem] opacity-30 blur-2xl" style={{ background: 'linear-gradient(180deg, var(--sage-soft), transparent)' }} />
      <div className="relative rounded-[2rem] border-[8px] p-3 shadow-2xl" style={{ borderColor: '#1e293b', background: '#1e293b' }}>
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 flex h-4 w-20 -translate-x-1/2 rounded-b-xl" style={{ background: '#1e293b' }}>
          <div className="mx-auto mt-1 h-2 w-10 rounded-full" style={{ background: '#334155' }} />
        </div>

        {/* Screen */}
        <div className="relative mt-4 overflow-hidden rounded-xl" style={{ background: '#0f172a' }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-medium" style={{ color: '#94a3b8' }}>
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904 3.905 10.236 3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <div className="h-1 px-2" style={{ background: '#1e293b' }}>
            <div className="h-full w-12 rounded-full" style={{ background: '#475569' }} />
          </div>

          {/* Chat bubble area */}
          <div className="max-h-[300px] overflow-y-auto p-3" style={{ background: '#0f172a' }}>
            {messages.map((m, i) => (
              <button
                key={`${m.sender}-${i}`}
                type="button"
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                className={`group relative w-full text-left transition-all ${
                  activeIndex === i ? "scale-[1.02]" : ""
                }`}
              >
                <div
                  className="relative rounded-2xl px-3 py-2 text-sm transition-all duration-300"
                  style={{
                    background: activeIndex === i ? 'rgba(107, 158, 117, 0.2)' : '#1e293b',
                    border: activeIndex === i ? '1px solid rgba(107, 158, 117, 0.3)' : '1px solid transparent',
                  }}
                >
                  <p className="text-[10px] font-medium" style={{ color: '#64748b' }}>{m.sender}</p>
                  <p className={`mt-0.5 text-xs ${activeIndex === i ? "text-white" : ""}`} style={{ color: activeIndex === i ? 'white' : '#cbd5e1' }}>
                    {m.body}
                  </p>
                  {activeIndex === i && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ background: 'var(--sage)' }}>
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2">
            <div className="h-1 w-20 rounded-full" style={{ background: '#334155' }} />
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute right-[-48px] top-1/2 h-16 w-1 -translate-y-1/2 rounded-l-full" style={{ background: '#334155' }} />
      <div className="absolute right-[-48px] top-1/2 mt-16 h-10 w-1 -translate-y-1/2 rounded-l-full" style={{ background: '#334155' }} />
    </div>
  );
}
