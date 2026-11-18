import type { PublicProduct } from "@/lib/types";

export type StickerKind = "new" | "outlet" | "limited" | "unavailable" | "soon" | "age";

const styles: Record<StickerKind, string> = {
  new: "bg-electric text-white",
  outlet: "bg-lime text-ink",
  limited: "bg-pink text-ink",
  unavailable: "bg-unavailable text-white",
  soon: "bg-white text-ink",
  age: "bg-ink text-white",
};

const labels: Record<StickerKind, string> = {
  new: "NEW",
  outlet: "OUTLET",
  limited: "LIMITED",
  unavailable: "UNAVAILABLE",
  soon: "SOON",
  age: "18+ COLLECTORS",
};

export function Sticker({
  kind,
  label,
  rot = -6,
  stamp = false,
  pulse = false,
  wiggle = false,
  size = "md",
  className = "",
}: {
  kind: StickerKind;
  label?: string;
  rot?: number;
  stamp?: boolean;
  pulse?: boolean;
  wiggle?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sz = size === "lg" ? "px-4 py-1.5 text-base" : size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  return (
    <span
      style={{ ["--rot" as string]: `${rot}deg` }}
      className={`sticker ${stamp ? "sticker-stamp" : ""} ${pulse ? "sticker-pulse" : ""} ${wiggle ? "sticker-wiggle" : ""} inline-block rounded-full border-2 border-ink font-display tracking-wide shadow-hard-sm ${sz} ${styles[kind]} ${className}`}
    >
      {label ?? labels[kind]}
    </span>
  );
}

/** Ordered badges for a product: condition first, then limited, then availability. */
export function productStickers(p: PublicProduct): StickerKind[] {
  const out: StickerKind[] = [p.condition === "outlet" ? "outlet" : "new"];
  if (p.limited) out.push("limited");
  if (!p.inStock) out.push("unavailable");
  return out;
}
