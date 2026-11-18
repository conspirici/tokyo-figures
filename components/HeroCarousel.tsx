"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type TouchEvent } from "react";
import { durations } from "@/lib/motion";
import { Sticker, type StickerKind } from "./Sticker";

export interface HeroSlide {
  slug: string;
  image: string; // "/hero/slide-1" → -1200/-1774 .webp/.avif
  focal: { x: number; y: number };
  alt: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  sparkles: [number, number][];
  placeholder?: string;
  fallbackImage?: string; // product photo base path, used if the slide image fails
}

const SPARKLE = "M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z";
const CONFETTI: { x: number; y: number; c: string; s: number; dx: number; dy: number }[] = [
  { x: 52, y: 14, c: "#D7FF3A", s: 10, dx: 12, dy: -18 },
  { x: 64, y: 86, c: "#FF5FA2", s: 8, dx: -10, dy: -24 },
  { x: 84, y: 10, c: "#FF5FA2", s: 7, dx: 8, dy: 20 },
  { x: 95, y: 40, c: "#D7FF3A", s: 9, dx: -14, dy: 16 },
  { x: 58, y: 58, c: "#FF5FA2", s: 6, dx: 10, dy: -14 },
  { x: 97, y: 88, c: "#D7FF3A", s: 8, dx: -8, dy: -20 },
];

