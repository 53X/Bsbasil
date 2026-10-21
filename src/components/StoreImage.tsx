import { shopifyImageUrl, shopifySrcSet, isShopifyCdn } from '@/lib/shopify/image';

const CARD_WIDTHS = [240, 360, 520, 720, 960, 1200];

/**
 * Product photos from Shopify are requested as WebP at the widths the layout uses.
 * A JPEG srcset stays behind that for browsers that do not decode WebP.
 */
export default function StoreImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) return null;
  const widths = CARD_WIDTHS.filter((value) => value <= Math.max(width * 2, 360));
  const chosen = widths.length > 0 ? widths : [width];
  const webp = shopifySrcSet(src, chosen, 'webp');
  const jpeg = shopifySrcSet(src, chosen, 'jpg');
  const fallback = isShopifyCdn(src) ? shopifyImageUrl(src, width, 'jpg') : src;

  return (
    <picture>
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      <img
        src={fallback}
        srcSet={jpeg}
        sizes={isShopifyCdn(src) ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        className={className}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
