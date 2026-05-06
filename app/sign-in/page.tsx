import Link from "next/link";
import { appConfig } from "@/lib/config";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="glass p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Sign in</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {appConfig.supabaseConfigured ? "Supabase auth enabled." : "Demo mode active. Supabase is not configured."}
        </p>
        <Link
          href="/dashboard"
          className="btn btn-primary mt-6 inline-flex w-full items-center justify-center"
        >
          {appConfig.supabaseConfigured ? "Continue" : "Demo login"}
        </Link>
      </div>
    </main>
  );
}
