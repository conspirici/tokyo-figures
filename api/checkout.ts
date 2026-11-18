/** POST /api/checkout on Vercel: "coming soon" stub, so the cart falls back to the order request form. */
import { handleCheckout } from "../lib/inquiry-handler";

export async function POST(request: Request): Promise<Response> {
  return handleCheckout(request);
}
