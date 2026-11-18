import type { Metadata } from "next";
import Link from "next/link";
import { getProductSummaries } from "@/lib/products";
import { InquiryForm } from "@/components/InquiryForm";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a figure, availability, shipping or duties? Send us a message.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.5fr]">
      <div>
        <SectionTitle as="h1" tag="CONTACT">Say hi</SectionTitle>
        <p className="text-lg text-ink-soft">
          Questions about a figure, its condition, shipping or US import duties? Send a message and we&apos;ll reply by email.
        </p>
        <p className="mt-4 rounded-xl border-2 border-ink bg-lime px-4 py-3 text-sm font-semibold">
          Want to order? Online payment is coming soon. Pick &ldquo;Place an order&rdquo;, list the figures you want, and we&apos;ll reply with shipping and payment details.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>
            Shipping questions? Try <Link href="/shipping/" className="font-semibold text-electric underline">Shipping &amp; duties</Link> first.
          </li>
          <li>
            Ordering for a store? Use the <Link href="/wholesale/" className="font-semibold text-electric underline">wholesale form</Link>.
          </li>
        </ul>
      </div>
      <div id="order-form" className="scroll-mt-24">
        <InquiryForm products={getProductSummaries()} defaultType="product" />
      </div>
    </div>
  );
}
