'use client';

import { useEffect, useState } from 'react';

export function Omnibar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Bind the global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Example execution logic
    alert(`Execution Triggered: ${query}`);
    
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* The Visual Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full max-w-2xl bg-surface-elevated border border-surface-overlay rounded-md py-1.5 px-4 text-sm text-content-secondary flex items-center justify-between hover:bg-surface-overlay transition-colors focus:outline-none focus:ring-1 focus:ring-semantic-info"
      >
        <span className="flex items-center gap-2">
          <span>🔍</span> Command Search or /execute...
        </span>
        <kbd className="font-mono text-xs bg-surface-base px-2 py-0.5 rounded border border-surface-overlay text-content-secondary">Cmd+K</kbd>
      </button>

      {/* The Overlay Portal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-surface-base/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-2xl bg-surface-elevated border border-surface-overlay rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
            <form onSubmit={executeCommand} className="flex items-center px-4 py-4 border-b border-surface-overlay bg-surface-base/50">
              <span className="text-semantic-info mr-3 font-mono text-lg">❯</span>
              <input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users by email, type /suspend, or run commands..."
                className="flex-1 bg-transparent border-none outline-none text-content-primary placeholder-content-secondary text-lg"
              />
              <kbd className="font-mono text-xs bg-surface-elevated px-2 py-0.5 rounded border border-surface-overlay text-content-secondary">ESC</kbd>
            </form>
            
            {/* Instant Feedback Context Area */}
            <div className="p-3 text-xs text-content-secondary flex items-center justify-between bg-surface-elevated">
              {query.startsWith('/') ? (
                <span className="text-semantic-warning flex items-center gap-2"><span>⚡</span> Executing headless command</span>
              ) : (
                <span className="flex items-center gap-2"><span>🔍</span> Searching entity database...</span>
              )}
              <span>Press <strong className="text-content-primary">Enter</strong> to execute</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}