import { shopifyConfig } from "./config";
import { applyCartDiscounts, applyPromotionOffers, discountBadge, htmlToText, mapProduct, mapShopRules, promotionOfferForHandle, saleFromOffer, type RawProductNode } from "./map";
import { bestsellerProducts, FALLBACK_ABOUT, FALLBACK_BESTSELLER_TITLE, FALLBACK_CONTACT, fieldText, mapAbout, mapContact, type MetaobjectFieldNode } from "./site-content";
import type { ShopRules, StoreAbout, StoreBestsellerSection, StoreCart, StoreCatalog, StoreContact, StorePolicy, StoreProduct, StorePromotion } from "./types";

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  productType
  category { name }
  tags
  availableForSale
  featuredImage { url altText }
  options {
    name
    optionValues {
      name
      swatch {
        color
        image { previewImage { url } }
      }
    }
  }
  sizeMetafield: metafield(namespace: "shopify", key: "size") {
    type
    value
    references(first: 20) {
      nodes {
        ... on Metaobject {
          handle
          fields { key value }
        }
      }
    }
  }
  colorMetafield: metafield(namespace: "shopify", key: "color-pattern") {
    type
    value
    references(first: 20) {
      nodes {
        ... on Metaobject {
          handle
          fields { key value }
        }
      }
    }
  }
  collections(first: 10) { nodes { title } }
  media(first: 20) {
    nodes {
      mediaContentType
      alt
      ... on MediaImage {
        image { url altText }
      }
      ... on Video {
        sources { url mimeType }
        previewImage { url }
      }
      ... on ExternalVideo {
        embedUrl
        previewImage { url }
      }
    }
  }
  variants(first: 100) {
    nodes {
      id
      title
      availableForSale
      quantityAvailable
      selectedOptions { name value }
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      image { url altText }
    }
  }
  discountCode: metafield(namespace: "custom", key: "discount_code") { value }
`;

const CART_FIELDS = `
  id
  checkoutUrl
  lines(first: 50) {
    nodes {
      id
      quantity
      attributes { key value }
      merchandise {
        ... on ProductVariant {
          id
          title
          image { url }
          price { amount currencyCode }
          product { title handle }
        }
      }
      cost {
        totalAmount { amount currencyCode }
        subtotalAmount { amount currencyCode }
      }
      discountAllocations {
        ... on CartAutomaticDiscountAllocation { title }
        ... on CartCodeDiscountAllocation { code }
      }
    }
  }
`;

const SHOP_FIELDS = `
  refundPolicy { title body }
  shippingPolicy { title body }
  deliveryFee: metafield(namespace: "custom", key: "delivery_fee") { value }
  returnRule: metafield(namespace: "custom", key: "return_policy") { value }
  pricesIncludeGst: metafield(namespace: "custom", key: "prices_include_gst") { value }
  cashOnDelivery: metafield(namespace: "custom", key: "cash_on_delivery") { value }
`;

interface PolicyNode {
  title: string;
  body: string;
}

interface ShopNode {
  refundPolicy?: PolicyNode | null;
  shippingPolicy?: PolicyNode | null;
  deliveryFee?: { value?: string | null } | null;
  returnRule?: { value?: string | null } | null;
  pricesIncludeGst?: { value?: string | null } | null;
  cashOnDelivery?: { value?: string | null } | null;
}

interface ProductsData {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: RawProductNode[];
  };
  shop?: ShopNode;
}

interface ProductData {
  product: RawProductNode | null;
  shop?: ProductsData["shop"];
}

interface CartPayload {
  cart: {
    id: string;
    checkoutUrl: string;
    lines: {
      nodes: Array<{
        id: string;
        quantity: number;
        attributes?: Array<{ key: string; value: string }> | null;
        merchandise: {
          id: string;
          title: string;
          image?: { url: string } | null;
          price: { amount: string; currencyCode: string };
          product: { title: string; handle: string };
        };
        cost?: {
          totalAmount: { amount: string; currencyCode: string };
          subtotalAmount: { amount: string; currencyCode: string };
        };
        discountAllocations?: Array<{ title?: string; code?: string }>;
      }>;
    };
  } | null;
  userErrors: { message: string }[];
}

let catalogCache: { at: number; value: StoreCatalog } | null = null;
const CACHE_MS = 60_000;

async function storefront<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const config = shopifyConfig();
  if (!config) throw new Error("Shopify is not configured");

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed (${response.status})`);
  }

  const json = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(", "));
  }
  if (!json.data) throw new Error("Shopify returned an empty response");
  return json.data;
}

