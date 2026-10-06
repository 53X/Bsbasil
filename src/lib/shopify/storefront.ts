import { shopifyConfig } from "./config";
import { applyCartDiscounts, applyPromotionOffers, htmlToText, mapProduct, mapShopRules, promotionOfferForHandle, saleFromOffer, type RawProductNode } from "./map";
import type { ShopRules, StoreCart, StoreCatalog, StorePolicy, StoreProduct, StorePromotion } from "./types";

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

async function previewDiscountChunk(variantIds: string[]) {
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
    `mutation Preview($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
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
    { lines: variantIds.map((merchandiseId) => ({ merchandiseId, quantity: 1 })) },
  );
  return (data.cartCreate.cart?.lines.nodes ?? []).map((line) => ({
    variantId: line.merchandise.id,
    quantity: line.quantity,
    totalAmount: line.cost.totalAmount.amount,
    subtotalAmount: line.cost.subtotalAmount.amount,
    title: line.discountAllocations.map((allocation) => allocation.title || allocation.code).filter(Boolean).join(", ") || null,
  }));
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
  if (!heading) return [];
  const picture = fieldReference(fields, "picture");
  const clip = fieldReference(fields, "clip");
  const video = clip?.sources?.find((source) => source.url)?.url || null;
  return [{
    id: node.id,
    heading,
    message: fieldValue(fields, "message"),
    offer: fieldValue(fields, "offer"),
    buttonLabel: fieldValue(fields, "button_label") || "Shop now",
    href: fieldValue(fields, "link") || "/catalog",
    imageUrl: picture?.image?.url || null,
    imageAlt: picture?.image?.altText || heading,
    videoUrl: video,
    posterUrl: clip?.previewImage?.url || picture?.image?.url || null,
  }];
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
    return promotions;
  } catch {
    return promotions;
  }
}

export async function homeLoader() {
  const catalog = await loadCatalog();
  const promotions = await loadPromotions();
  return {
    ...catalog,
    products: applyPromotionOffers(catalog.products, promotions),
    promotions,
  };
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
