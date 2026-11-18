import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/Prose";
import { policies, store } from "@/config/store";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms/" } };

export default function TermsPage() {
  return (
    <InfoPage tag="LEGAL" title="Terms of sale" intro={`These terms apply to all purchases from ${store.name}. By placing an order, you agree to them.`}>
      <h2>Who we are</h2>
      <p>
        {store.name} is an independent retailer, not affiliated with or endorsed by the publishers, studios or manufacturers of the
        products shown. All product names, characters and trademarks belong to their respective owners.
      </p>

      <h2>Products and descriptions</h2>
      <p>
        We describe every figure as accurately as we can, including the condition of outlet items. Product photos are for reference.
        Minor differences in paint and finish are normal for mass-produced figures and are not considered defects.
      </p>

      <h2>Prices and payment</h2>
      <p>
        All prices are in US dollars. Shipping and applicable import duties are shown before you pay. {policies.paymentSummary} An
        order is accepted only once payment is received and we&apos;ve confirmed availability. If an item turns out to be unavailable, we
        refund it in full.
      </p>

      <h2>Shipping and risk</h2>
      <p>
        Orders ship from Japan as described on our <Link href="/shipping/">Shipping &amp; duties</Link> page. Delivery times are estimates
        and not guaranteed. Responsibility for the package passes to you on delivery.
      </p>

      <h2>Returns and outlet items</h2>
      <p>
        Returns are handled under our <Link href="/returns/">Returns &amp; outlet policy</Link>. Outlet items are final sale, with no
        returns for cosmetic or packaging wear.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, our liability for any order is limited to the amount you paid for it. We are not liable for
        indirect or consequential losses.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The version on this page when you place your order applies to that order.
        Questions? <Link href="/contact/">Contact us</Link>.
      </p>
    </InfoPage>
  );
}
