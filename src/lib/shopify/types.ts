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

export interface StoreOption {
  name: string;
  values: string[];
}

export interface StoreVariant {
  id: string;
  title: string;
  available: boolean;
  quantityAvailable: number | null;
  price: number;
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
  badge: string;
  featured: boolean;
  price: number;
  currency: string;
  priceLabel: string;
  image: string;
  alt: string;
  available: boolean;
  media: StoreMedia[];
  options: StoreOption[];
  variants: StoreVariant[];
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

export interface CartLine {
  id: string;
  variantId: string;
  name: string;
  variantTitle: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
}

export interface StoreCart {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
}
