import { describe, expect, it } from 'vitest';
import { isShopifyCdn, shopifyImageUrl, shopifySrcSet } from './image';

describe('shopify image urls', () => {
  const src = 'https://cdn.shopify.com/s/files/1/0000/0001/files/romper.png?v=12';

  it('adds a width and format on the Shopify CDN', () => {
    const next = new URL(shopifyImageUrl(src, 480, 'webp'));
    expect(next.searchParams.get('width')).toBe('480');
    expect(next.searchParams.get('format')).toBe('webp');
    expect(next.searchParams.get('quality')).toBe('75');
    expect(next.searchParams.get('v')).toBe('12');
  });

  it('leaves local and other hosts alone', () => {
    expect(shopifyImageUrl('/hero-cube/romper.webp', 480, 'webp')).toBe('/hero-cube/romper.webp');
    expect(isShopifyCdn('https://bsbasil.com/og-image.png')).toBe(false);
  });

  it('builds a srcset of several widths', () => {
    const set = shopifySrcSet(src, [320, 640], 'jpg') ?? '';
    expect(set).toContain('320w');
    expect(set).toContain('640w');
    expect(set).toContain('format=jpg');
  });
});