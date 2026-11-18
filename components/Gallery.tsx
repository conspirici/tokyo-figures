"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ProductImage } from "./ProductImage";
import { spring } from "@/lib/motion";

/** Main image + thumbnails (crossfade) + click-to-zoom lightbox that springs open from the image. */
export function Gallery({ images, alt, no }: { images: string[]; alt: string; no: number }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[i];

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setI((x) => (x + 1) % images.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom, images.length]);

  return (
    <div>
      <button
        type="button"
        onClick={() => current && setZoom(true)}
        disabled={!current}
        aria-label={current ? "Zoom image" : undefined}
        className="group relative block aspect-square w-full overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-hard enabled:cursor-zoom-in"
      >
        <m.div layoutId={`gallery-${no}`} className="absolute inset-0 p-4 sm:p-8">
          <AnimatePresence initial={false} mode="popLayout">
            <m.div
              key={current ?? "none"}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full"
            >
              <ProductImage base={current} alt={alt} no={no} priority sizes="(min-width: 1024px) 50vw, 100vw" />
            </m.div>
          </AnimatePresence>
        </m.div>
        {current && (
          <span className="absolute bottom-3 right-3 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold opacity-90 group-hover:bg-lime">
            Click to zoom
          </span>
        )}
      </button>

      {images.length > 1 && (
        <ul className="mt-4 flex gap-3" aria-label="More photos">
          {images.map((img, k) => (
            <li key={img}>
              <button
                type="button"
                onClick={() => setI(k)}
                aria-label={`Show photo ${k + 1}`}
                aria-current={k === i ? "true" : undefined}
                className={`btn-press h-20 w-20 overflow-hidden rounded-xl border-2 bg-white p-1 ${k === i ? "border-electric shadow-hard-sm" : "border-ink/30"}`}
              >
                <ProductImage base={img} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {zoom && current && (
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${alt}, enlarged`}
          >
            <m.div
              layoutId={`gallery-${no}`}
              transition={spring}
              className="relative h-[min(90vh,90vw)] w-[min(90vh,90vw)] rounded-2xl border-2 border-ink bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${current}.jpg`} alt={alt} className="h-full w-full object-contain" />
              <button
                type="button"
                autoFocus
                onClick={() => setZoom(false)}
                className="btn-press absolute -right-3 -top-3 grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-lime shadow-hard-sm"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
