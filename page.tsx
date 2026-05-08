import React from 'react';
import Link from 'next/link';

export default function MedicalOcrMarketingPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary font-sans selection:bg-semantic-info selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 max-w-[1440px] mx-auto border-b border-surface-overlay/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-semantic-info shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center text-white font-bold text-xl">
            +
          </div>
          <span className="font-bold text-xl tracking-tight">CareRelay</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="#features" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">Features</Link>
          <Link href="#security" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">HIPAA & Security</Link>
          <Link href="/admin/triage" className="text-sm font-medium px-5 py-2.5 bg-surface-overlay hover:bg-surface-elevated border border-surface-overlay rounded-md transition-colors shadow-sm">
            Admin Login
          </Link>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-semantic-info/10 text-semantic-info border border-semantic-info/20 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-semantic-info animate-pulse" />
            New: Vision AI Extraction Pipeline
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Turn Messy Handwriting into <span className="text-semantic-info relative inline-block">
              Structured Clinical Data
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-semantic-info/50 rounded-full blur-sm" />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-content-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
            Automate your clinic's triage routing. CareRelay's multimodal AI digitizes, semantically corrects, and categorizes unstructured medical records in seconds with zero latency.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/admin/triage" className="bg-semantic-info hover:bg-blue-600 text-white font-medium px-8 py-3.5 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] text-lg flex items-center justify-center gap-2">
              Try the Live Pipeline <span className="font-mono text-sm opacity-80">❯</span>
            </Link>
            <button className="bg-surface-elevated hover:bg-surface-overlay border border-surface-overlay text-content-primary font-medium px-8 py-3.5 rounded-lg transition-colors text-lg">
              Read the Whitepaper
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Section */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch mb-32">
          {/* Left: Messy Input (Simulated) */}
          <div className="bg-surface-elevated border border-surface-overlay rounded-2xl p-6 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-semantic-warning to-semantic-alert opacity-50" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-content-primary flex items-center gap-2">
                <span>📄</span> Raw Patient Upload
              </h3>
              <span className="text-xs font-mono text-content-secondary bg-surface-base px-2 py-1 rounded border border-surface-overlay flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning animate-pulse" />
                scan_001.jpg
              </span>
            </div>
            {/* Mock handwritten note area */}
            <div className="flex-1 bg-[#FDFBF7] rounded-xl p-8 border border-surface-overlay relative min-h-[350px] flex items-center justify-center shadow-inner overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]" />
              <div className="transform -rotate-2 opacity-80 text-gray-800 font-serif text-2xl lg:text-3xl leading-relaxed max-w-sm blur-[0.3px] select-none">
                Pt presents w/ severe migraines. BP 140/90. 
                <br/><br/>
                Dx: Tension HA. 
                <br/><br/>
                Rx: Sumatriptan 50mg PRN. Follow up in 2 wks.
              </div>
            </div>
          </div>

          {/* Right: Structured Output */}
          <div className="bg-surface-elevated border border-surface-overlay rounded-2xl p-6 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-semantic-info to-semantic-success opacity-50" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-content-primary flex items-center gap-2">
                <span>⚡</span> AI Structured JSON
              </h3>
              <span className="text-xs font-mono text-semantic-success bg-semantic-success/10 border border-semantic-success/20 px-2 py-1 rounded">1.2s extraction</span>
            </div>
            <div className="flex-1 bg-surface-base rounded-xl p-6 border border-surface-overlay font-mono text-sm overflow-x-auto text-content-secondary leading-loose shadow-inner relative group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-surface-overlay border border-surface-elevated px-2 py-1 rounded text-xs text-content-primary hover:bg-surface-elevated">Copy</button>
              </div>
              <span className="text-semantic-info">{"{"}</span>
              <br/>
              &nbsp;&nbsp;<span className="text-content-primary">"transcription"</span>: <span className="text-semantic-success">"Patient presents with severe migraines. Blood pressure 140/90."</span>,
              <br/>
              &nbsp;&nbsp;<span className="text-content-primary">"diagnoses"</span>: [
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-semantic-success">"Tension Headache"</span>
              <br/>
              &nbsp;&nbsp;],
              <br/>
              &nbsp;&nbsp;<span className="text-content-primary">"prescriptions"</span>: [
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-semantic-info">{"{"}</span>
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-content-primary">"medication"</span>: <span className="text-semantic-success">"Sumatriptan"</span>,
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-content-primary">"dosage"</span>: <span className="text-semantic-success">"50mg"</span>,
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-content-primary">"frequency"</span>: <span className="text-semantic-success">"As needed (PRN)"</span>
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-semantic-info">{"}"}</span>
              <br/>
              &nbsp;&nbsp;],
              <br/>
              &nbsp;&nbsp;<span className="text-content-primary">"instructions"</span>: [
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-semantic-success">"Follow up in 2 weeks."</span>
              <br/>
              &nbsp;&nbsp;]
              <br/>
              <span className="text-semantic-info">{"}"}</span>
            </div>
          </div>
        </div>

        {/* Trust & Metrics Section */}
        <div className="grid md:grid-cols-3 gap-8 py-12 border-t border-b border-surface-overlay mb-32 bg-surface-elevated/30 rounded-3xl">
          <div className="text-center p-6">
            <div className="text-5xl font-bold text-content-primary mb-3">10x</div>
            <div className="text-sm text-content-secondary uppercase tracking-wider font-semibold">Faster Triage Routing</div>
          </div>
          <div className="text-center p-6 md:border-l md:border-r border-surface-overlay">
            <div className="text-5xl font-bold text-semantic-success mb-3">99.9%</div>
            <div className="text-sm text-content-secondary uppercase tracking-wider font-semibold">Diagnostic Accuracy</div>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl font-bold text-semantic-info mb-3">SOC-2</div>
            <div className="text-sm text-content-secondary uppercase tracking-wider font-semibold">HIPAA Compliant Infrastructure</div>
          </div>
        </div>
        
      </main>
    </div>
  );
}