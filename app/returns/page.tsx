import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/Prose";
import { policies } from "@/config/store";

export const metadata: Metadata = {
  title: "Returns & outlet policy",
  description: "Our returns policy and what to expect from outlet figures.",
  alternates: { canonical: "/returns/" },
};

export default function ReturnsPage() {
  return (
    <InfoPage tag="HELP" title="Returns & outlet policy" intro="Clear rules, no surprises. Here's how returns work for new and outlet figures.">
      <h2>Returns on new figures</h2>
      <p>
        You can return a new figure within {policies.returnWindowDays} days of delivery if it is unopened and in its original
        condition, with all seals intact. Return shipping to Japan is paid by the customer, and we recommend a tracked service.
        Once the figure arrives back with us and is inspected, we refund the item price to your original payment method within{" "}
        {policies.refundDays}. Original shipping charges and duties are non-refundable.
      </p>

      <h2>What &ldquo;Outlet&rdquo; means</h2>
      <p>
        Outlet figures are factory-sealed units whose boxes may have minor shipping dings or corner creases. Each outlet product page
        shows a clear note describing what to expect, right next to the price.
      </p>
      <p>
        <strong>Outlet items are final sale:</strong> no returns for cosmetic or packaging wear.
      </p>

      <h2>Wrong item or damaged in transit</h2>
      <p>
        If you receive the wrong figure, or your order is damaged in shipping (outlet items included), contact us within{" "}
        {policies.damageReportHours} hours of delivery with photos of the outer carton, the figure box and the item. We&apos;ll cover
        return shipping and send the correct item or a replacement, or issue a full refund if one isn&apos;t available.
      </p>

      <h2>How to start a return</h2>
      <p>
        <Link href="/contact/?type=other">Send us a message</Link> with your name, the figure you ordered and a few photos. We&apos;ll reply
        within {policies.replyWindow} with return instructions. Please don&apos;t send items back without contacting us first.
      </p>
    </InfoPage>
  );
}
