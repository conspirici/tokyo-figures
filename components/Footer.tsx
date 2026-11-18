import Link from "next/link";
import { store } from "@/config/store";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/shop/", label: "All figures" },
      { href: "/shop/?cond=new", label: "New" },
      { href: "/shop/?cond=outlet", label: "Outlet" },
      { href: "/shop/?avail=in", label: "In stock" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/about/", label: "How imports work" },
      { href: "/shipping/", label: "Shipping & duties" },
      { href: "/returns/", label: "Returns & outlet policy" },
      { href: "/faq/", label: "FAQ" },
    ],
  },
  {
    title: "Talk to us",
    links: [
      { href: "/contact/", label: "Contact" },
      { href: "/wholesale/", label: "Wholesale" },
      { href: "/terms/", label: "Terms" },
      { href: "/privacy/", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-3xl text-lime">{store.name}</p>
            <p className="mt-3 max-w-xs text-sm text-white/75">{store.tagline}. A small, curated shop: 15 figures, picked one by one.</p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="mb-3 font-display text-sm tracking-widest text-lime">{c.title.toUpperCase()}</p>
              <ul className="space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/85 hover:text-lime hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 border-t border-white/20 pt-6 text-xs leading-relaxed text-white/70">
          This is an independent retailer, not affiliated with or endorsed by the publishers, studios or manufacturers of the
          products shown. All product names, characters and trademarks belong to their respective owners.
        </p>
        <p className="mt-3 text-xs text-white/50">© {new Date().getFullYear()} {store.name}. Prices in USD.</p>
      </div>
    </footer>
  );
}
