const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** $1,234 */
export const formatPrice = (n: number) => usd.format(n);
export const pad2 = (n: number) => String(n).padStart(2, "0");
