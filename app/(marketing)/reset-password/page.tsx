import Link from "next/link";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { appConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[85vh] w-full max-w-md flex-col items-center justify-center px-4 py-20">
      <div className="mb-10 flex flex-col items-center justify-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teal)] shadow-lg">
          <span className="text-xl font-bold text-white">C</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Set a new password</h1>
        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Use the recovery link from your email to finish updating your password.
        </p>
      </div>

      <div className="w-full glass-elevated p-8 sm:p-10">
        <ResetPasswordForm supabaseConfigured={appConfig.supabaseConfigured} />
      </div>

      <p className="mt-10 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
        Need a new link?{" "}
        <Link href="/forgot-password" className="font-semibold transition-colors hover:text-[var(--teal)]" style={{ color: "var(--text)" }}>
          Request another reset
        </Link>
      </p>
    </main>
  );
}
