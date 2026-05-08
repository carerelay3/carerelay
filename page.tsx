'use client';

import { useState } from 'react';

const MOCK_TICKETS = [
  { id: 'TK-992', user: 'sarah.connor@example.com', subject: 'Account locked after upgrade', intent: 'Access', urgency: 'Critical', time: '4m ago' },
  { id: 'TK-991', user: 't-1000@example.com', subject: 'Invoice #4401 missing', intent: 'Billing', urgency: 'High', time: '12m ago' },
  { id: 'TK-988', user: 'kyle.reese@example.com', subject: 'Cannot establish API sync', intent: 'Technical', urgency: 'Medium', time: '2h ago' },
  { id: 'TK-984', user: 'john.connor@example.com', subject: 'How do I add a team member?', intent: 'Access', urgency: 'Low', time: '5h ago' },
];

export default function TriagePage() {
  const [activeTicket, setActiveTicket] = useState(MOCK_TICKETS[0]);
  const [scratchpad, setScratchpad] = useState('- User attempted upgrade at 10:42 AM\n- Flagged by automated fraud detection (Stripe)\n- **Action required:** Verify government ID before lifting suspension.');

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-4 overflow-y-auto lg:overflow-hidden relative">
      
      {/* Left Pane: Triage Queue (Responsive) */}
      <div className="w-full lg:w-1/4 flex flex-col h-64 lg:h-full bg-surface-elevated border border-surface-overlay rounded-lg shadow-lg overflow-hidden shrink-0">
        <div className="p-4 border-b border-surface-overlay bg-surface-base/30 flex justify-between items-center">
          <h2 className="font-semibold text-content-primary flex items-center gap-2">
            <span>📥</span> Active Queue
          </h2>
          <span className="bg-semantic-alert text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
            {MOCK_TICKETS.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {MOCK_TICKETS.map(ticket => {
            const isActive = activeTicket.id === ticket.id;
            const isCritical = ticket.urgency === 'Critical';
            
            return (
              <button 
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className={`w-full text-left p-3 rounded-md border transition-all duration-200 outline-none focus:ring-2 focus:ring-semantic-info ${
                  isActive ? 'bg-surface-overlay border-surface-overlay shadow-inner' : 'bg-surface-base/50 border-transparent hover:bg-surface-overlay/50'
                } ${isCritical && !isActive ? 'border-l-2 border-l-semantic-alert' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    ticket.urgency === 'Critical' ? 'text-semantic-alert' : 
                    ticket.urgency === 'High' ? 'text-semantic-warning' : 'text-content-secondary'
                  }`}>
                    {ticket.urgency}
                  </span>
                  <span className="text-[11px] text-content-secondary font-mono">{ticket.time}</span>
                </div>
                <h3 className="text-[13px] font-semibold text-content-primary truncate">{ticket.subject}</h3>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-xs text-content-secondary truncate max-w-[140px]">{ticket.user}</span>
                  <span className="text-[10px] bg-surface-base border border-surface-overlay px-1.5 py-0.5 rounded text-content-secondary">
                    {ticket.intent}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Pane: Active Workspace / Chat Thread */}
      <div className="flex-1 flex flex-col min-h-[500px] lg:h-full bg-surface-elevated border border-surface-overlay rounded-lg shadow-lg overflow-hidden shrink-0">
        <div className="p-4 border-b border-surface-overlay bg-surface-base/30 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-content-primary">{activeTicket.subject}</h2>
              <span className="text-xs font-mono text-content-secondary bg-surface-overlay px-2 py-0.5 rounded">{activeTicket.id}</span>
            </div>
            <p className="text-xs text-content-secondary mt-1">{activeTicket.user}</p>
          </div>
          <button className="text-xs bg-semantic-success/10 text-semantic-success border border-semantic-success/20 hover:bg-semantic-success hover:text-white px-3 py-1.5 rounded transition-colors font-medium">
            ✓ Mark Resolved
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Incoming Message */}
          <div className="flex flex-col items-start max-w-[85%]">
            <span className="text-[11px] text-content-secondary mb-1 ml-1">Customer • 4 mins ago</span>
            <div className="bg-surface-overlay border border-surface-base p-4 rounded-2xl rounded-tl-sm text-[13px] text-content-primary shadow-sm">
              <p>Hello, I just upgraded to the Enterprise tier but now my account says it's locked? We have a massive launch in an hour, I need this fixed immediately!</p>
            </div>
          </div>
          
          {/* System Telemetry Event */}
          <div className="flex justify-center">
            <span className="text-[10px] font-mono text-content-secondary bg-surface-base border border-surface-overlay px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-alert animate-pulse" />
              SYSTEM: Stripe Radar blocked transaction (Risk Score: 89)
            </span>
          </div>
        </div>

        {/* Unified Input Composer */}
        <div className="p-4 bg-surface-base/80 border-t border-surface-overlay">
          <div className="bg-surface-elevated border border-surface-overlay rounded-lg focus-within:ring-1 focus-within:ring-semantic-info transition-all p-2">
            <textarea 
              placeholder="Type your reply or use / for commands..." 
              className="w-full bg-transparent border-none outline-none text-[13px] text-content-primary resize-none h-16 p-2"
            />
            <div className="flex justify-between items-center px-2 pt-2 border-t border-surface-overlay/50">
              <div className="flex gap-2">
                <button className="text-content-secondary hover:text-content-primary transition-colors text-sm px-2">📎</button>
                <button className="text-content-secondary hover:text-content-primary transition-colors text-sm px-2">📚 Articles</button>
              </div>
              <button className="bg-semantic-info hover:bg-blue-600 text-white text-[13px] font-medium px-6 py-1.5 rounded shadow-md transition-colors">
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Context & Collaborative Annotation (Hidden on mobile, visible on XL screens) */}
      <div className="hidden xl:flex w-1/4 flex-col h-full bg-surface-elevated border border-surface-overlay rounded-lg shadow-lg overflow-hidden shrink-0">
        <div className="p-4 border-b border-surface-overlay bg-surface-base/30">
          <h2 className="font-semibold text-content-primary flex items-center gap-2 text-sm">
            <span>📝</span> Collaborative Context
          </h2>
        </div>
        
        <div className="flex-1 flex flex-col p-4 bg-[#14171d]">
          <div className="mb-2 flex justify-between items-end">
            <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Internal Scratchpad</span>
            <span className="text-[10px] text-content-secondary flex items-center gap-1">Markdown supported</span>
          </div>
          <textarea 
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            className="flex-1 bg-surface-overlay border border-surface-base rounded p-3 text-[13px] text-content-primary font-mono resize-none focus:outline-none focus:ring-1 focus:ring-semantic-info shadow-inner leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

    </div>
  );
}