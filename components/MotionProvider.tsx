"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { spring } from "@/lib/motion";

const loadFeatures = () => import("./motion-features").then((m) => m.default);

/** Motion is code-split: the feature bundle loads after first paint. `reducedMotion="user"` honors the OS setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={spring}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
