import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="glass p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Create account</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Start a care circle in under five minutes.</p>
        <Link
          href="/setup"
          className="btn btn-primary mt-6 inline-flex w-full items-center justify-center"
        >
          Continue to setup
        </Link>
      </div>
    </main>
  );
}
