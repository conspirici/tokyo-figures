import Link from "next/link";
import heroSlides from "@/content/hero.json";
import placeholders from "@/content/hero-placeholders.json";
import { getFranchises, getProducts } from "@/lib/products";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { Ticker } from "@/components/Ticker";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { TrustStrip } from "@/components/TrustStrip";
import { ProductImage } from "@/components/ProductImage";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export default function Home() {
  const products = getProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const slides: HeroSlide[] = (heroSlides as Omit<HeroSlide, "placeholder" | "fallbackImage">[]).map((s) => ({
    ...s,
    placeholder: (placeholders as Record<string, string>)[s.image],
    fallbackImage: bySlug.get(s.slug)?.images[0],
  }));
  const featured = products.filter((p) => p.featured);
  const outlet = products.filter((p) => p.condition === "outlet").sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.no - b.no).slice(0, 4);
  const franchises = getFranchises();

  return (
    <>
      <HeroCarousel slides={slides} />
      <Ticker />

      <section className="grid-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionTitle
              tag="FIGURES / MUST-HAVES"
              action={
                <Link href="/shop/" className="btn-press rounded-full border-2 border-ink bg-white px-5 py-2 font-bold shadow-hard-sm">
                  Shop all 15
                </Link>
              }
            >
              Featured
            </SectionTitle>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <li key={p.id}>
                  <ProductCard p={p} index={i} />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="border-y-2 border-ink bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionTitle tag="BROWSE">By franchise</SectionTitle>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {franchises.map((f, i) => (
                <li key={f.slug} data-reveal style={{ ["--i" as string]: i }}>
                  <Link
                    href={`/shop/?franchise=${f.slug}`}
                    className={`card-lift group flex h-full items-center gap-3 rounded-2xl border-2 border-ink p-3 shadow-hard ${i % 3 === 0 ? "bg-electric text-white" : i % 3 === 1 ? "bg-lime text-ink" : "bg-paper text-ink"}`}
                  >
                    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-white p-1">
                      <ProductImage base={f.sample.images[0]} alt="" no={f.sample.no} sizes="64px" />
                    </span>
                    <span>
                      <span className="block font-display text-base leading-tight sm:text-lg">{f.name}</span>
                      <span className="mt-1 block text-xs font-semibold opacity-80">
                        {f.count} figure{f.count > 1 ? "s" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <TrustStrip />
        </div>
      </section>

      <section className="grid-paper border-y-2 border-ink py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionTitle
              tag="OUTLET"
              action={
                <Link href="/shop/?cond=outlet" className="btn-press rounded-full border-2 border-ink bg-lime px-5 py-2 font-bold shadow-hard-sm">
                  All outlet deals
                </Link>
              }
            >
              Outlet deals
            </SectionTitle>
            <p className="-mt-2 mb-8 max-w-2xl text-ink-soft">
              Factory-sealed figures whose boxes may have a few shipping dings. Each outlet page spells out exactly what to expect.
            </p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2 lg:grid-cols-4">
              {outlet.map((p, i) => (
                <li key={p.id}>
                  <ProductCard p={p} index={i} />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="grid-paper-blue relative overflow-hidden rounded-3xl border-2 border-ink p-8 text-white shadow-hard-lg sm:p-12">
            <div data-reveal className="max-w-2xl">
              <p className="font-display text-xs tracking-[0.25em] text-lime">NEWSLETTER</p>
              <h2 className="mt-2 font-display text-3xl sm:text-5xl">New drops, straight from Japan</h2>
              <p className="mt-3 text-white/90">Hear about restocks and new outlet finds first. No spam, unsubscribe any time.</p>
              <div className="mt-6">
                <NewsletterSignup />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
