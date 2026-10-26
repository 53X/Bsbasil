/** Widths that match the cube (about 280px) and the archive cards (about 420px). */
export const HERO_SIZES = '(min-width: 1024px) 384px, 280px';
export const MOOD_SIZES = '(min-width: 1024px) 420px, 72vw';

export function heroSources(src: string): { src: string; srcSet: string } {
  const stem = src.replace(/\.(webp|jpe?g)$/i, '').replace(/-(?:400|440|520|640|800)$/, '');
  return {
    src: `${stem}-520.webp`,
    srcSet: `${stem}-400.webp 400w, ${stem}-440.webp 440w, ${stem}-520.webp 520w, ${stem}.webp 800w`,
  };
}