function badgeKind(b: string): StickerKind {
  const k = b.toLowerCase();
  return k === "outlet" ? "outlet" : k === "limited" ? "limited" : "new";
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return reduced;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [activations, setActivations] = useState(0); // >0 once the slide has changed, enables entrance animations
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [loadRest, setLoadRest] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [announce, setAnnounce] = useState("");
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);

  const paused = userPaused || hovering || focused || touching || tabHidden || reduced;

  // Slides 2+ load after first paint (slide 1 is the LCP image).
  useEffect(() => {
    const go = () => setLoadRest(true);
    if (document.readyState === "complete") {
      const t = setTimeout(go, 300);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const goTo = useCallback(
    (i: number, manual: boolean) => {
      const next = (i + n) % n;
      setIndex(next);
      setActivations((a) => a + 1);
      if (manual) setAnnounce(`Slide ${next + 1} of ${n}: ${slides[next].headline}`);
    },
    [n, slides],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1, true);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    setTouching(true);
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    setTouching(false);
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), true);
  };


  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Featured figures"
      className="relative overflow-hidden border-b-2 border-ink bg-electric text-white"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="grid">
        {slides.map((s, i) => {
          const active = i === index;
          const animate = active && activations > 0;
          const showImage = i === 0 || loadRest;
          const words = s.headline.split(" ");
          return (
            <div
              key={s.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              aria-hidden={!active}
              inert={!active}
              className={`relative col-start-1 row-start-1 flex flex-col transition-opacity md:block md:h-[min(50vw,80vh)] md:min-h-[480px] md:w-full ${active ? "z-10 opacity-100 duration-500" : "pointer-events-none z-0 opacity-0 duration-200"}`}
            >
              {/* Image box: natural 2:1 on mobile, full-bleed cover on md+ */}
              <div
                className="relative aspect-[2/1] w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto"
                style={s.placeholder ? { backgroundImage: `url(${s.placeholder})`, backgroundSize: "cover" } : undefined}
              >
                {failed[i] || !showImage ? (
                  <div className="grid-paper-blue absolute inset-0">
                    {failed[i] && s.fallbackImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${s.fallbackImage}-960.webp`}
                        alt={s.alt}
                        className="absolute right-[6%] top-[8%] h-[84%] w-auto rounded-xl border-2 border-ink bg-white object-contain p-2"
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className="absolute inset-0"
                  >
                    <picture key={animate ? `a${activations}` : "static"} className="block h-full w-full">
                      <source type="image/avif" srcSet={`${s.image}-1200.avif 1200w, ${s.image}-1774.avif 1774w`} sizes="100vw" />
                      <source type="image/webp" srcSet={`${s.image}-1200.webp 1200w, ${s.image}-1774.webp 1774w`} sizes="100vw" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${s.image}-1200.webp`}
                        alt={s.alt}
                        width={1774}
                        height={887}
                        fetchPriority={i === 0 ? "high" : "low"}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding={i === 0 ? "sync" : "async"}
                        onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                        className={`h-full w-full object-cover ${animate ? "hero-kenburns" : ""}`}
                        style={{ objectPosition: `${s.focal.x}% ${s.focal.y}%` }}
                      />
                    </picture>
                  </div>
                )}

                {/* Decorative overlay: sparkles + drifting confetti (hidden for reduced motion) */}
                {active && (
                  <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    {s.sparkles.map(([x, y], k) => (
                      <svg key={k} x={`${x}%`} y={`${y}%`} width="26" height="26" overflow="visible">
                        <path
                          d={SPARKLE}
                          className="sparkle"
                          fill={k % 2 ? "#D7FF3A" : "#FFFFFF"}
                          stroke="#0B1020"
                          strokeWidth="1.2"
                          style={{ ["--d" as string]: `${k * 0.45}s` } as CSSProperties}
                        />
                      </svg>
                    ))}
                    {CONFETTI.map((c, k) => (
                      <circle
                        key={`c${k}`}
                        cx={`${c.x}%`}
                        cy={`${c.y}%`}
                        r={c.s / 2}
                        fill={c.c}
                        className="confetti"
                        style={{ ["--d" as string]: `${k * 0.7}s`, ["--dx" as string]: `${c.dx}px`, ["--dy" as string]: `${c.dy}px` } as CSSProperties}
                      />
                    ))}
                  </svg>
                )}

                {/* Sticker badge: stamps in over the top-left of the figure area */}
                <div className="absolute z-10" style={{ left: `${Math.max(s.focal.x - 22, 44)}%`, top: "12%" }}>
                  <span key={animate ? `b${activations}` : "static"} className={`inline-block ${animate ? "hero-stamp" : ""}`}>
                    <Sticker kind={badgeKind(s.badge)} label={s.badge} size="lg" rot={-6} wiggle={false} />
                  </span>
                </div>
              </div>

              {/* Text block: below the image on mobile, over the empty left ~40% on md+ */}
              <div
                key={animate ? `t${activations}` : "static"}
                className="grid-paper-blue relative z-10 px-5 pb-24 pt-6 md:absolute md:inset-y-0 md:left-0 md:flex md:w-[42%] md:flex-col md:justify-center md:bg-none md:bg-transparent md:px-10 md:pb-16 lg:pl-16"
              >
                <p className={`mb-3 font-display text-xs tracking-[0.25em] text-lime ${animate ? "hero-follow" : ""}`} style={{ ["--d" as string]: "60ms" } as CSSProperties}>
                  NO. {String(i + 1).padStart(2, "0")} / FEATURED
                </p>
                {i === 0 ? (
                  <h1 className="font-display text-4xl text-white sm:text-5xl lg:text-7xl">
                    {words.map((w, k) => (
                      <span key={k} className={animate ? "hero-word" : "inline-block"} style={{ ["--w" as string]: k } as CSSProperties}>
                        {w}&nbsp;
                      </span>
                    ))}
                  </h1>
                ) : (
                  <h2 className="font-display text-4xl text-white sm:text-5xl lg:text-7xl">
                    {words.map((w, k) => (
                      <span key={k} className={animate ? "hero-word" : "inline-block"} style={{ ["--w" as string]: k } as CSSProperties}>
                        {w}&nbsp;
                      </span>
                    ))}
                  </h2>
                )}
                <p className={`mt-3 text-lg font-semibold text-lime md:text-xl ${animate ? "hero-follow" : ""}`} style={{ ["--d" as string]: "380ms" } as CSSProperties}>
                  {s.subline}
                </p>
                <div className={`mt-6 ${animate ? "hero-cta" : ""}`}>
                  <Link
                    href={s.ctaHref}
                    tabIndex={active ? 0 : -1}
                    className="btn-press inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lime px-6 py-3 font-display text-lg text-ink shadow-hard"
                  >
                    {s.ctaLabel}
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 md:left-10 lg:left-16">
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused || reduced ? "Play slideshow" : "Pause slideshow"}
          aria-pressed={userPaused}
          disabled={reduced}
          className="btn-press grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink shadow-hard-sm disabled:opacity-60"
        >
          {userPaused || reduced ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M7 4l13 8-13 8z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
          )}
        </button>
        <button type="button" onClick={() => goTo(index - 1, true)} aria-label="Previous slide" className="btn-press grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink shadow-hard-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
          {slides.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => goTo(i, true)}
              aria-label={`Go to slide ${i + 1}: ${s.headline}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative h-3 overflow-hidden rounded-full border-2 border-ink bg-white transition-all ${i === index ? "w-10" : "w-3"}`}
            >
              {i === index && !reduced && (
                <span
                  key={`${index}-${activations}`}
                  className="progress-fill absolute inset-0 bg-lime"
                  style={{ animationDuration: `${durations.heroAutoplay}ms`, animationPlayState: paused ? "paused" : "running" }}
                  onAnimationEnd={() => goTo(index + 1, false)}
                />
              )}
              {i === index && reduced && <span className="absolute inset-0 bg-lime" />}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => goTo(index + 1, true)} aria-label="Next slide" className="btn-press grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink shadow-hard-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </div>
    </section>
  );
}
