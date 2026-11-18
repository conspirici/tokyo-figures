import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getProductSummaries, getRelated } from "@/lib/products";
import { formatPrice, pad2 } from "@/lib/format";
import { store } from "@/config/store";
import { Gallery } from "@/components/Gallery";
import { BuyBox } from "@/components/BuyBox";
import { PriceChip } from "@/components/PriceChip";
import { Sticker, productStickers } from "@/components/Sticker";
import { OutletNotice } from "@/components/OutletNotice";
import { TrustStrip } from "@/components/TrustStrip";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { InquiryForm } from "@/components/InquiryForm";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const title = p.title.length > 70 ? `${p.character}: ${p.franchise}${p.scale ? ` ${p.scale}` : ""}${p.condition === "outlet" ? " (Outlet)" : ""}` : p.title;
  const description = `${p.tagline} ${p.description}`.slice(0, 158).replace(/\s+\S*$/, "") + "…";
  const image = p.images[0] ? `${p.images[0]}-960.webp` : "/hero/slide-1-1200.webp";
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}/` },
    openGraph: { title: p.title, description, type: "website", url: `/products/${p.slug}/`, images: [{ url: image, alt: p.title }] },
  };
}

function jsonLd(p: NonNullable<ReturnType<typeof getProduct>>) {
  const url = `${store.siteUrl}/products/${p.slug}/`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    sku: `TF-${p.id}`,
    category: "Collectible figures",
    url,
    image: p.images.map((i) => `${store.siteUrl}${i}.jpg`),
    itemCondition: p.condition === "outlet" ? "https://schema.org/DamagedCondition" : "https://schema.org/NewCondition",
  };
  if (p.price != null) {
    data.offers = {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "USD",
      url,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: data.itemCondition,
    };
  }
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const related = getRelated(p);
  const specs = [
    ["Scale", p.scale],
    ["Bonus", p.bonus],
    ["Franchise", p.franchise],
    ["Character", p.character],
    ["Condition", p.condition === "outlet" ? "Outlet (see note)" : "New"],
  ].filter((r): r is [string, string] => !!r[1]);
  const notify = !p.inStock || p.price == null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(p) }} />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-ink-soft">
            <li><Link href="/shop/" className="hover:underline">Shop</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/shop/?franchise=${p.franchiseSlug}`} className="hover:underline">{p.franchise}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-ink">No. {pad2(p.no)}</li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="relative lg:sticky lg:top-24 lg:self-start">
          <span className="absolute -left-2 -top-3 z-10 rounded-md border-2 border-ink bg-electric px-2.5 py-0.5 font-display text-white shadow-hard-sm">
            No. {pad2(p.no)}
          </span>
          <Gallery images={p.images} alt={p.title} no={p.no} />
        </div>

        <div>
          <Reveal className="flex flex-wrap items-center gap-2">
            {productStickers(p).map((s, i) => (
              <span key={s} data-reveal style={{ ["--i" as string]: i }}>
                <Sticker kind={s} rot={i % 2 ? 4 : -4} stamp />
              </span>
            ))}
            {p.ageGate && <Sticker kind="age" rot={3} />}
          </Reveal>

          <Link href={`/shop/?franchise=${p.franchiseSlug}`} className="mt-5 inline-block text-sm font-bold uppercase tracking-wider text-electric hover:underline">
            {p.franchise}
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{p.title}</h1>
          <p className="mt-3 text-lg text-ink-soft">{p.tagline}</p>

          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
            <PriceChip price={p.price} size="lg" />
            {p.price != null && <span className="pb-1 text-sm text-ink-soft">+ shipping calculated at checkout</span>}
          </div>

          <p className={`mt-4 flex items-center gap-2 font-semibold ${p.inStock ? "text-[#0d7a3a]" : "text-unavailable"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${p.inStock ? "bg-[#16a34a]" : "bg-unavailable"}`} aria-hidden />
            {p.inStock ? "In stock / Ships from Japan" : "Currently unavailable"}
          </p>

          {p.condition === "outlet" && p.conditionNote && (
            <div className="mt-5">
              <OutletNotice note={p.conditionNote} />
            </div>
          )}

          <div className="mt-6">
            <BuyBox slug={p.slug} title={p.title} price={p.price} inStock={p.inStock} image={p.images[0]} />
          </div>

          <p className="mt-4 text-sm">
            Buying for a store?{" "}
            <Link href={`/wholesale/?product=${p.slug}&type=wholesale`} className="font-semibold text-electric underline underline-offset-2">
              Ask about wholesale
            </Link>
          </p>

          <div className="mt-8 space-y-4 border-t-2 border-ink pt-8">
            <p className="leading-relaxed">{p.description}</p>
            {p.highlights.length > 0 && (
              <ul className="space-y-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-electric" aria-hidden>
                      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <table className="mt-8 w-full overflow-hidden rounded-xl border-2 border-ink text-sm">
            <caption className="sr-only">Specifications</caption>
            <tbody>
              {specs.map(([k, v], i) => (
                <tr key={k} className={i % 2 ? "bg-white" : "bg-paper"}>
                  <th scope="row" className="w-32 border-r-2 border-ink px-4 py-2.5 text-left font-bold">{k}</th>
                  <td className="px-4 py-2.5">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8">
            <TrustStrip compact />
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Import duties: see <Link href="/shipping/" className="font-semibold text-electric underline underline-offset-2">Shipping &amp; duties</Link> before you buy.
            {p.price != null && <> Price shown: {formatPrice(p.price)} USD.</>}
          </p>
        </div>
      </section>

      <section className="grid-paper border-y-2 border-ink py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionTitle tag="MORE">You may also like</SectionTitle>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <li key={r.id}>
                  <ProductCard p={r} index={i} />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="inquiry" className="scroll-mt-24 py-14">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionTitle tag={notify ? "NOTIFY ME" : "QUESTIONS"}>{notify ? "Get notified" : "Ask about this figure"}</SectionTitle>
            <p className="text-ink-soft">
              {notify
                ? "Leave your email and we'll let you know if this figure becomes available or gets a price."
                : "Questions about condition, shipping or duties? We'll get back to you by email."}
            </p>
          </div>
          <InquiryForm products={getProductSummaries()} defaultType={notify ? "notify" : "product"} defaultProducts={[p.slug]} readUrl={false} />
        </div>
      </section>
    </>
  );
}
