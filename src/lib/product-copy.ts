const PICTOGRAPH = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uFE0F|\u200D/gu;

/** Turn a Shopify description into a lead sentence and short points. */
export function descriptionParts(text: string): { lead: string; points: string[] } {
  const chunks = text
    .replace(PICTOGRAPH, '\n')
    .replace(/[•●▪]/g, '\n')
    .split(/\n+/)
    .map((part) => part.replace(/^[\s\-–—:]+/, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const sentences = (chunks.length > 1 ? chunks : splitSentences(chunks[0] ?? ''))
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (sentences.length === 0) return { lead: '', points: [] };
  if (sentences.length === 1) return { lead: sentences[0], points: [] };
  return { lead: sentences[0], points: sentences.slice(1) };
}

function splitSentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
