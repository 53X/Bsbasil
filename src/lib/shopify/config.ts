/**
 * Public Shopify Storefront credentials.
 * The storefront token is meant for the browser. It can read the catalog
 * and manage a cart. It cannot edit products or see orders.
 *
 * In Shopify admin: Settings → Apps → Develop apps → Storefront API.
 * Enable products, inventory (optional), and carts.
 */

export interface ShopifyConfig {
  domain: string;
  token: string;
  endpoint: string;
}

const API_VERSION = "2026-07";

export function shopifyConfig(): ShopifyConfig | null {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain || !token) return null;

  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return {
    domain: host,
    token,
    endpoint: `https://${host}/api/${API_VERSION}/graphql.json`,
  };
}

export function isShopifyConfigured(): boolean {
  return shopifyConfig() !== null;
}
