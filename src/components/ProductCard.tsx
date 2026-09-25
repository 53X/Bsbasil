import { Link } from 'react-router';
import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import PriceTag from '@/components/PriceTag';
import ShareButtons from '@/components/ShareButtons';
import { useCart } from '@/contexts/use-cart';
import type { StoreProduct } from '@/lib/shopify/types';

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Bestseller: { bg: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' },
  New: { bg: 'hsl(var(--success))', text: '#fff' },
  'Gift Pick': { bg: 'hsl(var(--secondary))', text: 'hsl(var(--secondary-foreground))' },
};

export default function ProductCard({ product }: { product: StoreProduct }) {
  const { addVariant } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const purchasable = product.variants.filter((variant) => variant.available);
  const directVariant = purchasable.length === 1 ? purchasable[0] : null;
  const href = `/products/${product.handle}`;

  const onAdd = async () => {
    if (!directVariant) return;
    setAdding(true);
    setMessage(null);
    const result = await addVariant(directVariant.id, 1);
    setAdding(false);
    setMessage(result.success ? 'Added' : result.error ?? 'Could not add this item');
  };

  return (
    <article
      className="group relative rounded-2xl overflow-hidden border flex flex-col"
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
        {product.ageRange ? (
          <span
            className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
          >
            {product.ageRange}
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
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--primary))' }}>
          {product.category}
        </p>
        <p className="text-base font-bold leading-snug" style={{ color: 'hsl(var(--foreground))' }}>
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-auto pt-sm gap-2">
          <PriceTag
            price={product.price}
            compareAt={product.compareAtPrice}
            currency={product.currency}
            discount={product.discountTitle}
            priceClassName="text-lg font-bold"
          />
          <div className="relative z-[2] flex items-center gap-2 pointer-events-auto">
            <ShareButtons productName={product.name} productPrice={product.priceLabel} url={`https://bsbasil.com/products/${product.handle}`} />
            {directVariant ? (
              <button
                type="button"
                onClick={onAdd}
                disabled={adding || !product.available}
                className="flex items-center gap-2 px-base py-xs rounded-full text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-60"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <ShoppingBag size={14} />
                {adding ? 'Adding' : product.available ? 'Add' : 'Sold out'}
              </button>
            ) : (
              <Link
                to={href}
                className="flex items-center gap-2 px-base py-xs rounded-full text-sm font-semibold"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <ShoppingBag size={14} />
                {product.available ? 'Choose' : 'Sold out'}
              </Link>
            )}
          </div>
        </div>
        {message ? (
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{message}</p>
        ) : null}
      </div>
    </article>
  );
}
