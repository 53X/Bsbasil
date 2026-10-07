import { describe, expect, it } from 'vitest';
import type { StoreMedia } from '@/lib/shopify/types';
import { colourForMedia, photosForColour } from './colour-photos';

function photo(alt: string, url = 'https://cdn.example/photo.jpg'): StoreMedia {
  return { kind: 'image', alt, url };
}

describe('colour photo matching', () => {
  it('matches alt text that names the colour, including longer labels first', () => {
    const dusty = ['Dusty Pink', 'Sage'];
    expect(colourForMedia(photo('Geliebt bear romper in dusty pink'), dusty)).toBe('Dusty Pink');
    expect(colourForMedia(photo('Geliebt bear romper in sage'), dusty)).toBe('Sage');

    const both = ['Dusty Pink', 'Pink'];
    expect(colourForMedia(photo('romper in dusty pink'), both)).toBe('Dusty Pink');
    expect(colourForMedia(photo('romper in pink'), both)).toBe('Pink');
    expect(colourForMedia(photo('romper in sky blue'), ['Sky Blue', 'Blue'])).toBe('Sky Blue');
    expect(colourForMedia(photo('romper in blue'), ['Sky Blue', 'Blue'])).toBe('Blue');
  });

  it('keeps every photo of one colourway and hides a two-colour shot', () => {
    const names = ['Sky Blue', 'Mauve'];
    const media = [
      photo('Bow tie suspender romper in sky blue', 'https://cdn.example/bow-blue.png'),
      photo('Bow tie suspender romper in mauve', 'https://cdn.example/bow-mauve.png'),
      photo('Bow tie suspender romper in sky blue and mauve', 'https://cdn.example/bow-both.png'),
    ];
    expect(photosForColour(media, names, 'Sky Blue').map((item) => item.url)).toEqual(['https://cdn.example/bow-blue.png']);
    expect(photosForColour(media, names, 'Mauve').map((item) => item.url)).toEqual(['https://cdn.example/bow-mauve.png']);
  });

  it('keeps front, back, and detail photos on the same colour', () => {
    const names = ['Aqua', 'Pink'];
    const media = [
      photo('Child in the aqua Shine Brightly little bear set', 'https://cdn.example/bear-aqua-front.png'),
      photo('Child in the aqua Shine Brightly little bear set', 'https://cdn.example/bear-aqua-back.png'),
      photo('Child in the pink Shine Brightly little bear set', 'https://cdn.example/bear-pink-front.png'),
      photo('Child in the pink Shine Brightly little bear set', 'https://cdn.example/bear-pink-detail.png'),
    ];
    expect(photosForColour(media, names, 'Aqua')).toHaveLength(2);
    expect(photosForColour(media, names, 'Pink')).toHaveLength(2);
    expect(photosForColour(media, names, 'Pink')[0]?.url).toContain('bear-pink-front');
  });

  it('matches colour-block names from alt text that lists both dyes', () => {
    const names = ['Mint Pink', 'Yellow Aqua'];
    expect(colourForMedia(photo('Child in the mint and pink Follow Your Intuition sweatshirt set'), names)).toBe('Mint Pink');
    expect(colourForMedia(photo('Child in the yellow and aqua Follow Your Intuition sweatshirt set'), names)).toBe('Yellow Aqua');
  });

  it('covers the remaining multi-colour alt text', () => {
    expect(colourForMedia(photo('Baby in the pink I See You giraffe fleece set'), ['Pink', 'Sky Blue'])).toBe('Pink');
    expect(colourForMedia(photo('Baby in the sky blue I See You giraffe fleece set'), ['Pink', 'Sky Blue'])).toBe('Sky Blue');
    expect(colourForMedia(photo('Child in the navy check waistcoat set'), ['Navy', 'Beige'])).toBe('Navy');
    expect(colourForMedia(photo('Child in the beige check waistcoat set'), ['Navy', 'Beige'])).toBe('Beige');
    expect(colourForMedia(photo('Cherry hooded romper in yellow'), ['Pink', 'Yellow'])).toBe('Yellow');
    expect(colourForMedia(photo('Bunny bow checkered romper in mint'), ['Pink', 'Mint'])).toBe('Mint');
    expect(colourForMedia(photo('Bunny bow checkered romper in pink'), ['Pink', 'Mint'])).toBe('Pink');
    expect(colourForMedia(photo('Animal print dungaree romper in blue'), ['Pink', 'Blue'])).toBe('Blue');
  });

  it('maps the unlabeled baby bunny photo to navy', () => {
    const item = photo(
      'Baby Bunny Checkered Romper Set',
      'https://cdn.shopify.com/s/files/1/0668/6624/9813/files/ChatGPTImageSep29_2026_10_57_18AM_d7fed673-7b59-4bd5-8683-5128d0415ed5.png',
    );
    expect(colourForMedia(item, ['Beige', 'Navy'])).toBe('Navy');
    expect(colourForMedia(item, ['Beige', 'Pink'])).toBeNull();
  });
});