function mapPolicy(policy?: PolicyNode | null): StorePolicy | null {
  if (!policy?.body) return null;
  return { title: policy.title, body: htmlToText(policy.body) };
}

const EMPTY_RULES: ShopRules = {
  deliveryFee: null,
  returnPolicy: null,
  pricesIncludeGst: null,
  cashOnDelivery: null,
};

function shopDetails(shop?: ShopNode | null) {
  return {
    policies: {
      refund: mapPolicy(shop?.refundPolicy),
      shipping: mapPolicy(shop?.shippingPolicy),
    },
    rules: mapShopRules(shop),
  };
}

function emptyCatalog(configured: boolean, error: string | null): StoreCatalog {
  return {
    configured,
    products: [],
    policies: { refund: null, shipping: null },
    rules: EMPTY_RULES,
    error,
  };
}

export async function loadCatalog(force = false): Promise<StoreCatalog> {
  if (!shopifyConfig()) return emptyCatalog(false, null);
  if (!force && catalogCache && Date.now() - catalogCache.at < CACHE_MS) {
    return catalogCache.value;
  }

  try {
    const products: StoreProduct[] = [];
    let cursor: string | null = null;
    let details = shopDetails(null);

    // Page until Shopify says the catalog is finished. A stalled cursor stops the loop.
    for (let page = 0; page < 40; page += 1) {
      const data: ProductsData = await storefront<ProductsData>(
        `query Products($cursor: String) {
          products(first: 50, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } }
          shop { ${SHOP_FIELDS} }
        }`,
        { cursor },
      );
      products.push(...data.products.nodes.map(mapProduct));
      details = shopDetails(data.shop);
      const nextCursor = data.products.pageInfo.endCursor;
      if (!data.products.pageInfo.hasNextPage || !nextCursor || nextCursor === cursor) break;
      cursor = nextCursor;
    }

    const priced = await previewProductDiscounts(products);
    const value: StoreCatalog = { configured: true, products: priced, ...details, error: null };
    catalogCache = { at: Date.now(), value };
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load products";
    return emptyCatalog(true, message);
  }
}

export async function loadProduct(handle: string): Promise<{ product: StoreProduct | null; catalog: StoreCatalog }> {
  const catalog = await loadCatalog();
  const cached = catalog.products.find((product) => product.handle === handle);
  if (cached || !catalog.configured || catalog.error) {
    return { product: cached ?? null, catalog };
  }

  try {
    const data = await storefront<ProductData>(
      `query Product($handle: String!) {
        product(handle: $handle) { ${PRODUCT_FIELDS} }
        shop { ${SHOP_FIELDS} }
      }`,
      { handle },
    );
    return {
      product: data.product ? (await previewProductDiscounts([mapProduct(data.product)]))[0] ?? null : null,
      catalog: {
        ...catalog,
        ...shopDetails(data.shop),
      },
    };
  } catch (error) {
    return {
      product: null,
      catalog: {
        ...catalog,
        error: error instanceof Error ? error.message : "Could not load this product",
      },
    };
  }
}

function minor(amount: string): number {
  return Math.round(Number(amount) * 100);
}

function mapCart(cart: NonNullable<CartPayload["cart"]>): StoreCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines.nodes.map((line) => {
      const quantity = line.quantity || 1;
      const total = line.cost ? minor(line.cost.totalAmount.amount) : minor(line.merchandise.price.amount) * quantity;
      const list = line.cost ? minor(line.cost.subtotalAmount.amount) : total;
      const unit = Math.round(total / quantity);
      const listUnit = Math.round(list / quantity);
      const discountTitle = (line.discountAllocations ?? [])
        .map((allocation) => allocation.title || allocation.code)
        .filter((title): title is string => Boolean(title))
        .join(", ");
      const attributes = (line.attributes ?? []).filter((entry) => entry.key && entry.value);
      const sizeAttr = attributes.find((entry) => /^size$/i.test(entry.key))?.value;
      const variantTitle =
        line.merchandise.title === "Default Title" ? sizeAttr || "" : line.merchandise.title;
      return {
        id: line.id,
        variantId: line.merchandise.id,
        name: line.merchandise.product.title,
        handle: line.merchandise.product.handle,
        variantTitle,
        price: unit,
        compareAtPrice: listUnit > unit ? listUnit : null,
        discountTitle: discountTitle || null,
        currency: line.cost?.totalAmount.currencyCode ?? line.merchandise.price.currencyCode,
        quantity: line.quantity,
        image: line.merchandise.image?.url,
        attributes: attributes.length > 0 ? attributes : undefined,
      };
    }),
  };
}

