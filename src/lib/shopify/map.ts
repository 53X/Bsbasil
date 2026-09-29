import type { Money, ShopRules, StoreMedia, StoreProduct, StoreVariant } from "./types";

const AGE_TAGS = ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M", "24-30M", "30-36M"];
const CATEGORY_MATCHERS: { label: string; pattern: RegExp }[] = [
  // Shop Type labels + Shopify Category taxonomy names (product description Category field)
  { label: "Romper", pattern: /\brompers?\b|one-pieces?\b/i },
  { label: "Sleepwear", pattern: /\b(sleepwear|sleepsuits?|pyjamas?|pajamas?|onesies?)\b/i },
  { label: "Sets", pattern: /\b(sets?|outfits?)\b/i },
  { label: "Winter wear", pattern: /\b(winter\s*wear|winterwear|outerwear|coats?\s*&?\s*jackets?|jackets?|sweaters?)\b/i },
  { label: "Accessories", pattern: /\b(accessorise|accessorize|accessories|accessory|clothing accessories|bibs?)\b/i },
];
const BADGES = ["Bestseller", "New", "Gift Pick"];

export function formatMoney(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** Shopify money strings are major units ("799.00"). Cart display uses paise. */
export function toMinorUnits(amount: string): number {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function mapShopRules(shop?: {
  deliveryFee?: { value?: string | null } | null;
  returnRule?: { value?: string | null } | null;
  pricesIncludeGst?: { value?: string | null } | null;
  cashOnDelivery?: { value?: string | null } | null;
} | null): ShopRules {
  const text = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };
  return {
    deliveryFee: text(shop?.deliveryFee?.value),
    returnPolicy: text(shop?.returnRule?.value),
    pricesIncludeGst: text(shop?.pricesIncludeGst?.value),
    cashOnDelivery: text(shop?.cashOnDelivery?.value),
  };
}

export function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tagValue(tags: string[], prefix: string): string {
  const found = tags.find((tag) => tag.toLowerCase().startsWith(prefix));
  return found ? found.slice(prefix.length).trim() : "";
}

function canonicalCategory(productType: string, tags: string[], title: string, collections: string[]): string {
  // Prefer Product organization Tags / Type (Romper, Sleepwear, …), then collections / taxonomy name.
  const labeled = [tagValue(tags, "category:"), productType, ...tags, ...collections];
  for (const source of labeled) {
    if (!source.trim()) continue;
    const match = CATEGORY_MATCHERS.find((item) => item.pattern.test(source));
    if (match) return match.label;
  }
  const fromTitle = CATEGORY_MATCHERS.find((item) => item.pattern.test(title));
  return fromTitle?.label ?? "Shop";
}

/** Human-readable age label for UI (filters, badges, shop-by-age). */
export function ageLabel(code: string): string {
  switch (code) {
    case "0-3M":
      return "0–3 Months";
    case "3-6M":
      return "3–6 Months";
    case "6-12M":
      return "6–12 Months";
    case "12-18M":
      return "12–18 Months";
    case "18-24M":
      return "18–24 Months";
    case "24-30M":
      return "24–30 Months";
    case "30-36M":
      return "30–36 Months";
    default:
      return code;
  }
}

/** Label for one age, or a span when a product covers several ages. */
export function ageRangeLabel(codes: string[]): string {
  const ordered = AGE_TAGS.filter((age) => codes.includes(age));
  if (ordered.length === 0) return "";
  if (ordered.length === 1) return ageLabel(ordered[0]);
  const start = ageLabel(ordered[0]).replace(/ Months$/, "");
  return `${start} – ${ageLabel(ordered[ordered.length - 1])}`;
}

/** Catalog filters: All Ages / All Categories mean no filter on that axis. */
export function productMatchesFilters(
  product: { category: string; ageRanges: string[] },
  selectedAge: string,
  selectedCategory: string,
): boolean {
  const ageOpen = selectedAge === "All Ages" || !selectedAge;
  const categoryOpen =
    selectedCategory === "All Categories" || selectedCategory === "All" || !selectedCategory;
  const ageMatch = ageOpen || product.ageRanges.includes(selectedAge);
  const catMatch = categoryOpen || product.category === selectedCategory;
  return ageMatch && catMatch;
}

/** Catalog lists one card per product; ages are sizes on that product, not separate listings. */
export function expandProductsByAge<T extends { ageRanges: string[] }>(
  products: T[],
  selectedAge: string,
): { product: T; ageCode: string }[] {
  return products.map((product) => ({
    product,
    // When a specific age is filtered, highlight that size on the card; otherwise leave blank
    // so the card can show the full available age/size range.
    ageCode: selectedAge !== "All Ages" ? selectedAge : "",
  }));
}

/** Turn a Shopify age tag or size label into one of the shop's age filters. */
export function ageCode(raw: string): string | null {
  const value = raw.trim().toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ");
  const compact = value.replace(/\s+/g, "");
  if (["0-3m", "0-3months", "0-3", "0-3 months", "0 to 3 months", "newborn"].includes(value) || ["0-3m", "0-3months"].includes(compact)) return "0-3M";
  if (["3-6m", "3-6months", "3-6", "3-6 months", "3 to 6 months"].includes(value) || ["3-6m", "3-6months"].includes(compact)) return "3-6M";
  // Shop uses 6–12; Shopify taxonomy often has 6–9 / 9–12 — both map into 6–12.
  if (
    ["6-12m", "6-12months", "6-12", "6-12 months", "6 to 12 months", "6-9m", "6-9months", "6-9", "6-9 months", "9-12m", "9-12months", "9-12", "9-12 months"].includes(value) ||
    ["6-12m", "6-12months", "6-9m", "6-9months", "9-12m", "9-12months"].includes(compact)
  ) {
    return "6-12M";
  }
  if (["12-18m", "12-18months", "12-18", "12-18 months", "12 to 18 months"].includes(value) || ["12-18m", "12-18months"].includes(compact)) return "12-18M";
  if (["18-24m", "18-24months", "18-24", "18-24 months", "18 to 24 months"].includes(value) || ["18-24m", "18-24months"].includes(compact)) return "18-24M";
  if (["24-30m", "24-30months", "24-30", "24-30 months", "24 to 30 months"].includes(value) || ["24-30m", "24-30months"].includes(compact)) return "24-30M";
  if (["30-36m", "30-36months", "30-36", "30-36 months", "30 to 36 months"].includes(value) || ["30-36m", "30-36months"].includes(compact)) return "30-36M";
  // Legacy 24–36 / 2–3 years spans both new bands.
  if (["24-36m", "24-36months", "24-36", "24-36 months", "24 to 36 months", "2-3", "2-3 years", "2 to 3 years"].includes(value) || ["24-36m", "24-36months", "2-3years"].includes(compact)) {
    return "24-36M";
  }
  return null;
}

/**
 * Shopify Category Size metaobjects (shopify--size).
 * Storefront often returns only metafield `value` (GID JSON) because
 * resolving references needs `unauthenticated_read_metaobjects`.
 */
const SIZE_METAOBJECT_LABELS: Record<string, string> = {
  "gid://shopify/Metaobject/428238504021": "0-3 months",
  "gid://shopify/Metaobject/428238536789": "3-6 months",
  "gid://shopify/Metaobject/428239847509": "6-9 months",
  "gid://shopify/Metaobject/428239880277": "9-12 months",
  "gid://shopify/Metaobject/428476498005": "6-12 months",
  "gid://shopify/Metaobject/428476399701": "12-18 months",
  "gid://shopify/Metaobject/428476432469": "18-24 months",
  "gid://shopify/Metaobject/428476530773": "24-30 months",
  "gid://shopify/Metaobject/428476563541": "30-36 months",
  "gid://shopify/Metaobject/428476465237": "2-3 years",
};

/**
 * Ages for catalog filters come from Category metafields → Size (shopify.size).
 * Fall back to variant Size options / age tags only when Size metafield is empty.
 */
function collectAges(
  tags: string[],
  options: { name: string; values: string[] }[],
  sizeLabels: string[] = [],
): string[] {
  const found = new Set<string>();
  const add = (value: string) => {
    const code = ageCode(value.replace(/^age:/i, ""));
    if (!code) return;
    if (code === "24-36M") {
      found.add("24-30M");
      found.add("30-36M");
      return;
    }
    found.add(code);
  };

  if (sizeLabels.length > 0) {
    sizeLabels.forEach(add);
    return AGE_TAGS.filter((age) => found.has(age));
  }

  tags.forEach(add);
  options
    .filter((option) => /size|age/i.test(option.name))
    .forEach((option) => option.values.forEach(add));
  return AGE_TAGS.filter((age) => found.has(age));
}

function sizeMetafieldLabels(
  metafield?: {
    value?: string | null;
    references?: {
      nodes?: Array<{
        handle?: string | null;
        fields?: Array<{ key: string; value: string }> | null;
      } | null> | null;
    } | null;
  } | null,
): string[] {
  const fromRefs = (metafield?.references?.nodes ?? [])
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => {
      const label = node.fields?.find((field) => field.key === "label")?.value;
      return label || node.handle?.replace(/-/g, " ") || "";
    })
    .filter(Boolean);
  if (fromRefs.length > 0) return fromRefs;

  // Storefront without metaobject scope: value is a JSON array of metaobject GIDs.
  const raw = metafield?.value?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => (typeof id === "string" ? SIZE_METAOBJECT_LABELS[id] : null))
      .filter((label): label is string => Boolean(label));
  } catch {
    return [];
  }
}

