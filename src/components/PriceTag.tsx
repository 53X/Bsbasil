import { formatMoney } from '@/lib/shopify/map';

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
  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      {onSale ? (
        <span className="text-sm font-medium line-through" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {formatMoney(compareAt / 100, currency)}
        </span>
      ) : null}
      <span className={priceClassName} style={{ color: 'hsl(var(--foreground))' }}>
        {formatMoney(price / 100, currency)}
      </span>
      {discount ? (
        <span className="text-xs font-semibold" style={{ color: 'hsl(var(--primary))' }}>{discount}</span>
      ) : null}
    </span>
  );
}
