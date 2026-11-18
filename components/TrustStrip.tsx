import { trustItems } from "@/config/store";
import { Reveal } from "./Reveal";

const icons = [
  // plane
  "M2 12l20-8-6 18-4-7-10-3zm10 3l4-7",
  // box
  "M3 7l9-4 9 4v10l-9 4-9-4V7zm0 0l9 4 9-4M12 11v10",
  // receipt
  "M6 2h12v20l-3-2-3 2-3-2-3 2V2zm3 6h6M9 12h6",
  // tag
  "M3 12V3h9l9 9-9 9-9-9zm5-4h.01",
];

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <Reveal
      as="ul"
      className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}
      aria-label="Why shop with us"
    >
      {trustItems.map((t, i) => (
        <li
          key={t.title}
          data-reveal
          style={{ ["--i" as string]: i }}
          className="flex items-start gap-3 rounded-xl border-2 border-ink bg-white p-3 sm:p-4"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-lime" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
              <path d={icons[i % icons.length]} />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight sm:text-base">{t.title}</span>
            {!compact && <span className="mt-0.5 block text-xs text-ink-soft sm:text-sm">{t.body}</span>}
          </span>
        </li>
      ))}
    </Reveal>
  );
}
