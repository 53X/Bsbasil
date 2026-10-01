import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Request, Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { customerRestockMessage, isEmail, ownerRestockMessage } from '../lib/restock-messages';

function loadLocalEnv(): void {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 1) continue;
    const key = trimmed.slice(0, index);
    if (!process.env[key]) process.env[key] = trimmed.slice(index + 1);
  }
}

loadLocalEnv();

const OWNER_EMAIL = 'packology.ent@gmail.com';
const SITE_URL = 'https://bsbasil.vercel.app';

export interface RestockAlert {
  id: string;
  product_handle: string;
  product_title: string;
  variant_id: string;
  selection: string;
  customer_phone: string;
  status: 'waiting' | 'notified';
}

interface ShopifyVariant {
  id: string;
  availableForSale: boolean;
}

function env(name: string): string {
  return process.env[name]?.trim() ?? '';
}

function shopifyEndpoint(): { endpoint: string; token: string } | null {
  const domain = env('VITE_SHOPIFY_STORE_DOMAIN').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const token = env('VITE_SHOPIFY_STOREFRONT_TOKEN');
  if (!domain || !token) return null;
  return { endpoint: `https://${domain}/api/2026-07/graphql.json`, token };
}

function supabaseAdmin(): SupabaseClient | null {
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = env('RESEND_API_KEY');
  const from = env('RESTOCK_FROM_EMAIL') || 'Bsbasil <onboarding@resend.dev>';
  if (!key) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!response.ok) {
    console.error('restock.email', response.status);
    return false;
  }
  return true;
}

function alertEmail(alert: RestockAlert): string {
  const saved = alert.customer_phone.trim();
  return isEmail(saved) ? saved : '';
}

async function shopifyProduct(handle: string): Promise<{ title: string; variants: ShopifyVariant[] } | null> {
  const shop = shopifyEndpoint();
  if (!shop) return null;
  const response = await fetch(shop.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shop.token,
    },
    body: JSON.stringify({
      query: `query RestockProduct($handle: String!) {
        product(handle: $handle) {
          title
          variants(first: 50) { nodes { id availableForSale } }
        }
      }`,
      variables: { handle },
    }),
  });
  if (!response.ok) return null;
  const payload = await response.json() as {
    errors?: { message: string }[];
    data?: { product?: { title: string; variants: { nodes: ShopifyVariant[] } } | null };
  };
  if (payload.errors?.length) {
    console.error('restock.shopify', payload.errors.map((error) => error.message).join('; '));
    return null;
  }
  const product = payload.data?.product;
  if (!product) return null;
  return { title: product.title, variants: product.variants.nodes };
}

function variantAvailable(variants: ShopifyVariant[], variantId: string): boolean {
  if (variantId) {
    const match = variants.find((variant) => variant.id === variantId);
    return Boolean(match?.availableForSale);
  }
  return variants.some((variant) => variant.availableForSale);
}

function productUrl(handle: string): string {
  return `${SITE_URL}/products/${handle}`;
}

export async function createRestockAlert(req: Request, res: Response): Promise<void> {
  const body = req.body ?? {};
  const handle = String(body.handle ?? '').trim();
  const selection = String(body.selection ?? '').trim().slice(0, 120);
  const variantId = String(body.variantId ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!handle || !isEmail(email)) {
    res.status(400).json({ error: 'Sign in so we can email you.' });
    return;
  }

  if (!shopifyEndpoint()) {
    res.status(503).json({ error: 'Stock checks are not connected yet.' });
    return;
  }
  const product = await shopifyProduct(handle);
  if (!product) {
    res.status(404).json({ error: 'That product is not on the shop right now.' });
    return;
  }
  if (variantAvailable(product.variants, variantId)) {
    res.status(409).json({ error: 'This one is in stock. You can buy it now.' });
    return;
  }

  const db = supabaseAdmin();
  if (!db) {
    res.status(503).json({ error: 'Stock alerts are not connected yet.' });
    return;
  }

  const existing = await db
    .from('restock_alerts')
    .select('id')
    .eq('product_handle', handle)
    .eq('variant_id', variantId)
    .eq('customer_phone', email)
    .eq('status', 'waiting')
    .maybeSingle();
  if (existing.error) {
    res.status(500).json({ error: 'Could not save this request.' });
    return;
  }
  if (!existing.data) {
    const inserted = await db.from('restock_alerts').insert({
      product_handle: handle,
      product_title: product.title,
      variant_id: variantId,
      selection,
      customer_phone: email,
      status: 'waiting',
    });
    if (inserted.error) {
      res.status(500).json({ error: 'Could not save this request.' });
      return;
    }
    const owner = env('RESTOCK_OWNER_EMAIL') || OWNER_EMAIL;
    const item = product.title;
    const sent = await sendEmail(
      owner,
      `${item} is sold out`,
      ownerRestockMessage({ email, title: product.title, selection }),
    );
    if (!sent) {
      await db.from('restock_alerts').delete().eq('product_handle', handle).eq('variant_id', variantId).eq('customer_phone', email).eq('status', 'waiting');
      res.status(503).json({ error: 'Email alerts are not connected yet.' });
      return;
    }
  }

  res.json({ ok: true });
}

export async function sweepRestockAlerts(_req: Request, res: Response): Promise<void> {
  const secret = env('CRON_SECRET');
  const header = _req.header('authorization') ?? '';
  if (secret && header !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const db = supabaseAdmin();
  if (!db) {
    res.status(503).json({ error: 'Stock alerts are not connected yet.' });
    return;
  }
  const waiting = await db.from('restock_alerts').select('*').eq('status', 'waiting');
  if (waiting.error) {
    res.status(500).json({ error: 'Could not read stock alerts.' });
    return;
  }
  const alerts = (waiting.data ?? []) as RestockAlert[];
  let notified = 0;
  for (const alert of alerts) {
    const product = await shopifyProduct(alert.product_handle);
    if (!product || !variantAvailable(product.variants, alert.variant_id)) continue;
    const email = alertEmail(alert);
    if (!email) continue;
    const sent = await sendEmail(email, `${product.title} is back in stock`, customerRestockMessage({
      title: product.title,
      selection: alert.selection,
      url: productUrl(alert.product_handle),
    }));
    if (!sent) continue;
    const updated = await db
      .from('restock_alerts')
      .update({ status: 'notified', notified_at: new Date().toISOString() })
      .eq('id', alert.id)
      .eq('status', 'waiting');
    if (!updated.error) notified += 1;
  }
  res.json({ ok: true, checked: alerts.length, notified });
}
