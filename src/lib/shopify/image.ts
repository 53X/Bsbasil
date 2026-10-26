const SHOPIFY_HOST = /(^|\.)((cdn\.)?shopify\.com|shopifycdn\.com)$/i;

export function isShopifyCdn(src: string): boolean {
  try {
    return SHOPIFY_HOST.test(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** Ask Shopify's CDN for one size and format. Other hosts are left untouched. */
export function shopifyImageUrl(src: string, width: number, format?: 'webp' | 'jpg'): string {
  if (!isShopifyCdn(src)) return src;
  const url = new URL(src);
  url.searchParams.set('width', String(Math.round(width)));
  if (format) url.searchParams.set('format', format);
  url.searchParams.set('quality', '75');
  return url.toString();
}

export function shopifySrcSet(src: string, widths: number[], format?: 'webp' | 'jpg'): string | undefined {
  if (!isShopifyCdn(src)) return undefined;
  return widths.map((width) => `${shopifyImageUrl(src, width, format)} ${width}w`).join(', ');
}
