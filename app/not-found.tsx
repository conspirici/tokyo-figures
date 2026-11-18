import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid-paper flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="max-w-lg rounded-3xl border-2 border-ink bg-white p-10 text-center shadow-hard-lg">
        <span className="inline-block -rotate-6 rounded-full border-2 border-ink bg-lime px-4 py-1 font-display">ERROR 404</span>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl">This page wandered off</h1>
        <p className="mt-3 text-ink-soft">The figure or page you&apos;re after isn&apos;t here. The rest of the shelf is, though.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop/" className="btn-press rounded-full border-2 border-ink bg-electric px-6 py-3 font-display text-white shadow-hard">
            Go to the shop
          </Link>
          <Link href="/" className="btn-press rounded-full border-2 border-ink bg-white px-6 py-3 font-display shadow-hard">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
