/**
 * POST /api/checkout  (stub)
 *
 * Returns "coming soon" for now. To add Stripe Checkout later:
 *   1. Add STRIPE_SECRET_KEY as a secret.
 *   2. Look up each line's price server-side from products.json (`my_price_usd`) and refuse anything not in stock.
 *   3. POST to https://api.stripe.com/v1/checkout/sessions with fetch (form-encoded), mode=payment,
 *      success_url/cancel_url, and line_items[i][price_data][...].
 *   4. Return { ok: true, url: session.url }. The cart page already redirects to `url`.
 */
interface Line {
  slug: string;
  qty: number;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const onRequestPost: PagesFunction = async ({ request }) => {
  let lines: Line[] = [];
  try {
    const body = (await request.json()) as { lines?: Line[] };
    lines = Array.isArray(body.lines) ? body.lines : [];
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }
  if (!lines.length) return json({ ok: false, message: "Your cart is empty." }, 400);

  return json(
    {
      ok: false,
      comingSoon: true,
      message: "Online checkout is coming soon. Send us a message from the Contact page and we'll sort out your order by email.",
    },
    501,
  );
};
