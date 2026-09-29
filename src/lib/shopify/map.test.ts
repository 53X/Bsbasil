import { describe, expect, it } from 'vitest';
import { ageCode, ageLabel, ageRangeLabel, applyCartDiscounts, expandProductsByAge, htmlToText, mapProduct, mapShopRules, matchingVariant, productMatchesFilters, toMinorUnits } from './map';

describe('shopify product mapping', () => {
  it('keeps photos and video on the same product', () => {
    const product = mapProduct({
      id: 'gid://shopify/Product/1',
      handle: 'sunshine-romper',
      title: 'Sunshine Romper',
      description: 'Soft cotton romper.',
      productType: 'Rompers',
      tags: ['featured', '0-3M', 'Bestseller'],
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
    expect(product.ageRange).toBe('0-3M');
    expect(product.ageRanges).toEqual(['0-3M', '6-12M']);
    expect(product.category).toBe('Romper');
    expect(ageCode('0–3 Months')).toBe('0-3M');
    expect(ageCode('2–3 Years')).toBe('24-36M');
    expect(ageCode('24–30 Months')).toBe('24-30M');
    expect(ageCode('30–36 Months')).toBe('30-36M');
    expect(ageLabel('0-3M')).toBe('0–3 Months');
    expect(ageLabel('6-12M')).toBe('6–12 Months');
    expect(ageLabel('24-30M')).toBe('24–30 Months');
    expect(ageLabel('30-36M')).toBe('30–36 Months');
    expect(ageRangeLabel(['0-3M', '3-6M', '6-12M'])).toBe('0–3 – 6–12 Months');
    expect(ageRangeLabel(['12-18M'])).toBe('12–18 Months');
    expect(productMatchesFilters(product, 'All Ages', 'Romper')).toBe(true);
    expect(productMatchesFilters(product, 'All Ages', 'All Categories')).toBe(true);
    expect(productMatchesFilters(product, '0-3M', 'Romper')).toBe(true);
    expect(productMatchesFilters(product, '12-18M', 'Romper')).toBe(false);
    expect(productMatchesFilters(product, '0-3M', 'Sleepwear')).toBe(false);
    expect(productMatchesFilters(product, 'All Ages', 'Sleepwear')).toBe(false);
    expect(expandProductsByAge([product], 'All Ages')).toEqual([
      { product, ageCode: '0-3M' },
      { product, ageCode: '6-12M' },
    ]);
    expect(expandProductsByAge([product], '0-3M')).toEqual([{ product, ageCode: '0-3M' }]);
    expect(ageCode('0-6M')).toBeNull();
    expect(
      mapProduct({
        id: 'gid://shopify/Product/legacy',
        handle: 'legacy-toddler',
        title: 'Legacy Toddler Tee',
        productType: 'Sets',
        tags: ['24-36M'],
        availableForSale: true,
        options: [{ name: 'Size', values: ['24–36 Months'] }],
        variants: {
          nodes: [{
            id: 'gid://shopify/ProductVariant/legacy',
            title: '24–36 Months',
            availableForSale: true,
            price: { amount: '0.00', currencyCode: 'INR' },
            selectedOptions: [{ name: 'Size', value: '24–36 Months' }],
          }],
        },
      }).ageRanges,
    ).toEqual(['24-30M', '30-36M']);
    expect(
      mapProduct({
        id: 'gid://shopify/Product/size-meta',
        handle: 'size-from-category',
        title: 'Category Size Romper',
        productType: 'Rompers',
        tags: [],
        availableForSale: true,
        options: [],
        sizeMetafield: {
          references: {
            nodes: [
              { handle: '0-3-months', fields: [{ key: 'label', value: '0-3 months' }] },
              { handle: '24-30-months', fields: [{ key: 'label', value: '24-30 months' }] },
            ],
          },
        },
        variants: {
          nodes: [{
            id: 'gid://shopify/ProductVariant/size-meta',
            title: 'Default',
            availableForSale: true,
            price: { amount: '500.00', currencyCode: 'INR' },
            selectedOptions: [],
          }],
        },
      }).ageRanges,
    ).toEqual(['0-3M', '24-30M']);
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
