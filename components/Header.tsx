"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart";
import { store } from "@/config/store";

const NAV = [
  { href: "/shop/", label: "Shop" },
  { href: "/shop/?cond=outlet", label: "Outlet" },
  { href: "/about/", label: "How it works" },
  { href: "/wholesale/", label: "Wholesale" },
  { href: "/contact/", label: "Contact" },
];

export function Header() {
  const { count, bump } = useCart();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        // hide when scrolling down past the header, show when scrolling up
        if (Math.abs(y - lastY.current) > 6) {
          setHidden(y > lastY.current && y > 120);
          lastY.current = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-transform duration-300 ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div
        className={`border-b-2 bg-white/95 backdrop-blur transition-shadow ${scrolled ? "border-ink shadow-hard" : "border-transparent"}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2" aria-label={`${store.name} home`}>
            <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-electric font-display text-sm text-lime shadow-hard-sm">
              TF
            </span>
            <span className="font-display text-lg leading-none">
              {store.shortName}
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => {
                const active = pathname === n.href.split("?")[0] && !n.href.includes("?");
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-paper ${active ? "bg-ink text-white hover:bg-ink" : ""}`}
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/cart/"
            className="btn-press relative ml-auto grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-lime shadow-hard-sm md:ml-2"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <m.span key={bump} initial={bump ? { scale: 1.35, rotate: -12 } : false} animate={{ scale: 1, rotate: 0 }} className="block">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6.2" />
                <circle cx="10" cy="20" r="1.3" />
                <circle cx="17" cy="20" r="1.3" />
              </svg>
            </m.span>
            <AnimatePresence>
              {count > 0 && (
                <m.span
                  key={count}
                  initial={{ y: -8, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-electric px-1 text-[11px] font-bold text-white"
                >
                  {count}
                </m.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            className="btn-press grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <m.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border-t-2 border-ink bg-white md:hidden"
            >
              <ul className="mx-auto max-w-7xl px-4 py-3">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block rounded-lg px-3 py-3 font-display text-xl hover:bg-paper">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </m.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
