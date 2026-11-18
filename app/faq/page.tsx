import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { InfoPage } from "@/components/Prose";
import { policies } from "@/config/store";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about imported figures, prices, availability, shipping and outlet items.",
  alternates: { canonical: "/faq/" },
};

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Are these figures new?",
    a: (
      <>
        Items marked <strong>New</strong> are brand new. Items marked <strong>Outlet</strong> are factory-sealed, but the box may
        have minor shipping dings. See <Link href="/returns/">our outlet policy</Link>.
      </>
    ),
  },
  {
    q: "Why does a figure say “Price coming soon”?",
    a: "We're still confirming the price for that figure. Tap “Notify me” on its page and we'll email you once it's set.",
  },
  {
    q: "What does “Currently unavailable” mean?",
    a: "The figure is sold out at our source in Japan and we may not be able to get more. Use “Notify me” and we'll tell you if that changes.",
  },
  {
    q: "Do I have to pay import duties?",
    a: (
      <>
        {policies.dutiesSummary} Full details are on our <Link href="/shipping/">Shipping &amp; duties</Link> page.
      </>
    ),
  },
  {
    q: "How long does shipping take?",
    a: `Orders leave Japan within ${policies.handlingTime}. Standard delivery to the US takes ${policies.deliveryWindow}. Every order is tracked.`,
  },
  {
    q: "How do I pay?",
    a: (
      <>
        {policies.paymentSummary} Add figures to your cart and check out, or{" "}
        <Link href="/contact/?type=order">send us an order request</Link>.
      </>
    ),
  },
  {
    q: "Can I return a figure?",
    a: (
      <>
        Unopened new figures can be returned within {policies.returnWindowDays} days of delivery. Outlet items are final sale. See the{" "}
        <Link href="/returns/">returns policy</Link>.
      </>
    ),
  },
  {
    q: "Do you sell wholesale?",
    a: (
      <>
        Yes, we work with US retailers and resellers. <Link href="/wholesale/">Send a wholesale inquiry</Link>.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <InfoPage tag="HELP" title="FAQ">
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-2xl border-2 border-ink bg-white p-5 shadow-hard-sm open:shadow-hard">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {f.q}
              <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-lime font-display transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="mt-3 text-ink-soft">{f.a}</div>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
