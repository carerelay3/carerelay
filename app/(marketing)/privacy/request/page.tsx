import Link from "next/link";
import { redirect } from "next/navigation";
import { PrivacyRequestForm } from "@/components/PrivacyRequestForm";
import { hasSupabase } from "@/lib/config";
import { getCurrentSupabaseUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function PrivacyRequestPage() {
  if (!hasSupabase()) {
    redirect("/sign-in");
  }

  const user = await getCurrentSupabaseUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="page-shell py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="section-kicker">Privacy request</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Request your CircleRelay data or account review
        </h1>
        <p className="mt-4" style={{ color: "var(--text-muted)" }}>
          Use this form to request an export, account deletion review, care circle data review, billing help, or another privacy-related action.
        </p>

        <PrivacyRequestForm />

        <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          Need to review the privacy notes first?{" "}
          <Link href="/privacy" className="font-semibold underline">
            View privacy notes
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
