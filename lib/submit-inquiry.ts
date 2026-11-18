/**
 * Sends a validated inquiry to whichever backend this build targets:
 *
 * - "netlify" (NEXT_PUBLIC_FORM_BACKEND=netlify, set in netlify.toml): Netlify Forms. Submissions show up in the
 *   Netlify dashboard (Forms → inquiry), and Netlify can email them to you. No server code or API keys needed.
 *   The form is registered at deploy time by public/__forms.html.
 * - "api" (default, Cloudflare Pages): POST /api/inquiry → functions/api/inquiry.ts (Turnstile + Resend).
 */
import type { Inquiry } from "./inquiry-schema";
import { typeLabel } from "./inquiry-schema";

export const FORM_BACKEND = process.env.NEXT_PUBLIC_FORM_BACKEND === "netlify" ? "netlify" : "api";

export interface SubmitResult {
  ok: boolean;
  error?: string;
  fields?: Partial<Record<string, string>>;
}

async function submitNetlify(data: Inquiry, titles: Map<string, string>): Promise<SubmitResult> {
  // Honeypot filled: pretend success, send nothing.
  if (data.website) return { ok: true };
  const body = new URLSearchParams({
    "form-name": "inquiry",
    "bot-field": "",
    type: typeLabel(data.type),
    name: data.name,
    email: data.email,
    company: data.company,
    products: data.products.map((s) => titles.get(s) ?? s).join("\n"),
    quantity: data.quantity,
    country: data.country,
    region: data.region,
    message: data.message,
    consent: data.consent ? "yes" : "no",
  });
  const res = await fetch("/__forms.html", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return res.ok ? { ok: true } : { ok: false, error: "We couldn't send your message right now. Please try again shortly." };
}

async function submitApi(data: Inquiry): Promise<SubmitResult> {
  const res = await fetch("/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = (await res.json().catch(() => ({}))) as SubmitResult;
  if (res.ok && body.ok) return { ok: true };
  return { ok: false, error: body.error ?? "Something went wrong. Please try again in a minute.", fields: body.fields };
}

export async function submitInquiry(data: Inquiry, titles: Map<string, string>): Promise<SubmitResult> {
  try {
    return FORM_BACKEND === "netlify" ? await submitNetlify(data, titles) : await submitApi(data);
  } catch {
    return { ok: false, error: "We couldn't reach the server. Check your connection and try again." };
  }
}
