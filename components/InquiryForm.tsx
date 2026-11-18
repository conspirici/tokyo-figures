"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { m } from "motion/react";
import { INQUIRY_TYPES, MESSAGE_MAX, inquirySchema, type InquiryType } from "@/lib/inquiry-schema";
import type { ProductSummary } from "@/lib/types";
import { SparkleBurst } from "./SparkleBurst";
import { policies } from "@/config/store";
import { FORM_BACKEND, submitInquiry } from "@/lib/submit-inquiry";
import { ORDER_DRAFT_KEY } from "@/lib/checkout";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Errors = Partial<Record<string, string>>;
type Status = "idle" | "sending" | "success" | "error";

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
  return new Promise((resolve, reject) => {
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => reject(new Error("turnstile")), { once: true });
    if (!existing) {
      s.src = TURNSTILE_SRC;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  });
}

function Field({ id, label, error, required, hint, children }: { id: string; label: string; error?: string; required?: boolean; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className={error ? "shake" : undefined} key={error}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
        {label} {required ? <span aria-hidden className="text-[#b0185a]">*</span> : <span className="font-normal text-ink-soft">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-[#b0185a]">
          {error}
        </p>
      )}
    </div>
  );
}

const input = "field-focus w-full rounded-xl border-2 border-ink bg-white px-3.5 py-2.5 text-[15px]";

