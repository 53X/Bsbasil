import { describe, expect, it } from 'vitest';
import { descriptionParts } from './product-copy';

describe('descriptionParts', () => {
  it('splits emoji-separated Shopify copy into a lead and points', () => {
    const text =
      'Adorable and comfortable baby unisex romper set. 🎀 Cute bunny graphic with bow detail 🌿 Soft 100% cotton interlock fabric';
    expect(descriptionParts(text)).toEqual({
      lead: 'Adorable and comfortable baby unisex romper set.',
      points: ['Cute bunny graphic with bow detail', 'Soft 100% cotton interlock fabric'],
    });
  });

  it('keeps a short description as one paragraph', () => {
    expect(descriptionParts('A soft romper for everyday play.')).toEqual({
      lead: 'A soft romper for everyday play.',
      points: [],
    });
  });
});