interface RawImage {
  url: string;
  altText?: string | null;
}

interface RawMediaNode {
  mediaContentType?: string;
  alt?: string | null;
  image?: RawImage | null;
  sources?: { url: string; mimeType?: string | null }[] | null;
  previewImage?: { url: string } | null;
  embedUrl?: string | null;
}

interface RawVariantNode {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: Money;
  compareAtPrice?: Money | null;
  image?: RawImage | null;
  selectedOptions: { name: string; value: string }[];
}

export interface DiscountPreviewLine {
  variantId: string;
  quantity: number;
  totalAmount: string;
  subtotalAmount: string;
  title: string | null;
}

export interface RawProductNode {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  productType?: string | null;
  category?: { name?: string | null } | null;
  tags: string[];
  availableForSale: boolean;
  featuredImage?: RawImage | null;
  options?: { name: string; values: string[] }[];
  sizeMetafield?: {
    value?: string | null;
    references?: {
      nodes?: Array<{
        handle?: string | null;
        fields?: Array<{ key: string; value: string }> | null;
      } | null> | null;
    } | null;
  } | null;
  collections?: { nodes: { title: string }[] };
  media?: { nodes: RawMediaNode[] };
  variants?: { nodes: RawVariantNode[] };
}

function mapMedia(node: RawMediaNode, fallbackAlt: string): StoreMedia | null {
  const alt = node.alt || fallbackAlt;
  if (node.image?.url) {
    return { kind: "image", url: node.image.url, alt: node.image.altText || alt };
  }
  const source = node.sources?.find((item) => item.mimeType?.includes("mp4")) ?? node.sources?.[0];
  if (source?.url) {
    return {
      kind: "video",
      url: source.url,
      poster: node.previewImage?.url,
      alt,
    };
  }
  if (node.embedUrl) {
    return { kind: "external", embedUrl: node.embedUrl, poster: node.previewImage?.url, alt };
  }
  return null;
}

