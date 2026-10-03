import { Link } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import PriceTag from '@/components/PriceTag';
import { productRequiresSizeSelection } from '@/lib/shopify/map';
import type { StoreProduct } from '@/lib/shopify/types';

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Bestseller: { bg: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' },
  New: { bg: 'hsl(var(--success))', text: '#fff' },
  'Gift Pick': { bg: 'hsl(var(--secondary))', text: 'hsl(var(--secondary-foreground))' },
};

export default function ProductCard({
  product,
}: {
  product: StoreProduct;
  /** Kept for catalog callers; sizes are chosen on the product page, not shown on cards. */
  ageHighlight?: string;
}) {
  const href = `/products/${product.handle}`;
  // Catalog never adds without a size — send shoppers to the product page to choose.
  const needsSize = productRequiresSizeSelection(product);

  return (
    <article
      className="group relative rounded-2xl overflow-hidden border flex flex-col h-full"
      style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <Link to={href} className="absolute inset-0 z-[1]" aria-label={product.name} />
      <div className="relative overflow-hidden aspect-square block pointer-events-none">
        {product.image ? (
          <img
            src={product.image}
            alt={product.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            width={400}
            height={400}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'hsl(var(--muted))' }} />
        )}
        {product.badge ? (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: BADGE_COLORS[product.badge]?.bg ?? 'hsl(var(--primary))',
              color: BADGE_COLORS[product.badge]?.text ?? '#fff',
            }}
          >
            {product.badge}
          </span>
        ) : null}
        {product.media.some((item) => item.kind !== 'image') ? (
          <span
            className="absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
          >
            Video
          </span>
        ) : null}
      </div>

      <div className="p-base flex flex-col flex-1 gap-xs pointer-events-none">
        <p className="text-xs font-semibold uppercase tracking-wide min-h-4" style={{ color: 'hsl(var(--brand-ink))' }}>
          {product.category || '\u00a0'}
        </p>
        <p className="text-base font-bold leading-snug line-clamp-2 min-h-[2.75rem]" style={{ color: 'hsl(var(--foreground))' }}>
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-auto pt-sm gap-2">
          <PriceTag
            price={product.price}
            compareAt={product.compareAtPrice}
            currency={product.currency}
            discount={product.discountTitle}
            priceClassName="text-lg font-bold whitespace-nowrap"
          />
          <div className="relative z-[2] flex items-center shrink-0 pointer-events-auto">
            <Link
              to={href}
              className="flex items-center gap-2 px-base py-xs rounded-full text-sm font-semibold whitespace-nowrap transition-transform hover:scale-105"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              <ShoppingBag size={14} />
              {!product.available ? 'Sold out' : needsSize ? 'Select size' : 'Add'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