const DISCOUNT_PREVIEW_CHUNK = 50;

async function previewDiscountChunk(variantIds: string[], codes: string[] = []) {
  const data = await storefront<{
    cartCreate: {
      cart: {
        lines: {
          nodes: Array<{
            quantity: number;
            merchandise: { id: string };
            cost: { totalAmount: { amount: string }; subtotalAmount: { amount: string } };
            discountAllocations: Array<{ title?: string; code?: string }>;
          }>;
        };
      } | null;
    };
  }>(
    `mutation Preview($lines: [CartLineInput!]!, $codes: [String!]) {
      cartCreate(input: { lines: $lines, discountCodes: $codes }) {
        cart {
          lines(first: ${DISCOUNT_PREVIEW_CHUNK}) {
            nodes {
              quantity
              merchandise { ... on ProductVariant { id } }
              cost {
                totalAmount { amount }
                subtotalAmount { amount }
              }
              discountAllocations {
                ... on CartAutomaticDiscountAllocation { title }
                ... on CartCodeDiscountAllocation { code }
              }
            }
          }
        }
      }
    }`,
    { lines: variantIds.map((merchandiseId) => ({ merchandiseId, quantity: 1 })), codes },
  );
  return (data.cartCreate.cart?.lines.nodes ?? []).map((line) => ({
    variantId: line.merchandise.id,
    quantity: line.quantity,
    totalAmount: line.cost.totalAmount.amount,
    subtotalAmount: line.cost.subtotalAmount.amount,
    title: line.discountAllocations.map((allocation) => allocation.title || allocation.code).filter(Boolean).join(", ") || null,
  }));
}

/** Order-wide codes, such as FIRSTPURCHASE, change the cart total rather than one line. */
async function previewPromotionCode(variantIds: string[], code: string) {
  const lines = await previewDiscountChunk(variantIds, [code]);
  const data = await storefront<{
    cartCreate: {
      cart: {
        discountCodes: Array<{ code: string; applicable: boolean }>;
        cost: { totalAmount: { amount: string }; subtotalAmount: { amount: string } };
      } | null;
    };
  }>(
    `mutation PreviewOrder($lines: [CartLineInput!]!, $codes: [String!]) {
      cartCreate(input: { lines: $lines, discountCodes: $codes }) {
        cart {
          discountCodes { code applicable }
          cost { totalAmount { amount } subtotalAmount { amount } }
        }
      }
    }`,
    { lines: variantIds.slice(0, 1).map((merchandiseId) => ({ merchandiseId, quantity: 1 })), codes: [code] },
  );
  const cart = data.cartCreate.cart;
  const subtotal = Number(cart?.cost.subtotalAmount.amount);
  const total = Number(cart?.cost.totalAmount.amount);
  const applicable = cart?.discountCodes.some((entry) => entry.applicable) ?? false;
  let orderOffer: string | null = null;
  if (applicable && subtotal > total) {
    const pct = Math.round(((subtotal - total) / subtotal) * 100);
    if (pct > 0 && pct < 100) orderOffer = `${pct}% off`;
  }
  return { lines, orderOffer };
}

async function previewProductDiscounts(products: StoreProduct[]): Promise<StoreProduct[]> {
  const variantIds = products.flatMap((product) =>
    product.variants.filter((variant) => variant.available).map((variant) => variant.id),
  );
  if (variantIds.length === 0) return products;

  const lines = [];
  for (let index = 0; index < variantIds.length; index += DISCOUNT_PREVIEW_CHUNK) {
    const chunk = variantIds.slice(index, index + DISCOUNT_PREVIEW_CHUNK);
    try {
      lines.push(...(await previewDiscountChunk(chunk)));
    } catch {
      // A failed preview chunk leaves those variants at their Shopify price.
    }
  }
  if (lines.length === 0) return products;
  return applyCartDiscounts(products, lines);
}

