import type { Money, ShopRules, StoreMedia, StoreProduct, StoreVariant } from "./types";

const AGE_TAGS = ["0-6M", "6-12M", "12-18M", "18-24M", "24-36M"];
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
  tags: string[];
  availableForSale: boolean;
  featuredImage?: RawImage | null;
  options?: { name: string; values: string[] }[];
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
  const ageRange = tagValue(tags, "age:") || AGE_TAGS.find((age) => tags.includes(age)) || "";
  const category = node.productType?.trim() || tagValue(tags, "category:") || "Shop";
  const badge = BADGES.find((name) => tags.some((tag) => tag.toLowerCase() === name.toLowerCase())) ?? "";
  const description = node.description?.trim() || htmlToText(node.descriptionHtml ?? "");

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    description,
    category,
    ageRange,
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
