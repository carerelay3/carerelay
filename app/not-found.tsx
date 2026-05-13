import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="product-card max-w-2xl p-8 text-center sm:p-12">
        <div className="relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ background: "linear-gradient(135deg, var(--teal), var(--blue-soft))" }}>
            404
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>This page is not in the care circle.</h1>
          <p className="mt-4">The link may have moved, but you can return to the demo or dashboard from here.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo" className="btn btn-sage">Try the demo</Link>
            <Link href="/" className="btn btn-soft">Back home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
