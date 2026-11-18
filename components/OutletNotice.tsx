import Link from "next/link";

/** Ticket-style outlet notice. Shown above the fold on outlet product pages. */
export function OutletNotice({ note }: { note: string }) {
  return (
    <aside
      aria-label="Outlet item notice"
      className="relative overflow-hidden rounded-xl border-2 border-ink bg-white"
    >
      <div className="flex">
        <div className="flex w-14 shrink-0 items-center justify-center border-r-2 border-dashed border-ink bg-lime">
          <span className="font-display text-sm tracking-widest text-ink [writing-mode:vertical-rl] rotate-180">OUTLET</span>
        </div>
        <div className="p-4">
          <p className="font-bold">Heads up: this is an outlet item</p>
          <p className="mt-1 text-sm text-ink-soft">{note}</p>
          <Link href="/returns/" className="mt-2 inline-block text-sm font-semibold text-electric underline underline-offset-2">
            How outlet items work
          </Link>
        </div>
      </div>
      {/* ticket notches */}
      <span aria-hidden className="absolute left-[49px] -top-2 h-4 w-4 rounded-full border-2 border-ink bg-paper" />
      <span aria-hidden className="absolute left-[49px] -bottom-2 h-4 w-4 rounded-full border-2 border-ink bg-paper" />
    </aside>
  );
}
