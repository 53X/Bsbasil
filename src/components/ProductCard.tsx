import { Link } from 'react-router';
import PriceTag from '@/components/PriceTag';
import StoreImage from '@/components/StoreImage';
import { ageLabel, discountBadge } from '@/lib/shopify/map';
import type { StoreProduct } from '@/lib/shopify/types';

const PANELS = ['#62A848'];

export default function ProductCard({
  product,
  index = 0,
  imageSizes = '(min-width: 1024px) 24rem, (min-width: 640px) 46vw, 92vw',
  imageWidth = 720,
}: {
  product: StoreProduct;
  /** Kept for catalog callers; sizes are chosen on the product page. */
  ageHighlight?: string;
  index?: number;
  imageSizes?: string;
  imageWidth?: number;
}) {
  const href = `/products/${product.handle}`;
  const sizes = product.ageRanges;
  const sale = discountBadge(product.price, product.compareAtPrice, product.discountTitle);

  return (
    <article
      className="group flex h-full flex-col"
      style={{ ['--tilt' as string]: index % 2 === 0 ? '0deg' : '0deg' }}
    >
      <Link to={href} className="relative block aspect-[3/4] overflow-hidden bg-background">
        <span className="absolute inset-x-0 top-0 h-2" style={{ background: PANELS[index % PANELS.length] }} />
        {product.image ? (
          <StoreImage
            src={product.image}
            alt={product.alt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            width={imageWidth}
            height={Math.round(imageWidth * 4 / 3)}
            sizes={imageSizes}
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        {product.badge ? (
          <span className="absolute left-3 top-5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
            {product.badge}
          </span>
        ) : null}
        {sale ? (
          <span className="absolute right-3 top-5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
            {sale}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--brand-ink))' }}>
          {product.category || 'Bsbasil'}
        </p>
        <Link to={href} className="font-sans text-base font-semibold leading-snug [overflow-wrap:anywhere] sm:text-lg">
          {product.name}
        </Link>
        <PriceTag
          price={product.price}
          compareAt={product.compareAtPrice}
          currency={product.currency}
          discount={product.discountTitle}
          priceClassName="text-base font-semibold"
        />
        {sizes.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1.5" aria-label="Sizes">
            {sizes.map((code) => (
              <span
                key={code}
                className="inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
              >
                {ageLabel(code)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
