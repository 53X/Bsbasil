const KEY = 'bsb-pending-purchase';

export type PendingPurchase =
  | { kind: 'checkout' }
  | {
      kind: 'buy';
      variantId: string;
      quantity: number;
      attributes?: Array<{ key: string; value: string }>;
    };

export function savePendingPurchase(purchase: PendingPurchase): void {
  sessionStorage.setItem(KEY, JSON.stringify(purchase));
}

export function takePendingPurchase(): PendingPurchase | null {
  const raw = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingPurchase;
    if (parsed?.kind === 'checkout') return parsed;
    if (parsed?.kind === 'buy' && typeof parsed.variantId === 'string') return parsed;
  } catch {
    return null;
  }
  return null;
}