function mapVariant(node: RawVariantNode): StoreVariant {
  const price = toMinorUnits(node.price.amount);
  const compareAt = node.compareAtPrice ? toMinorUnits(node.compareAtPrice.amount) : 0;
  return {
    id: node.id,
    title: node.title,
    available: node.availableForSale,
    quantityAvailable: node.quantityAvailable ?? null,
    price,
    compareAtPrice: compareAt > price ? compareAt : null,
    discountTitle: null,
    currency: node.price.currencyCode,
    selectedOptions: node.selectedOptions,
    image: node.image?.url,
  };
}

function displayedVariant(product: StoreProduct): StoreVariant | undefined {
  return product.variants.find((variant) => variant.price > 0) ?? product.variants[0];
}

export function refreshDisplayedPrice(product: StoreProduct): StoreProduct {
  const first = displayedVariant(product);
  if (!first) return product;
  const compareAt = first.compareAtPrice && first.compareAtPrice > first.price ? first.compareAtPrice : null;
  return {
    ...product,
    price: first.price,
    compareAtPrice: compareAt,
    discountTitle: first.discountTitle,
    currency: first.currency,
    priceLabel: formatMoney(first.price / 100, first.currency),
  };
}

/** Apply a Shopify automatic discount from a one-item cart preview. */
export function applyCartDiscounts(products: StoreProduct[], lines: DiscountPreviewLine[]): StoreProduct[] {
  const byVariant = new Map(lines.map((line) => [line.variantId, line]));
  return products.map((product) => {
    const variants = product.variants.map((variant) => {
      const line = byVariant.get(variant.id);
      if (!line || line.quantity <= 0) return variant;
      const sale = Math.round(toMinorUnits(line.totalAmount) / line.quantity);
      const list = Math.round(toMinorUnits(line.subtotalAmount) / line.quantity);
      if (list <= sale || sale < 0) return variant;
      const original = Math.max(variant.compareAtPrice ?? 0, list, variant.price);
      return {
        ...variant,
        price: sale,
        compareAtPrice: original,
        discountTitle: line.title ?? variant.discountTitle,
      };
    });
    return refreshDisplayedPrice({ ...product, variants });
  });
}

