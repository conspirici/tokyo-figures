import { pad2 } from "@/lib/format";

/**
 * Responsive product photo read from /public/images/{tf_id}/ (see scripts/fetch-images.mjs).
 * `base` is e.g. "/images/434/main"; variants are base-480.webp, base-960.webp and base.jpg.
 */
export function ProductImage({
  base,
  alt,
  no,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
  priority = false,
  className = "",
}: {
  base: string | undefined;
  alt: string;
  no?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!base) {
    return (
      <div
        role="img"
        aria-label={`${alt} (photo coming soon)`}
        className={`grid-paper-blue flex h-full w-full items-center justify-center ${className}`}
      >
        <span className="font-display text-5xl text-lime">{no != null ? pad2(no) : "TF"}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}.jpg`}
      srcSet={`${base}-480.webp 480w, ${base}-960.webp 960w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      width={960}
      height={960}
      className={`h-full w-full object-contain ${className}`}
    />
  );
}
