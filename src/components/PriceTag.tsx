import { formatPrice } from "@/lib/format";

export function PriceTag({
  priceCents,
  compareAtCents = 0,
  currency = "usd",
  size = "md",
}: {
  priceCents: number;
  compareAtCents?: number;
  currency?: string;
  size?: "md" | "lg";
}) {
  const hasDiscount = compareAtCents > priceCents;
  const pct = hasDiscount
    ? Math.round(((compareAtCents - priceCents) / compareAtCents) * 100)
    : 0;

  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-brand-600"}`}>
        {formatPrice(priceCents, currency)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-muted line-through text-sm">
            {formatPrice(compareAtCents, currency)}
          </span>
          <span className="rounded bg-green-100 text-green-700 px-1.5 py-0.5 text-xs font-semibold">
            {pct}% off
          </span>
        </>
      )}
    </span>
  );
}