export function mapProduct(node: RawProductNode): StoreProduct {
  const tags = node.tags ?? [];
  const variants = (node.variants?.nodes ?? []).map(mapVariant);
  const priced = variants.filter((variant) => variant.price > 0);
  const first = priced[0] ?? variants[0];
  const currency = first?.currency ?? "INR";
  const price = first?.price ?? 0;
  const compareAtPrice = first?.compareAtPrice && first.compareAtPrice > price ? first.compareAtPrice : null;
  const media = (node.media?.nodes ?? [])
    .map((item) => mapMedia(item, node.title))
    .filter((item): item is StoreMedia => item !== null);
  const image = node.featuredImage?.url || media.find((item) => item.kind === "image")?.url || media[0]?.poster || "";
  const ageRanges = collectAges(tags, node.options ?? [], sizeMetafieldLabels(node.sizeMetafield));
  const category = canonicalCategory(
    node.productType ?? "",
    tags,
    node.title,
    [
      node.category?.name ?? "",
      ...(node.collections?.nodes ?? []).map((collection) => collection.title),
    ],
  );
  const badge = BADGES.find((name) => tags.some((tag) => tag.toLowerCase() === name.toLowerCase())) ?? "";
  const description = node.description?.trim() || htmlToText(node.descriptionHtml ?? "");

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    description,
    category,
    ageRange: ageRanges[0] ?? "",
    ageRanges,
    badge,
    featured: tags.some((tag) => tag.toLowerCase() === "featured"),
    price,
    compareAtPrice,
    discountTitle: first?.discountTitle ?? null,
    currency,
    priceLabel: formatMoney(price / 100, currency),
    image,
    alt: node.featuredImage?.altText || node.title,
    available: node.availableForSale,
    media: media.length > 0 ? media : image ? [{ kind: "image", url: image, alt: node.title }] : [],
    options: node.options ?? [],
    variants,
  };
}

export function matchingVariant(product: StoreProduct, selected: Record<string, string>): StoreVariant | undefined {
  return product.variants.find((variant) =>
    variant.selectedOptions.every((option) => selected[option.name] === option.value),
  );
}

/** Keep a valid size and colour together when one of them changes. */
export function selectionForOption(
  product: StoreProduct,
  selected: Record<string, string>,
  name: string,
  value: string,
): Record<string, string> {
  const next = { ...selected, [name]: value };
  if (matchingVariant(product, next)) return next;
  const fallback = product.variants.find((variant) =>
    variant.selectedOptions.some((option) => option.name === name && option.value === value),
  );
  if (!fallback) return next;
  return Object.fromEntries(fallback.selectedOptions.map((option) => [option.name, option.value]));
}