async function withPromotionPrices(cart: StoreCart): Promise<StoreCart> {
  const promotions = await loadPromotions();
  return {
    ...cart,
    lines: cart.lines.map((line) => {
      if (!line.handle) return line;
      const offer = promotionOfferForHandle(promotions, line.handle);
      if (!offer) return line;
      const priced = saleFromOffer(line.price, line.compareAtPrice, offer);
      return {
        ...line,
        price: priced.price,
        compareAtPrice: priced.compareAtPrice,
        discountTitle: priced.discountTitle ?? line.discountTitle,
      };
    }),
  };
}

async function cartResult(payload: CartPayload): Promise<StoreCart> {
  const message = payload.userErrors.map((error) => error.message).join(", ");
  if (!payload.cart) throw new Error(message || "Cart update failed");
  return withPromotionPrices(mapCart(payload.cart));
}

export async function fetchCart(cartId: string): Promise<StoreCart | null> {
  const data = await storefront<{ cart: CartPayload["cart"] }>(
    `query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
    { id: cartId },
  );
  return data.cart ? withPromotionPrices(mapCart(data.cart)) : null;
}

export async function createCart(
  variantId: string,
  quantity: number,
  attributes?: Array<{ key: string; value: string }>,
): Promise<StoreCart> {
  const lineAttributes = (attributes ?? []).filter((entry) => entry.key && entry.value);
  const data = await storefront<{ cartCreate: CartPayload }>(
    `mutation Create($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    {
      lines: [
        {
          merchandiseId: variantId,
          quantity,
          ...(lineAttributes.length > 0 ? { attributes: lineAttributes } : {}),
        },
      ],
    },
  );
  return cartResult(data.cartCreate);
}

export async function addCartLine(
  cartId: string,
  variantId: string,
  quantity: number,
  attributes?: Array<{ key: string; value: string }>,
): Promise<StoreCart> {
  const lineAttributes = (attributes ?? []).filter((entry) => entry.key && entry.value);
  const data = await storefront<{ cartLinesAdd: CartPayload }>(
    `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
          ...(lineAttributes.length > 0 ? { attributes: lineAttributes } : {}),
        },
      ],
    },
  );
  return cartResult(data.cartLinesAdd);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<StoreCart> {
  const data = await storefront<{ cartLinesUpdate: CartPayload }>(
    `mutation Update($cartId: ID!, $lineId: ID!, $quantity: Int!) {
      cartLinesUpdate(cartId: $cartId, lines: [{ id: $lineId, quantity: $quantity }]) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lineId, quantity },
  );
  return cartResult(data.cartLinesUpdate);
}

export async function catalogLoader() {
  const catalog = await loadCatalog();
  const promotions = await loadPromotions();
  return {
    ...catalog,
    products: applyPromotionOffers(catalog.products, promotions),
    promotions,
  };
}

interface PromotionField {
  key: string;
  value: string | null;
  reference?: {
    image?: { url: string; altText?: string | null } | null;
    sources?: { url: string; mimeType?: string | null }[];
    previewImage?: { url: string } | null;
    products?: { nodes: RawProductNode[] } | null;
    id?: string;
    handle?: string;
    title?: string;
    discountCode?: { value?: string | null } | null;
    featuredImage?: { url?: string | null; altText?: string | null } | null;
    variants?: RawProductNode["variants"];
    media?: RawProductNode["media"];
    tags?: string[];
    availableForSale?: boolean;
  } | null;
}

function fieldValue(fields: PromotionField[], key: string) {
  return fields.find((field) => field.key === key)?.value?.trim() || "";
}

function fieldReference(fields: PromotionField[], key: string) {
  return fields.find((field) => field.key === key)?.reference ?? null;
}

function mapPromotion(node: { id: string; fields: PromotionField[] }): StorePromotion[] {
  const fields = node.fields;
  const heading = fieldValue(fields, "heading");
  const picture = fieldReference(fields, "picture");
  const clip = fieldReference(fields, "clip");
  const collection = fieldReference(fields, "collection");
  const productReference = fieldReference(fields, "product");
  const product = productReference?.handle ? mapProduct(productReference as RawProductNode) : null;
  const video = clip?.sources?.find((source) => source.url)?.url || null;
  if (!heading && !product) return [];
  return [{
    id: node.id,
    heading: heading || product?.name || "",
    message: fieldValue(fields, "message"),
    offer: "",
    buttonLabel: fieldValue(fields, "button_label") || "Shop now",
    href: product ? `/products/${product.handle}` : fieldValue(fields, "link") || "/catalog",
    imageUrl: product?.image || picture?.image?.url || null,
    imageAlt: product?.alt || picture?.image?.altText || heading,
    videoUrl: product ? null : video,
    posterUrl: product ? null : clip?.previewImage?.url || picture?.image?.url || null,
    productName: product?.name || "",
    discountCode: fieldValue(fields, "discount_code") || product?.discountCode || "",
    products: product
      ? [product]
      : (collection?.products?.nodes ?? []).map((item) => mapProduct(item)),
  }];
}

/** The amount off is whatever Shopify calculates for the discount code on this card. */
async function applyPromotionDiscountCodes(promotions: StorePromotion[]): Promise<StorePromotion[]> {
  const next: StorePromotion[] = [];
  for (const promotion of promotions) {
    const sample = promotion.products.find((product) => product.variants.some((variant) => variant.available));
    if (!promotion.discountCode || !sample) {
      next.push(promotion);
      continue;
    }
    const targets = promotion.productName ? promotion.products : [sample];
    const variantIds = targets
      .flatMap((product) => product.variants.filter((variant) => variant.available).map((variant) => variant.id))
      .slice(0, DISCOUNT_PREVIEW_CHUNK);
    if (variantIds.length === 0) {
      next.push(promotion);
      continue;
    }
    try {
      const { lines, orderOffer } = await previewPromotionCode(variantIds, promotion.discountCode);
      const priced = applyCartDiscounts(targets, lines);
      const product = priced[0];
      const lineOffer = product ? discountBadge(product.price, product.compareAtPrice, product.discountTitle) : null;
      const offer = lineOffer || orderOffer || "";
      if (promotion.productName && product) {
        next.push({
          ...promotion,
          offer: offer || "",
          imageUrl: product.image || promotion.imageUrl,
          imageAlt: product.alt || promotion.imageAlt,
          productName: product.name,
          products: priced,
        });
      } else {
        next.push({ ...promotion, offer: offer || "" });
      }
    } catch {
      next.push(promotion);
    }
  }
  return next;
}

export async function loadPromotions(): Promise<StorePromotion[]> {
  if (!shopifyConfig()) return [];
  const promotions: StorePromotion[] = [];
  let cursor: string | null = null;
  try {
    for (let page = 0; page < 20; page += 1) {
      const data = await storefront<{
        metaobjects: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: { id: string; fields: PromotionField[] }[];
        };
      }>(
        `query Promotions($cursor: String) {
          metaobjects(type: "homepage_promotion", first: 50, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              fields {
                key
                value
                reference {
                  ... on MediaImage { image { url altText } }
                  ... on Video { sources { url mimeType } previewImage { url } }
                  ... on Collection {
                    products(first: 24) { nodes { ${PRODUCT_FIELDS} } }
                  }
                  ... on Product { ${PRODUCT_FIELDS} }
                }
              }
            }
          }
        }`,
        { cursor },
      );
      promotions.push(...data.metaobjects.nodes.flatMap(mapPromotion));
      const nextCursor = data.metaobjects.pageInfo.endCursor;
      if (!data.metaobjects.pageInfo.hasNextPage || !nextCursor || nextCursor === cursor) break;
      cursor = nextCursor;
    }
    return applyPromotionDiscountCodes(promotions);
  } catch {
    return promotions;
  }
}

