import React from 'react';
import { Omnibar } from '@/components/Omnibar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary flex font-sans selection:bg-semantic-info selection:text-white">
      {/* Collapsed Sidebar - Expands on hover */}
      <aside className="w-16 bg-surface-elevated border-r border-surface-overlay flex flex-col items-center py-4 space-y-8 z-20 transition-all duration-200 hover:w-64 group overflow-hidden shrink-0 shadow-xl">
        {/* System Logo Placeholder */}
        <div className="w-8 h-8 rounded bg-semantic-info flex-shrink-0 shadow-lg shadow-semantic-info/20" />
        
        {/* Primary Navigation */}
        <nav className="flex flex-col space-y-2 w-full px-3">
          <NavItem icon="👥" label="Users & Access" />
          <NavItem icon="💳" label="Subscriptions" />
          <NavItem icon="🎫" label="Triage Queue" />
          <NavItem icon="📊" label="System Telemetry" active />
        </nav>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Header */}
        <header className="h-14 bg-surface-base border-b border-surface-elevated flex items-center px-6 sticky top-0 z-10">
          <div className="flex-1 flex justify-center">
            <Omnibar />
          </div>
        </header>

        {/* Active Module Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center rounded-md p-2 transition-colors group-hover:px-3 ${active ? 'bg-surface-overlay text-content-primary' : 'text-content-secondary hover:text-content-primary hover:bg-surface-overlay/50'}`}>
      <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium text-sm ml-2">
        {label}
      </span>
    </button>
  );
}