export interface Money {
  amount: string;
  currencyCode: string;
}

export interface StoreMedia {
  kind: "image" | "video" | "external";
  url?: string;
  embedUrl?: string;
  poster?: string;
  alt: string;
}

export interface StoreOptionSwatch {
  name: string;
  swatchColor?: string;
  swatchImage?: string;
}

export interface StoreOption {
  name: string;
  values: string[];
  swatches?: StoreOptionSwatch[];
}

export interface StoreVariant {
  id: string;
  title: string;
  available: boolean;
  quantityAvailable: number | null;
  price: number;
  compareAtPrice: number | null;
  discountTitle: string | null;
  currency: string;
  selectedOptions: { name: string; value: string }[];
  image?: string;
}

export interface StorePolicy {
  title: string;
  body: string;
}

/** Store-wide buying rules. The founder edits these in Shopify, on the shop. */
export interface ShopRules {
  deliveryFee: string | null;
  returnPolicy: string | null;
  pricesIncludeGst: string | null;
  cashOnDelivery: string | null;
}

export interface StoreProduct {
  id: string;
  handle: string;
  name: string;
  description: string;
  category: string;
  ageRange: string;
  ageRanges: string[];
  badge: string;
  featured: boolean;
  price: number;
  compareAtPrice: number | null;
  discountTitle: string | null;
  currency: string;
  priceLabel: string;
  image: string;
  alt: string;
  available: boolean;
  media: StoreMedia[];
  options: StoreOption[];
  variants: StoreVariant[];
  /** Colours from the Shopify category metafield (shopify.color-pattern). */
  colors: { name: string; hex?: string }[];
}

export interface StorePromotion {
  id: string;
  heading: string;
  message: string;
  offer: string;
  buttonLabel: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  videoUrl: string | null;
  posterUrl: string | null;
}

export interface StoreCatalog {
  configured: boolean;
  products: StoreProduct[];
  policies: {
    refund: StorePolicy | null;
    shipping: StorePolicy | null;
  };
  rules: ShopRules;
  error: string | null;
}

export interface CartLineAttribute {
  key: string;
  value: string;
}

export interface CartLine {
  id: string;
  variantId: string;
  name: string;
  handle?: string;
  variantTitle: string;
  price: number;
  compareAtPrice: number | null;
  discountTitle: string | null;
  currency: string;
  quantity: number;
  image?: string;
  attributes?: CartLineAttribute[];
}

export interface StoreCart {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
}
