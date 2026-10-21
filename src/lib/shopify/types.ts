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
  /** Coupon code from the product. The amount off is calculated from that Shopify discount. */
  discountCode?: string;
  available: boolean;
  media: StoreMedia[];
  options: StoreOption[];
  variants: StoreVariant[];
  /** Colours from the Shopify category metafield (shopify.color-pattern). */
  colors: StoreColor[];
}

/** One selectable colourway. `stops` run from the top of the garment to the bottom. */
export interface StoreColor {
  name: string;
  hex?: string;
  stops: string[];
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
  /** Name of the product chosen on this entry. */
  productName: string;
  /** Coupon code on that product, when one is set. */
  discountCode: string;
  /** Products from the collection chosen on this Homepage promotion entry. */
  products: StoreProduct[];
}

/** Story, values, and founder note. Edited as the About page metaobject in Shopify. */
export interface StoreAbout {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  lede: string;
  story: string;
  valuesHeading: string;
  valuesHeadingAccent: string;
  valuesIntro: string;
  values: { title: string; description: string }[];
  safetyHeading: string;
  safetyHeadingAccent: string;
  safetyBody: string;
  badges: string[];
  founderEyebrow: string;
  founderQuote: string;
  founderName: string;
  ctaHeading: string;
  ctaHeadingAccent: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Contact details and form copy. Edited as the Contact page metaobject in Shopify. */
export interface StoreContact {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  subheading: string;
  detailsHeading: string;
  detailsBody: string;
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  hours: string;
  responseTime: string;
  trustLabel: string;
  trustBody: string;
  formHeading: string;
  formHeadingAccent: string;
  successHeading: string;
  successBody: string;
  successCta: string;
}

/** Homepage bestseller rail. The collection is chosen on the Bestseller section metaobject. */
export interface StoreBestsellerSection {
  lead: string;
  accent: string;
  products: StoreProduct[];
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
