/**
 * Platform-neutral inquiry handler, shared by:
 *   - Vercel:            api/inquiry.ts
 *   - Cloudflare Pages:  functions/api/inquiry.ts
 * (Netlify uses Netlify Forms instead; see lib/submit-inquiry.ts.)
 *
 * Flow: validate (shared zod schema) → honeypot → Turnstile (only if TURNSTILE_SECRET_KEY is set)
 *       → email via Resend (only if RESEND_API_KEY + addresses are set; otherwise the inquiry is logged and accepted).
 * Uses relative imports only so serverless bundlers resolve it without path aliases.
 */
import { inquirySchema, typeLabel, type Inquiry } from "./inquiry-schema";
import catalog from "../products.json";

export interface InquiryEnv {
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  SEND_CUSTOMER_CONFIRMATION?: string; // "1" (default) or "0"
  INQUIRY_DRY_RUN?: string; // "1" logs instead of sending
}

// Only public fields are read from the catalog: slug → English title.
const TITLES = new Map<string, string>(
  (catalog as { products: { slug: string; english_title: string }[] }).products.map((p) => [p.slug, p.english_title]),
);

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Strip CR/LF so user input can't inject headers into the subject line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

function rows(q: Inquiry): [string, string][] {
  return (
    [
      ["Type", typeLabel(q.type)],
      ["Name", q.name],
      ["Email", q.email],
      ["Company / store", q.company],
      ["Products", q.products.map((s) => TITLES.get(s) ?? s).join("\n")],
      ["Quantity", q.quantity],
      ["Country", q.country],
      ["State / region", q.region],
      ["Message", q.message],
    ] as [string, string][]
  ).filter((r) => !!r[1]);
}

function ownerEmail(q: Inquiry) {
  const r = rows(q);
  const text = r.map(([k, v]) => `${k}:\n${v}`).join("\n\n");
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#0B1020">
<h2 style="margin:0 0 12px">New inquiry: ${esc(typeLabel(q.type))}</h2>
<table cellpadding="8" style="border-collapse:collapse;border:2px solid #0B1020">
${r.map(([k, v]) => `<tr><th align="left" valign="top" style="background:#F4F7FF;border:1px solid #ccd">${esc(k)}</th><td style="border:1px solid #ccd;white-space:pre-wrap">${esc(v)}</td></tr>`).join("\n")}
</table>
<p style="color:#555;font-size:12px">Reply to this email to answer ${esc(q.name)} directly.</p>
</body></html>`;
  const label = q.type === "wholesale" ? "Wholesale" : typeLabel(q.type);
  const subject = oneLine(`[${label}] ${q.name}${q.company ? ` – ${q.company}` : ""}`).slice(0, 180);
  return { subject, text, html };
}

function customerEmail(q: Inquiry) {
  const titles = q.products.map((s) => TITLES.get(s) ?? s);
  const text = `Hi ${q.name},

Thanks for getting in touch. We've received your message (${typeLabel(q.type)}) and will reply soon.
${titles.length ? `\nFigures you mentioned:\n${titles.map((t) => `- ${t}`).join("\n")}\n` : ""}
Your message:
${q.message}

(This is an automatic confirmation. Just reply if you want to add anything.)`;
  return { subject: "We got your message", text };
}

async function sendResend(env: InquiryEnv, payload: Record<string, unknown>) {
  if (env.INQUIRY_DRY_RUN === "1") {
    console.log("[inquiry] DRY RUN, would send:", JSON.stringify(payload, null, 2));
    return true;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // Details stay in server logs only; never returned to the browser.
    console.error("[inquiry] Resend error", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

export async function handleInquiry(request: Request, env: InquiryEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { allow: "POST", "content-type": "application/json" },
    });
  }
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return json({ ok: false, error: "Unsupported request." }, 415);
  if (Number(request.headers.get("content-length") ?? 0) > 32_000) return json({ ok: false, error: "Message too large." }, 413);

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0]);
      if (!fields[k]) fields[k] = i.message;
    }
    return json({ ok: false, error: "Please check the highlighted fields.", fields }, 422);
  }
  const q = parsed.data;

  // Honeypot: pretend success so bots learn nothing, but send nothing.
  if (q.website) return json({ ok: true });

  // Turnstile is enforced only when a secret is configured.
  if (env.TURNSTILE_SECRET_KEY) {
    const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    if (!q.turnstileToken || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, q.turnstileToken, ip))) {
      return json({ ok: false, error: "The spam check failed. Please try again." }, 403);
    }
  }

  q.products = q.products.filter((s) => TITLES.has(s));
  const owner = ownerEmail(q);

  const emailReady = env.INQUIRY_DRY_RUN === "1" || (env.RESEND_API_KEY && env.INQUIRY_TO_EMAIL && env.INQUIRY_FROM_EMAIL);
  if (!emailReady) {
    // Email isn't set up yet: accept the inquiry and keep it in the function logs so nothing is lost silently.
    console.log(`[inquiry] Email not configured. Received inquiry:\nSubject: ${owner.subject}\n\n${owner.text}`);
    return json({ ok: true });
  }

  const sent = await sendResend(env, {
    from: env.INQUIRY_FROM_EMAIL,
    to: [env.INQUIRY_TO_EMAIL],
    reply_to: q.email,
    subject: owner.subject,
    text: owner.text,
    html: owner.html,
  });
  if (!sent) return json({ ok: false, error: "We couldn't send your message right now. Please try again shortly." }, 502);

  if (env.SEND_CUSTOMER_CONFIRMATION !== "0") {
    const c = customerEmail(q);
    await sendResend(env, { from: env.INQUIRY_FROM_EMAIL, to: [q.email], reply_to: env.INQUIRY_TO_EMAIL, subject: c.subject, text: c.text });
  }
  return json({ ok: true });
}

/** Checkout stub shared by both platforms. Swap in Stripe here later (see functions/api/checkout.ts notes). */
export async function handleCheckout(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);
  return json(
    {
      ok: false,
      comingSoon: true,
      message: "Online checkout is coming soon. Send us an order request and we'll sort out your order by email.",
    },
    501,
  );
}
