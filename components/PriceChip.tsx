import { formatPrice } from "@/lib/format";

export function PriceChip({ price, size = "md", className = "" }: { price: number | null; size?: "md" | "lg"; className?: string }) {
  const big = size === "lg";
  if (price == null) {
    return (
      <span
        className={`inline-flex items-center rounded-lg border-2 border-dashed border-ink bg-white font-bold text-ink ${big ? "px-4 py-2 text-lg" : "px-2.5 py-1 text-sm"} ${className}`}
      >
        Price coming soon
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-lg border-2 border-ink bg-lime font-display text-ink shadow-hard-sm ${big ? "px-4 py-2 text-3xl" : "px-2.5 py-1 text-lg"} ${className}`}
    >
      {formatPrice(price)}
    </span>
  );
}
