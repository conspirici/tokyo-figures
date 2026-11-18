import type { Metadata } from "next";
import { getProductSummaries } from "@/lib/products";
import { InquiryForm } from "@/components/InquiryForm";
import { SectionTitle } from "@/components/SectionTitle";
import { policies } from "@/config/store";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Wholesale and bulk orders of imported Japanese figures for US retailers and resellers.",
  alternates: { canonical: "/wholesale/" },
};

const offers = [
  "Japanese figures sourced in Japan, including limited and outlet stock",
  "Clear condition notes on every outlet unit",
  "Tracked shipping from Japan",
  "A real person answering your emails",
];

const steps = [
  { n: "01", t: "Tell us what you need", b: "Pick the figures and rough quantities in the form below." },
  { n: "02", t: "Get a quote", b: "We reply by email with availability, pricing and shipping." },
  { n: "03", t: "Confirm and ship", b: "Once you approve, we pack and ship from Japan with tracking." },
];

export default function WholesalePage() {
  return (
    <>
      <section className="grid-paper-blue border-b-2 border-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <span className="inline-block rounded-md bg-lime px-2 py-0.5 font-display text-xs tracking-widest text-ink">WHOLESALE</span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl sm:text-6xl">Stock Japanese figures in your US store</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            We work with US retailers, resellers and event sellers who want imported figures without dealing with Japanese stores directly.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">What we offer</h2>
            <ul className="mt-4 space-y-2">
              {offers.map((o) => (
                <li key={o} className="flex gap-2.5">
                  <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rotate-45 border-2 border-ink bg-lime" />
                  {o}
                </li>
              ))}
            </ul>
            <h2 className="mt-10 font-display text-2xl">Terms</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-bold">Minimum order</dt><dd className="text-ink-soft">{policies.wholesaleMinimum}</dd></div>
              <div><dt className="font-bold">Pricing tiers</dt><dd className="text-ink-soft">{policies.wholesalePricing}</dd></div>
              <div><dt className="font-bold">Payment terms</dt><dd className="text-ink-soft">{policies.wholesalePayment}</dd></div>
            </dl>
          </div>
          <ol className="grid gap-4 self-start">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-4 rounded-2xl border-2 border-ink bg-white p-5 shadow-hard-sm">
                <span className="font-display text-3xl text-electric">{s.n}</span>
                <span>
                  <span className="block font-bold">{s.t}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{s.b}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <SectionTitle tag="INQUIRY">Request a quote</SectionTitle>
          <InquiryForm products={getProductSummaries()} defaultType="wholesale" />
        </div>
      </div>
    </>
  );
}
