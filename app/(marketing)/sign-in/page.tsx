import Link from "next/link";
import { appConfig } from "@/lib/config";

function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg)] pointer-events-none">
      <div 
        className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vw] rounded-full opacity-40 blur-[120px] animate-pulse-soft" 
        style={{ background: 'radial-gradient(circle, var(--sage-soft), transparent 70%)' }} 
      />
      <div 
        className="absolute -bottom-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full opacity-30 blur-[120px] animate-pulse-soft" 
        style={{ animationDelay: '1s', background: 'radial-gradient(circle, var(--blue-glow), transparent 70%)' }} 
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <>
      <AmbientBackground />
      <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-20 min-h-[85vh] animate-fade-in-up">
        
        {/* Logo/Brand Marker */}
        <div className="mb-10 flex flex-col items-center justify-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sage)] shadow-lg" style={{ boxShadow: 'var(--shadow-glow-sage)' }}>
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Welcome back</h1>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Sign in to your care circle
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full glass-elevated p-8 sm:p-10">
          <form className="space-y-6">
            <div className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <Link href="#" className="text-xs transition-colors hover:text-[var(--sage)]" style={{ color: 'var(--text-subtle)' }}>
                    Forgot password?
                  </Link>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-glass"
                />
              </div>
            </div>

            <Link
              href="/dashboard"
              className="btn btn-sage w-full inline-flex items-center justify-center py-3 text-base"
            >
              Sign In
            </Link>
          </form>

          {/* Social / Biometric */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Or continue with</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button className="btn btn-soft w-full flex items-center justify-center gap-3 py-3">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Passkey
            </button>
          </div>

          {!appConfig.supabaseConfigured && (
            <div className="mt-8 rounded-xl p-4 alert-warm text-center">
              <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>
                Demo mode active. Any credentials will grant access.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
          Don&apos;t have a care circle yet?{" "}
          <Link href="/sign-up" className="font-semibold transition-colors hover:text-[var(--sage)]" style={{ color: 'var(--text)' }}>
            Create one
          </Link>
        </p>

      </main>
    </>
  );
}
