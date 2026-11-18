/**
 * Client side of checkout. Today it calls the stub at functions/api/checkout.ts, which answers "coming soon",
 * and the cart then hands the order over to the contact form (see `orderRequestUrl`).
 * To add Stripe Checkout later: have that function create a Checkout Session (prices looked up server-side from the
 * slug, never trusted from the browser) and return `{ ok: true, url: session.url }`. Nothing here needs to change.
 */
import { formatPrice } from "./format";

export const ORDER_DRAFT_KEY = "tf-order-draft";

export interface CheckoutLine {
  slug: string;
  qty: number;
}

/** Returns a payment URL when online checkout is live, otherwise null (→ fall back to the order request form). */
export async function startCheckout(lines: CheckoutLine[]): Promise<string | null> {
  // Netlify builds have no checkout function yet: go straight to the order request form.
  if (process.env.NEXT_PUBLIC_FORM_BACKEND === "netlify") return null;
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lines }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string };
    return body.ok && body.url ? body.url : null;
  } catch {
    return null; // e.g. `next dev`, where Pages Functions don't run
  }
}

/** Saves a ready-to-send order message and returns the contact form URL with the products preselected. */
export function orderRequestUrl(items: { slug: string; title: string; price: number; qty: number }[]) {
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  const draft = [
    "Hi! I'd like to order:",
    ...items.map((i) => `- ${i.qty} × ${i.title} (${formatPrice(i.price)} each)`),
    `Subtotal: ${formatPrice(total)} + shipping`,
    "",
    "Please send me shipping and payment details.",
  ].join("\n");
  try {
    sessionStorage.setItem(ORDER_DRAFT_KEY, draft);
  } catch {
    /* storage unavailable: products are still preselected via the URL */
  }
  const params = new URLSearchParams({ type: "order", product: items.map((i) => i.slug).join(","), order: "1" });
  return `/contact/?${params.toString()}#order-form`;
}
