import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/Prose";
import { policies } from "@/config/store";

export const metadata: Metadata = {
  title: "Shipping & duties",
  description: "How figures ship from Japan to the US, delivery times and how US import duties are handled.",
  alternates: { canonical: "/shipping/" },
};

export default function ShippingPage() {
  return (
    <InfoPage tag="HELP" title="Shipping & duties" intro="Every order ships directly from Japan, fully tracked, to your door in the US.">
      <h2>Processing time</h2>
      <p>
        Orders are packed and dispatched within {policies.handlingTime} of payment. As soon as your package leaves Japan, we email you a
        tracking number so you can follow it all the way to your door.
      </p>

      <h2>Delivery times</h2>
      <p>
        We ship with {policies.carriers}. Standard delivery to the contiguous US typically takes {policies.deliveryWindow}. Alaska, Hawaii and US territories may take a few days longer. Carrier delays and
        customs processing can occasionally add time, and we&apos;ll keep you updated if anything changes.
      </p>

      <h2>Shipping costs</h2>
      <p>
        Shipping is priced by the size and weight of the boxed figure. Large 1/4 scale figures
        ship in bigger boxes and cost more to send than 1/7 scale figures. You&apos;ll always see the exact shipping cost before you pay.
      </p>

      <h2>US import duties and tariffs</h2>
      <p>
        Figures shipped from Japan to the US may be subject to import duties and tariffs. <strong>{policies.dutiesSummary}</strong>      </p>

      <h2>Packing</h2>
      <p>
        We know the box matters to collectors. Each figure is wrapped, padded and shipped inside a sturdy outer carton so the original
        packaging arrives in the condition described. Outlet items ship exactly as described on their product page.
      </p>

      <h2>Lost or damaged packages</h2>
      <p>
        If your package arrives damaged, please photograph the outer carton and the figure box before unpacking further, and{" "}
        <Link href="/contact/?type=shipping">contact us</Link> within {policies.damageReportHours} hours of delivery. If tracking shows no
        movement for 10 business days, let us know and we&apos;ll open a claim with the carrier. Once a claim is confirmed, we&apos;ll send
        a replacement if one is available, or issue a full refund.
      </p>
    </InfoPage>
  );
}
