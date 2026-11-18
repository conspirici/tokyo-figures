import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/Prose";
import { store } from "@/config/store";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy/" } };

export default function PrivacyPage() {
  return (
    <InfoPage tag="LEGAL" title="Privacy policy" intro={`${store.name} collects only what it needs to answer you and fulfil your orders.`}>
      <h2>What we collect</h2>
      <p>
        When you send an inquiry, order request or &ldquo;Notify me&rdquo; request, we receive what you enter in the form: your name and
        email, and optionally your company, location and message. When you buy, we also receive your shipping address and the
        details needed to process payment. Your cart is stored only in your own browser.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To reply to your inquiry and keep you updated on figures you asked about.</li>
        <li>To process, ship and support your orders, including customs paperwork.</li>
        <li>To meet our legal and accounting obligations.</li>
      </ul>
      <p>We never sell your personal information, and we don&apos;t send marketing emails unless you ask for them.</p>

      <h2>Services we use</h2>
      <ul>
        <li>Cloudflare: website hosting and Turnstile spam protection on our forms.</li>
        <li>Resend: delivering emails from our contact forms.</li>
        <li>Shipping carriers: your name and address, to deliver your order.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        Inquiry emails are kept for as long as needed to help you. Order records are kept for as long as tax and accounting rules
        require.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to show, correct or delete the personal information we hold about you at any time. Depending on where you live
        (for example California), you may have additional rights under state law. Just{" "}
        <Link href="/contact/?type=other">send us a message</Link> and we&apos;ll respond within 30 days.
      </p>

      <h2>Cookies</h2>
      <p>
        We don&apos;t use advertising or tracking cookies. Your browser&apos;s local storage holds your cart, and Cloudflare Turnstile may
        set strictly necessary data to protect our forms from spam.
      </p>
    </InfoPage>
  );
}
