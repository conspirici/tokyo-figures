"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";

type Props<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Adds `is-in` once the element scrolls into view. Children marked `data-reveal` rise in with a stagger (`--i`).
 * Without JS nothing is hidden (see `.js .reveal` in globals.css).
 */
export function Reveal<T extends ElementType = "div">({ as, children, className = "", ...rest }: Props<T>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
