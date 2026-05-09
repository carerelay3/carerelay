import Link from "next/link";
import { appConfig } from "@/lib/config";

function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg)] pointer-events-none">
      <div 
        className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full opacity-40 blur-[120px] animate-pulse-soft" 
        style={{ background: 'radial-gradient(circle, var(--blue-glow), transparent 70%)' }} 
      />
      <div 
        className="absolute -bottom-[20%] -right-[10%] h-[70vh] w-[70vw] rounded-full opacity-30 blur-[120px] animate-pulse-soft" 
        style={{ animationDelay: '1s', background: 'radial-gradient(circle, var(--sage-soft), transparent 70%)' }} 
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <>
      <AmbientBackground />
      <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-20 min-h-[85vh] animate-fade-in-up">
        
        {/* Logo/Brand Marker */}
        <div className="mb-10 flex flex-col items-center justify-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--blue-soft)] shadow-lg" style={{ boxShadow: 'var(--shadow-glow-blue)' }}>
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Create account</h1>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Start a care circle in under five minutes
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full glass-elevated p-8 sm:p-10">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="Sarah Jenkins" 
                  className="input-glass"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="input-glass"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input 
                  type="password" 
                  placeholder="Create a strong password" 
                  className="input-glass"
                />
              </div>
            </div>

            <Link
              href="/setup"
              className="btn btn-primary w-full inline-flex items-center justify-center py-3 text-base"
              style={{ background: 'linear-gradient(135deg, var(--blue-soft) 0%, #4A6E8E 100%)', boxShadow: '0 4px 16px var(--blue-glow)' }}
            >
              Continue to setup
            </Link>
          </form>

          <p className="mt-6 rounded-2xl p-4 text-center text-sm" style={{ background: "var(--blue-glow)", color: "var(--text-secondary)" }}>
            Demo registration continues directly to the guided care circle setup.
          </p>

          {!appConfig.supabaseConfigured && (
            <div className="mt-8 rounded-xl p-4 alert-warm text-center">
              <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>
                Demo mode active. Registration is simulated.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold transition-colors hover:text-[var(--blue-soft)]" style={{ color: 'var(--text)' }}>
            Sign in
          </Link>
        </p>

      </main>
    </>
  );
}
