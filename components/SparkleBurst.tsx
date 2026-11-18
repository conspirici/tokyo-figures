"use client";

import { m } from "motion/react";
import { durations } from "@/lib/motion";

const RAYS = 8;

/** Small celebratory burst. Re-mount with a new `key` to replay. Reduced motion: MotionConfig turns it into a fade. */
export function SparkleBurst({ color = "#D7FF3A" }: { color?: string }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: RAYS }).map((_, i) => {
        const a = (i / RAYS) * Math.PI * 2;
        return (
          <m.span
            key={i}
            className="absolute h-2 w-2 rounded-full border border-ink"
            style={{ background: i % 2 ? color : "#FF5FA2" }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(a) * 34, y: Math.sin(a) * 34, scale: 1, opacity: 0 }}
            transition={{ duration: durations.sparkleBurst, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}
