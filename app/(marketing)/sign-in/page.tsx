import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { appConfig } from "@/lib/config";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const user = await getCurrentSupabaseUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[85vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="mb-10 flex flex-col items-center justify-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teal)] shadow-lg">
          <span className="text-xl font-bold text-white">C</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Welcome back</h1>
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your care circle</p>
      </div>

      <div className="w-full glass-elevated p-6 sm:p-10">
        <AuthForm mode="sign-in" supabaseConfigured={appConfig.supabaseConfigured} />

        <div className="mt-5 text-center text-sm">
          <Link href="/forgot-password" className="font-semibold transition-colors hover:text-[var(--teal)]" style={{ color: "var(--text)" }}>
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 rounded-2xl p-4 text-center text-sm" style={{ background: "var(--teal-soft)", color: "var(--text-secondary)" }}>
          {appConfig.supabaseConfigured
            ? "Use your CircleRelay account credentials. Live dashboard access is checked against your care circle membership."
            : "Account sign in is unavailable until Supabase environment variables are configured."}
        </p>
      </div>

      <p className="mt-10 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
        Don&apos;t have a care circle yet?{" "}
        <Link href="/sign-up" className="font-semibold transition-colors hover:text-[var(--teal)]" style={{ color: "var(--text)" }}>
          Create one
        </Link>
      </p>
    </main>
  );
}