const BESTSELLER_HANDLES = ['bestsellers', 'best-sellers'];

const METAOBJECT_FIELDS = `
  key
  value
  reference {
    ... on Collection {
      handle
      products(first: 24) { nodes { ${PRODUCT_FIELDS} } }
    }
  }
  references(first: 20) {
    nodes {
      ... on Metaobject {
        fields { key value }
      }
    }
  }
`;

async function loadMetaobject(type: string, handle: string): Promise<MetaobjectFieldNode[] | null> {
  if (!shopifyConfig()) return null;
  const data = await storefront<{
    metaobject: { fields: MetaobjectFieldNode[] } | null;
  }>(
    `query SiteMetaobject($handle: MetaobjectHandleInput!) {
      metaobject(handle: $handle) { fields { ${METAOBJECT_FIELDS} } }
    }`,
    { handle: { type, handle } },
  );
  return data.metaobject?.fields ?? null;
}

/** About page copy from the `about_page` metaobject. Add story points, then attach them under Values. */
export async function loadAboutPage(): Promise<StoreAbout> {
  try {
    const fields = await loadMetaobject('about_page', 'about');
    return (fields && mapAbout(fields)) || FALLBACK_ABOUT;
  } catch {
    return FALLBACK_ABOUT;
  }
}

/** Contact page copy from the `contact_page` metaobject. */
export async function loadContactPage(): Promise<StoreContact> {
  try {
    const fields = await loadMetaobject('contact_page', 'contact');
    return (fields && mapContact(fields)) || FALLBACK_CONTACT;
  } catch {
    return FALLBACK_CONTACT;
  }
}

