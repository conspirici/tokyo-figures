import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/Prose";
import { TrustStrip } from "@/components/TrustStrip";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: "How it works",
  description: "How importing a figure from Japan works, step by step, and who we are.",
  alternates: { canonical: "/about/" },
};

const steps = [
  { n: "01", t: "Pick your figure", b: "Every figure on the site is one we've chosen. Outlet items are clearly marked with what to expect." },
  { n: "02", t: "We ship it from Japan", b: "Your order is packed and sent from Japan with tracking." },
  { n: "03", t: "Customs, explained", b: "US import duties are explained before you pay, so there are no surprises at the door." },
];

export default function AboutPage() {
  return (
    <InfoPage tag="ABOUT" title="How it works" intro="A small shop bringing Japanese figures to US collectors, one carefully chosen piece at a time.">
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="list-none rounded-2xl border-2 border-ink bg-white p-5 shadow-hard-sm">
            <span className="font-display text-3xl text-electric">{s.n}</span>
            <p className="mt-2 font-bold">{s.t}</p>
            <p className="mt-1 text-sm text-ink-soft">{s.b}</p>
          </li>
        ))}
      </ol>

      <h2>Who we are</h2>
      <p>
        {store.name} is a small, independent shop run by collectors, for collectors. We source figures directly from stores in
        Japan, inspect every listing carefully, and describe each one honestly, including any box wear on outlet items.
      </p>
      <p>
        Importing a figure yourself means navigating Japanese storefronts, international shipping and US customs. We handle all of
        that for you, with straightforward pricing in US dollars and a real person on the other end of every email.
      </p>

      <h2>Why only 15 figures?</h2>
      <p>
        We&apos;d rather carry a short list we know well than a giant catalog. Each figure is picked for its sculpt, its
        fandom, or because it&apos;s hard to find in the US.
      </p>

      <h2>Questions?</h2>
      <p>
        Check the <Link href="/faq/">FAQ</Link>, read about <Link href="/shipping/">shipping and duties</Link>, or{" "}
        <Link href="/contact/">send us a message</Link>.
      </p>

      <div className="pt-4">
        <TrustStrip compact />
      </div>
    </InfoPage>
  );
}
