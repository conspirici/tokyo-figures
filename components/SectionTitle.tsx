import type { ReactNode } from "react";

/** Poster-style section heading: small tag label + heavy title with a marker underline that draws in. */
export function SectionTitle({
  tag,
  children,
  as: Tag = "h2",
  action,
  className = "",
}: {
  tag?: string;
  children: ReactNode;
  as?: "h1" | "h2";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        {tag && (
          <span className="mb-2 inline-block rounded-md bg-ink px-2 py-0.5 font-display text-xs tracking-widest text-lime">
            {tag}
          </span>
        )}
        <Tag className={`font-display ${Tag === "h1" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl"}`}>
          <span className="marker">{children}</span>
        </Tag>
      </div>
      {action}
    </div>
  );
}
