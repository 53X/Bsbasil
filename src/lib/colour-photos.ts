import type { StoreMedia } from '@/lib/shopify/types';

/**
 * Photos whose Shopify alt text does not name a colour.
 * Matched against the image URL or alt. A hit is used only when the
 * colour label is one of this product's colours.
 */
const UNLABELED_IMAGE_COLOURS: { fragment: string; colour: string }[] = [
  {
    fragment: 'd7fed673-7b59-4bd5-8683-5128d0415ed5',
    colour: 'Navy',
  },
];

function words(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/** Colour labels whose words all appear in the text. A shorter label inside a longer one is dropped. */
export function coloursNamedInText(text: string, colourNames: string[]): string[] {
  const hay = new Set(words(text));
  const hits = colourNames.filter((name) => {
    const parts = words(name);
    return parts.length > 0 && parts.every((part) => hay.has(part));
  });
  return hits.filter((name) => {
    const parts = words(name);
    return !hits.some((other) => {
      if (other === name) return false;
      const otherParts = new Set(words(other));
      return parts.length < otherParts.size && parts.every((part) => otherParts.has(part));
    });
  });
}

function unlabeledColour(item: StoreMedia, colourNames: string[]): string | null {
  const blob = `${item.url ?? ''} ${item.alt}`.toLowerCase();
  const hits = UNLABELED_IMAGE_COLOURS.filter(
    (entry) => blob.includes(entry.fragment.toLowerCase()) && colourNames.some((name) => name.toLowerCase() === entry.colour.toLowerCase()),
  );
  if (hits.length !== 1) return null;
  return colourNames.find((name) => name.toLowerCase() === hits[0].colour.toLowerCase()) ?? null;
}

/**
 * The single colourway this photo belongs to.
 * Alt text that names two colourways (a combo shot) returns null.
 */
export function colourForMedia(item: StoreMedia, colourNames: string[]): string | null {
  const named = coloursNamedInText(item.alt, colourNames);
  if (named.length > 1) return null;
  if (named.length === 1) return named[0];
  return unlabeledColour(item, colourNames);
}

/** Photos for one colourway, in catalog order. Combo shots are left out. */
export function photosForColour(media: StoreMedia[], colourNames: string[], colour: string): StoreMedia[] {
  return media.filter((item) => colourForMedia(item, colourNames) === colour);
}
