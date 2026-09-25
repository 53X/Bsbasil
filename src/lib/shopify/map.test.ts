import { describe, expect, it } from 'vitest';
import { applyCartDiscounts, htmlToText, mapProduct, mapShopRules, matchingVariant, toMinorUnits } from './map';

describe('shopify product mapping', () => {
  it('keeps photos and video on the same product', () => {
    const product = mapProduct({
      id: 'gid://shopify/Product/1',
      handle: 'sunshine-romper',
      title: 'Sunshine Romper',
      description: 'Soft cotton romper.',
      productType: 'Rompers',
      tags: ['featured', '0-6M', 'Bestseller'],
      availableForSale: true,
      options: [{ name: 'Size', values: ['0-6M', '6-12M'] }],
      media: {
        nodes: [
          { image: { url: 'https://cdn.example/photo.jpg', altText: 'Front' } },
          { sources: [{ url: 'https://cdn.example/clip.mp4', mimeType: 'video/mp4' }], previewImage: { url: 'https://cdn.example/poster.jpg' }, alt: 'Clip' },
        ],
      },
      variants: {
        nodes: [
          {
            id: 'gid://shopify/ProductVariant/1',
            title: '0-6M',
            availableForSale: true,
            quantityAvailable: 4,
            price: { amount: '799.00', currencyCode: 'INR' },
            compareAtPrice: { amount: '999.00', currencyCode: 'INR' },
            selectedOptions: [{ name: 'Size', value: '0-6M' }],
          },
          {
            id: 'gid://shopify/ProductVariant/2',
            title: '6-12M',
            availableForSale: false,
            price: { amount: '799.00', currencyCode: 'INR' },
            selectedOptions: [{ name: 'Size', value: '6-12M' }],
          },
        ],
      },
    });

    expect(product.priceLabel).toBe('₹799');
    expect(product.compareAtPrice).toBe(99900);
    const discounted = applyCartDiscounts([product], [{
      variantId: 'gid://shopify/ProductVariant/1',
      quantity: 1,
      totalAmount: '699.00',
      subtotalAmount: '799.00',
      title: 'Festive offer',
    }]);
    expect(discounted[0]?.price).toBe(69900);
    expect(discounted[0]?.compareAtPrice).toBe(99900);
    expect(discounted[0]?.discountTitle).toBe('Festive offer');
    expect(product.ageRange).toBe('0-6M');
    expect(product.featured).toBe(true);
    expect(product.media.map((item) => item.kind)).toEqual(['image', 'video']);
    expect(toMinorUnits('799.00')).toBe(79900);
    expect(matchingVariant(product, { Size: '6-12M' })?.available).toBe(false);
    expect(htmlToText('<p>Returns in 7 days.</p>')).toBe('Returns in 7 days.');
    expect(mapShopRules({
      deliveryFee: { value: ' ₹100 ' },
      returnRule: { value: 'Products can be exchanged within 7 days.' },
      pricesIncludeGst: { value: 'All prices include GST.' },
      cashOnDelivery: { value: '' },
    })).toEqual({
      deliveryFee: '₹100',
      returnPolicy: 'Products can be exchanged within 7 days.',
      pricesIncludeGst: 'All prices include GST.',
      cashOnDelivery: null,
    });
  });
});
