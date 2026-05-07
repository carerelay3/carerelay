import { CareCircleSetupForm } from "@/components/CareCircleSetupForm";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg)] pointer-events-none">
      <div 
        className="absolute -top-[10%] -right-[10%] h-[70vh] w-[70vw] rounded-full opacity-40 blur-[120px] animate-pulse-soft" 
        style={{ background: 'radial-gradient(circle, var(--sage-glow), transparent 70%)' }} 
      />
      <div 
        className="absolute -bottom-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full opacity-30 blur-[120px] animate-pulse-soft" 
        style={{ animationDelay: '1.5s', background: 'radial-gradient(circle, var(--blue-glow), transparent 70%)' }} 
      />
    </div>
  );
}

export default function SetupPage() {
  return (
    <>
      <AmbientBackground />
      <main className="mx-auto flex w-full max-w-4xl flex-col justify-center px-4 py-16 min-h-[90vh] animate-fade-in-up space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg mb-6" style={{ background: 'linear-gradient(135deg, var(--sage) 0%, var(--blue-soft) 100%)', boxShadow: '0 8px 24px rgba(107, 158, 117, 0.3)' }}>
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Build your care circle</h1>
          <p className="text-lg font-medium text-center" style={{ color: 'var(--text-muted)' }}>
            Establish a calm, organized command center for your family in just a few steps. No apps to install.
          </p>
        </div>

        <CareCircleSetupForm />
        
        <div className="max-w-2xl mx-auto w-full pt-8">
          <DisclaimerBanner compact />
        </div>
      </main>
    </>
  );
}
