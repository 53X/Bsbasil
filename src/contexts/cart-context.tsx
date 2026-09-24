/**
 * Cart stored in Shopify.
 * The cart id stays in this browser. Prices and stock come from Shopify
 * at checkout, which charges the payment through CC Avenue.
 */
import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { addCartLine, createCart, fetchCart, removeCartLine, updateCartLine } from '@/lib/shopify/storefront';
import type { CartLine } from '@/lib/shopify/types';

export interface AddToCartResult {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
}

interface CartContextType {
  cart: CartLine[];
  addVariant: (variantId: string, quantity?: number) => Promise<AddToCartResult>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  checkoutUrl: string | null;
  cartError: string | null;
  cartBusy: boolean;
}

const CART_KEY = 'shopify-cart-id';

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartBusy, setCartBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const applyCart = useCallback((next: { id: string; checkoutUrl: string; lines: CartLine[] } | null) => {
    if (!next) {
      setCartId(null);
      setCart([]);
      setCheckoutUrl(null);
      return;
    }
    setCartId(next.id);
    setCart(next.lines);
    setCheckoutUrl(next.checkoutUrl);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (!saved || !isShopifyConfigured()) {
      setReady(true);
      return;
    }
    fetchCart(saved)
      .then((existing) => applyCart(existing))
      .catch(() => applyCart(null))
      .finally(() => setReady(true));
  }, [applyCart]);

  useEffect(() => {
    if (!ready) return;
    if (cartId) localStorage.setItem(CART_KEY, cartId);
    else localStorage.removeItem(CART_KEY);
  }, [cartId, ready]);

  const addVariant = useCallback(async (variantId: string, quantity = 1): Promise<AddToCartResult> => {
    if (!isShopifyConfigured()) {
      return { success: false, error: 'The shop is not connected to Shopify yet.' };
    }
    setCartBusy(true);
    setCartError(null);
    try {
      const next = cartId
        ? await addCartLine(cartId, variantId, quantity)
        : await createCart(variantId, quantity);
      applyCart(next);
      return { success: true, checkoutUrl: next.checkoutUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add this item';
      const cartGone = cartId && /does not exist|expired|not found/i.test(message);
      if (cartGone) {
        try {
          const next = await createCart(variantId, quantity);
          applyCart(next);
          return { success: true, checkoutUrl: next.checkoutUrl };
        } catch (retryError) {
          const retryMessage = retryError instanceof Error ? retryError.message : 'Could not add this item';
          setCartError(retryMessage);
          return { success: false, error: retryMessage };
        }
      }
      setCartError(message);
      return { success: false, error: message };
    } finally {
      setCartBusy(false);
    }
  }, [applyCart, cartId]);

  const removeFromCart = useCallback(async (lineId: string) => {
    if (!cartId) return;
    setCartBusy(true);
    setCartError(null);
    try {
      applyCart(await removeCartLine(cartId, lineId));
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Could not update the bag');
    } finally {
      setCartBusy(false);
    }
  }, [applyCart, cartId]);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(lineId);
      return;
    }
    if (!cartId) return;
    setCartBusy(true);
    setCartError(null);
    try {
      applyCart(await updateCartLine(cartId, lineId, quantity));
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Could not update the bag');
    } finally {
      setCartBusy(false);
    }
  }, [applyCart, cartId, removeFromCart]);

  const clearCart = useCallback(() => {
    applyCart(null);
    localStorage.removeItem(CART_KEY);
  }, [applyCart]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      addVariant,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      checkoutUrl,
      cartError,
      cartBusy,
    }),
    [cart, addVariant, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, checkoutUrl, cartError, cartBusy],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
