import { tickerPhrases } from "@/config/store";

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {tickerPhrases.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap px-5 font-display text-lg uppercase tracking-wide">
          {t}
          <svg viewBox="0 0 24 24" className="ml-10 h-4 w-4 text-electric" aria-hidden>
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
          </svg>
        </li>
      ))}
    </ul>
  );
}

/** Seamless marquee (two copies of the row, translated -50%). Pauses on hover; static with reduced motion. */
export function Ticker() {
  return (
    <div className="ticker overflow-hidden border-y-2 border-ink bg-lime py-2.5 text-ink">
      <div className="ticker-track flex w-max">
        <Row />
        <Row hidden />
        <Row hidden />
        <Row hidden />
      </div>
    </div>
  );
}
