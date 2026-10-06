import { discountBadge, formatMoney } from '@/lib/shopify/map';

export default function PriceTag({
  price,
  compareAt,
  currency,
  discount,
  priceClassName = 'font-bold',
}: {
  price: number;
  compareAt?: number | null;
  currency: string;
  discount?: string | null;
  priceClassName?: string;
}) {
  const onSale = compareAt != null && compareAt > price;
  const label = discountBadge(price, compareAt, discount);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${onSale ? 'price-deal' : ''}`}>
      {onSale ? (
        <span className="price-was text-sm font-medium line-through" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {formatMoney(compareAt / 100, currency)}
        </span>
      ) : null}
      <span className={`${priceClassName} ${onSale ? 'price-now' : ''}`} style={{ color: 'hsl(var(--foreground))' }}>
        {formatMoney(price / 100, currency)}
      </span>
      {label ? (
        <span className="price-off text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'hsl(var(--brand-ink))' }}>{label}</span>
      ) : null}
    </span>
  );
}
