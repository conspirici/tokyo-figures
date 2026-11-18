"use client";

import { useState } from "react";

/** UI only (spec §3): no newsletter provider is connected yet. */
export function NewsletterSignup() {
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <label className="flex-1">
        <span className="sr-only">Email address</span>
        <input
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="field-focus w-full rounded-full border-2 border-ink bg-white px-5 py-3.5 text-ink"
        />
      </label>
      <button type="submit" className="btn-press rounded-full border-2 border-ink bg-lime px-6 py-3.5 font-display text-lg text-ink shadow-hard">
        Keep me posted
      </button>
      <p className="sr-only" aria-live="polite">{sent ? "Newsletter isn't live yet." : ""}</p>
      {sent && (
        <p className="basis-full text-sm font-semibold text-white sm:order-last">
          Our newsletter isn&apos;t live yet. For now, use &ldquo;Notify me&rdquo; on any figure and we&apos;ll email you about that one.
        </p>
      )}
    </form>
  );
}
