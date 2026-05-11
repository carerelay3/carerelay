import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { appConfig } from "@/lib/config";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const user = await getCurrentSupabaseUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[85vh] w-full max-w-md flex-col items-center justify-center px-4 py-20">
      <div className="mb-10 flex flex-col items-center justify-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teal)] shadow-lg">
          <span className="text-xl font-bold text-white">C</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Create account</h1>
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>Start a care circle in under five minutes</p>
      </div>

      <div className="w-full glass-elevated p-8 sm:p-10">
        <AuthForm mode="sign-up" supabaseConfigured={appConfig.supabaseConfigured} />

        <p className="mt-6 rounded-2xl p-4 text-center text-sm" style={{ background: "var(--teal-soft)", color: "var(--text-secondary)" }}>
          {appConfig.supabaseConfigured
            ? "After account creation, setup will create a live care circle owned by your authenticated user."
            : "Account creation is unavailable until Supabase environment variables are configured."}
        </p>
      </div>

      <p className="mt-10 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold transition-colors hover:text-[var(--teal)]" style={{ color: "var(--text)" }}>
          Sign in
        </Link>
      </p>
    </main>
  );
}
