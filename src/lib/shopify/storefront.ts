import { shopifyConfig } from "./config";
import { htmlToText, mapProduct, mapShopRules, type RawProductNode } from "./map";
import type { ShopRules, StoreCart, StoreCatalog, StorePolicy, StoreProduct } from "./types";

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  productType
  tags
  availableForSale
  featuredImage { url altText }
  options { name values }
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
      merchandise {
        ... on ProductVariant {
          id
          title
          image { url }
          price { amount currencyCode }
          product { title }
        }
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
        merchandise: {
          id: string;
          title: string;
          image?: { url: string } | null;
          price: { amount: string; currencyCode: string };
          product: { title: string };
        };
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

    for (let page = 0; page < 4; page += 1) {
      const data: ProductsData = await storefront<ProductsData>(
        `query Products($cursor: String) {
          products(first: 50, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } }
          shop { ${SHOP_FIELDS} }
        }`,
        { cursor },
      );
      products.push(...data.products.nodes.map(mapProduct));
      details = shopDetails(data.shop);
      if (!data.products.pageInfo.hasNextPage) break;
      cursor = data.products.pageInfo.endCursor;
    }

    const value: StoreCatalog = { configured: true, products, ...details, error: null };
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
      product: data.product ? mapProduct(data.product) : null,
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

function mapCart(cart: NonNullable<CartPayload["cart"]>): StoreCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines.nodes.map((line) => ({
      id: line.id,
      variantId: line.merchandise.id,
      name: line.merchandise.product.title,
      variantTitle: line.merchandise.title === "Default Title" ? "" : line.merchandise.title,
      price: Math.round(Number(line.merchandise.price.amount) * 100),
      currency: line.merchandise.price.currencyCode,
      quantity: line.quantity,
      image: line.merchandise.image?.url,
    })),
  };
}

async function cartResult(payload: CartPayload): Promise<StoreCart> {
  const message = payload.userErrors.map((error) => error.message).join(", ");
  if (!payload.cart) throw new Error(message || "Cart update failed");
  return mapCart(payload.cart);
}

export async function fetchCart(cartId: string): Promise<StoreCart | null> {
  const data = await storefront<{ cart: CartPayload["cart"] }>(
    `query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
    { id: cartId },
  );
  return data.cart ? mapCart(data.cart) : null;
}

export async function createCart(variantId: string, quantity: number): Promise<StoreCart> {
  const data = await storefront<{ cartCreate: CartPayload }>(
    `mutation Create($variantId: ID!, $quantity: Int!) {
      cartCreate(input: { lines: [{ merchandiseId: $variantId, quantity: $quantity }] }) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { variantId, quantity },
  );
  return cartResult(data.cartCreate);
}

export async function addCartLine(cartId: string, variantId: string, quantity: number): Promise<StoreCart> {
  const data = await storefront<{ cartLinesAdd: CartPayload }>(
    `mutation Add($cartId: ID!, $variantId: ID!, $quantity: Int!) {
      cartLinesAdd(cartId: $cartId, lines: [{ merchandiseId: $variantId, quantity: $quantity }]) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, variantId, quantity },
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
  return loadCatalog();
}

export async function homeLoader() {
  const catalog = await loadCatalog();
  const featured = catalog.products.filter((product) => product.featured);
  return {
    ...catalog,
    products: featured.length > 0 ? featured.slice(0, 8) : catalog.products.slice(0, 4),
  };
}

export async function productLoader({ params }: { params: { handle?: string } }) {
  if (!params.handle) {
    return { product: null as StoreProduct | null, catalog: await loadCatalog() };
  }
  return loadProduct(params.handle);
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