export function InquiryForm({
  products,
  defaultType = "product",
  defaultProducts = [],
  heading,
  readUrl = true,
}: {
  products: ProductSummary[];
  defaultType?: InquiryType;
  defaultProducts?: string[];
  heading?: string;
  /** Prefill from ?product=<slug>&type=<type> */
  readUrl?: boolean;
}) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [type, setType] = useState<InquiryType>(defaultType);
  const [selected, setSelected] = useState<string[]>(defaultProducts);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [token, setToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const tsId = useRef<string | null>(null);

  // Prefill from URL
  useEffect(() => {
    if (!readUrl) return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("type");
    if (t && INQUIRY_TYPES.some((x) => x.value === t)) setType(t as InquiryType);
    const ps = (sp.get("product") ?? "").split(",").filter((s) => products.some((p) => p.slug === s));
    if (ps.length) setSelected((cur) => [...new Set([...cur, ...ps])]);
    // Order draft handed over from the cart (see components/CartView.tsx)
    if (sp.get("order") === "1") {
      try {
        const draft = sessionStorage.getItem(ORDER_DRAFT_KEY);
        if (draft) setMessage((m) => m || draft);
      } catch {
        /* storage unavailable: products are still preselected from the URL */
      }
    }
  }, [readUrl, products]);

  // Product pages can preset the form (e.g. the Notify me button)
  useEffect(() => {
    const onPreset = (e: Event) => {
      const d = (e as CustomEvent<{ type?: InquiryType; product?: string }>).detail ?? {};
      if (d.type) setType(d.type);
      if (d.product) setSelected((cur) => (cur.includes(d.product!) ? cur : [...cur, d.product!]));
    };
    window.addEventListener("inquiry:preset", onPreset);
    return () => window.removeEventListener("inquiry:preset", onPreset);
  }, []);

  // Load Turnstile only when the form scrolls near the viewport
  useEffect(() => {
    if (!SITE_KEY || !tsRef.current) return;
    const el = tsRef.current;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        loadTurnstile()
          .then(() => {
            if (cancelled || !window.turnstile || tsId.current) return;
            tsId.current = window.turnstile.render(el, {
              sitekey: SITE_KEY,
              callback: (t: string) => setToken(t),
              "expired-callback": () => setToken(""),
              "error-callback": () => setToken(""),
            });
          })
          .catch(() => setServerError("The spam check couldn't load. Please disable blockers for this page or email us directly."));
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [status]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      type,
      products: selected,
      quantity: String(fd.get("quantity") ?? ""),
      country: String(fd.get("country") ?? ""),
      region: String(fd.get("region") ?? ""),
      message,
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
      turnstileToken: token,
    };
    const parsed = inquirySchema.safeParse(data);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (SITE_KEY && !token) {
      setErrors({});
      setServerError("Please complete the quick spam check above the button.");
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const result = await submitInquiry(parsed.data, new Map(products.map((p) => [p.slug, p.title])));
      if (result.ok) {
        setStatus("success");
        return;
      }
      if (result.fields) setErrors(result.fields);
      setServerError(result.error ?? "Something went wrong. Please try again in a minute.");
      setStatus("error");
    } finally {
      if (tsId.current && window.turnstile) {
        window.turnstile.reset(tsId.current);
        setToken("");
      }
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="relative rounded-2xl border-2 border-ink bg-lime p-8 text-center shadow-hard">
        <m.span initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: -6 }} className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-white">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M4 12l5 5L20 6" /></svg>
          <SparkleBurst color="#1F4FFF" />
        </m.span>
        <p className="font-display text-3xl">Got it, thanks!</p>
        <p className="mx-auto mt-2 max-w-md">
          Your message is on its way to us. We reply within {policies.replyWindow}.{FORM_BACKEND === "api" && " A confirmation is on its way to your inbox."}
        </p>
        <button type="button" onClick={() => { setStatus("idle"); setMessage(""); }} className="mt-5 font-semibold underline underline-offset-2">
          Send another message
        </button>
      </div>
    );
  }

  const describe = (k: string) => (errors[k] ? `${id(k)}-error` : undefined);
  const isWholesale = type === "wholesale";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-5 rounded-2xl border-2 border-ink bg-white p-5 shadow-hard sm:p-7" aria-describedby={id("status")}>
      {heading && <p className="font-display text-2xl">{heading}</p>}

      <Field id={id("type")} label="What's this about?" required error={errors.type}>
        <select id={id("type")} name="type" value={type} onChange={(e) => setType(e.target.value as InquiryType)} className={input} aria-invalid={!!errors.type} aria-describedby={describe("type")}>
          {INQUIRY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>

      {isWholesale && (
        <Field id={id("company")} label="Company / store name" error={errors.company}>
          <input id={id("company")} name="company" autoComplete="organization" className={input} maxLength={160} />
        </Field>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("name")} label="Name" required error={errors.name}>
          <input id={id("name")} name="name" autoComplete="name" required className={input} maxLength={120} aria-invalid={!!errors.name} aria-describedby={describe("name")} />
        </Field>
        <Field id={id("email")} label="Email" required error={errors.email}>
          <input id={id("email")} name="email" type="email" autoComplete="email" required className={input} maxLength={200} aria-invalid={!!errors.email} aria-describedby={describe("email")} />
        </Field>
      </div>

      {!isWholesale && (
        <Field id={id("company")} label="Company / store name" error={errors.company}>
          <input id={id("company")} name="company" autoComplete="organization" className={input} maxLength={160} />
        </Field>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm font-bold">
          Products of interest <span className="font-normal text-ink-soft">(optional, pick any)</span>
        </legend>
        <div className="max-h-52 overflow-y-auto rounded-xl border-2 border-ink bg-paper p-2">
          {products.map((p) => {
            const on = selected.includes(p.slug);
            return (
              <label key={p.slug} className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm ${on ? "bg-white font-semibold" : ""}`}>
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#1F4FFF]"
                  checked={on}
                  onChange={() => setSelected((cur) => (on ? cur.filter((s) => s !== p.slug) : [...cur, p.slug]))}
                />
                {p.title}
              </label>
            );
          })}
        </div>
      </fieldset>

      {isWholesale && (
        <Field id={id("quantity")} label="Quantity" error={errors.quantity} hint="Roughly how many units, per product or in total.">
          <input id={id("quantity")} name="quantity" className={input} maxLength={60} inputMode="text" />
        </Field>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("country")} label="Country" error={errors.country}>
          <input id={id("country")} name="country" autoComplete="country-name" defaultValue="United States" className={input} maxLength={80} />
        </Field>
        <Field id={id("region")} label="State / region" error={errors.region}>
          <input id={id("region")} name="region" autoComplete="address-level1" className={input} maxLength={80} />
        </Field>
      </div>

      <Field id={id("message")} label="Message" required error={errors.message} hint={`${message.length} / ${MESSAGE_MAX}`}>
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          required
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={input}
          aria-invalid={!!errors.message}
          aria-describedby={describe("message")}
        />
      </Field>

      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className={errors.consent ? "shake" : undefined} key={errors.consent}>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-[#1F4FFF]" aria-invalid={!!errors.consent} aria-describedby={describe("consent")} />
          <span>I agree to be contacted about this inquiry.</span>
        </label>
        {errors.consent && <p id={`${id("consent")}-error`} className="mt-1 text-sm font-semibold text-[#b0185a]">{errors.consent}</p>}
      </div>

      {SITE_KEY ? (
        <div ref={tsRef} className="min-h-[65px]" />
      ) : FORM_BACKEND === "netlify" || process.env.NODE_ENV === "production" ? null : (
        <p className="rounded-lg border-2 border-dashed border-pink p-2 text-xs">
          Dev note: set <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> to show the spam check.
        </p>
      )}

      <div id={id("status")} aria-live="polite" className="min-h-0">
        {serverError && <p className="shake rounded-lg border-2 border-ink bg-pink/20 px-3 py-2 text-sm font-semibold">{serverError}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-press inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-electric px-6 py-3.5 font-display text-lg text-white shadow-hard disabled:cursor-wait disabled:opacity-80"
      >
        {status === "sending" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
            Sending…
          </>
        ) : type === "notify" ? (
          "Notify me"
        ) : type === "order" ? (
          "Send order request"
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
