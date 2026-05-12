import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { appConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const resetRedirectUrl = `${appConfig.appUrl.replace(/\/$/, "")}/reset-password`;

  return (
    <main className="mx-auto flex min-h-[85vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="mb-10 flex flex-col items-center justify-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teal)] shadow-lg">
          <span className="text-xl font-bold text-white">C</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Reset your password</h1>
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Enter your account email and Supabase will send a recovery link.
        </p>
      </div>

      <div className="w-full glass-elevated p-6 sm:p-10">
        <ForgotPasswordForm
          supabaseConfigured={appConfig.supabaseConfigured}
          resetRedirectUrl={resetRedirectUrl}
        />

        <p className="mt-6 rounded-2xl p-4 text-center text-sm" style={{ background: "var(--teal-soft)", color: "var(--text-secondary)" }}>
          Supabase Auth must allow this redirect URL: https://carerelay.xyz/reset-password
        </p>
      </div>

      <p className="mt-10 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
        Remembered your password?{" "}
        <Link href="/sign-in" className="font-semibold transition-colors hover:text-[var(--teal)]" style={{ color: "var(--text)" }}>
          Sign in
        </Link>
      </p>
    </main>
  );
}
