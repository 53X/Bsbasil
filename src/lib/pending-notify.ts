const KEY = 'bsb-pending-notify';

export type PendingNotify = {
  handle: string;
  variantId: string;
  selection: string;
  path: string;
};

function storage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function savePendingNotify(notify: PendingNotify): void {
  storage()?.setItem(KEY, JSON.stringify(notify));
}

export function peekPendingNotify(): PendingNotify | null {
  return read(storage()?.getItem(KEY) ?? null);
}

export function takePendingNotify(): PendingNotify | null {
  const pending = peekPendingNotify();
  storage()?.removeItem(KEY);
  return pending;
}

function read(raw: string | null): PendingNotify | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingNotify;
    if (parsed?.handle && parsed.path?.startsWith('/')) return parsed;
  } catch {
    return null;
  }
  return null;
}