/** Products from the collection on the Bestseller section metaobject, then the Bestsellers collection. */
export async function loadBestsellerSection(): Promise<StoreBestsellerSection> {
  const empty: StoreBestsellerSection = { ...FALLBACK_BESTSELLER_TITLE, products: [] };
  if (!shopifyConfig()) return empty;
  try {
    const fields = await loadMetaobject('bestseller_section', 'bestsellers');
    if (fields) {
      const products = bestsellerProducts(fields, (node) => mapProduct(node as RawProductNode));
      return {
        lead: fieldText(fields, 'lead') || FALLBACK_BESTSELLER_TITLE.lead,
        accent: fieldText(fields, 'accent') || FALLBACK_BESTSELLER_TITLE.accent,
        products,
      };
    }
  } catch {
    /* fall through to the collection handle */
  }
  return { ...FALLBACK_BESTSELLER_TITLE, products: await loadBestsellers() };
}

/** Products from the Shopify collection named Bestsellers. Reorder or swap them in Admin. */
export async function loadBestsellers(): Promise<StoreProduct[]> {
  if (!shopifyConfig()) return [];
  try {
    for (const handle of BESTSELLER_HANDLES) {
      const data = await storefront<{
        collection: { products: { nodes: RawProductNode[] } } | null;
      }>(
        `query Bestsellers($handle: String!) {
          collection(handle: $handle) {
            products(first: 24) { nodes { ${PRODUCT_FIELDS} } }
          }
        }`,
        { handle },
      );
      const nodes = data.collection?.products.nodes ?? [];
      if (data.collection) return nodes.map(mapProduct);
    }
    return [];
  } catch {
    return [];
  }
}

export async function homeLoader() {
  const [catalog, promotions, bestsellers] = await Promise.all([
    loadCatalog(),
    loadPromotions(),
    loadBestsellerSection(),
  ]);
  return {
    ...catalog,
    products: applyPromotionOffers(catalog.products, promotions),
    bestsellers: {
      ...bestsellers,
      products: applyPromotionOffers(bestsellers.products, promotions),
    },
    promotions: promotions.map((promotion) => ({
      ...promotion,
      products: applyPromotionOffers(promotion.products, promotions),
    })),
  };
}

export async function aboutLoader() {
  return loadAboutPage();
}

export async function contactLoader() {
  return loadContactPage();
}

export async function productLoader({ params }: { params: { handle?: string } }) {
  if (!params.handle) {
    const catalog = await catalogLoader();
    return { product: null as StoreProduct | null, catalog };
  }
  const result = await loadProduct(params.handle);
  const promotions = await loadPromotions();
  const products = applyPromotionOffers(result.catalog.products, promotions);
  const product = result.product ? applyPromotionOffers([result.product], promotions)[0] ?? null : null;
  return { product, catalog: { ...result.catalog, products, promotions } };
}

export async function updateCartBuyer(
  cartId: string,
  buyer: { email?: string | null; phone?: string | null },
): Promise<StoreCart> {
  const buyerIdentity: { email?: string; phone?: string } = {};
  if (buyer.email) buyerIdentity.email = buyer.email;
  if (buyer.phone) buyerIdentity.phone = buyer.phone;
  const data = await storefront<{ cartBuyerIdentityUpdate: CartPayload }>(
    `mutation Buyer($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, buyerIdentity },
  );
  return cartResult(data.cartBuyerIdentityUpdate);
}

export async function removeCartLine(cartId: string, lineId: string): Promise<StoreCart> {
  const data = await storefront<{ cartLinesRemove: CartPayload }>(
    `mutation Remove($cartId: ID!, $lineId: ID!) {
      cartLinesRemove(cartId: $cartId, lineIds: [$lineId]) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lineId },
  );
  return cartResult(data.cartLinesRemove);
}
