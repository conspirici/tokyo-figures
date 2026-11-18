import type { ReactNode } from "react";
import { SectionTitle } from "./SectionTitle";

/** Calm, readable layout for info pages. */
export function InfoPage({ tag, title, intro, children }: { tag: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionTitle as="h1" tag={tag}>
        {title}
      </SectionTitle>
      {intro && <p className="mb-8 text-lg text-ink-soft">{intro}</p>}
      <div className="space-y-6 leading-relaxed [&_a]:font-semibold [&_a]:text-electric [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
