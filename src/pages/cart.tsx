/**
 * Cart Page
 *
 * Displays cart items with quantity controls and checkout.
 * Uses shared CartContext for state management.
 *
 * Route: /cart
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';

import { useCart } from '@/contexts/use-cart';
import PriceTag from '@/components/PriceTag';
import { formatPrice } from '@/lib/stripe/format';

export default function CartPage() {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, checkoutUrl, cartError } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!checkoutUrl) {
      setError('Checkout is not ready yet. Connect Shopify, then try again.');
      return;
    }
    setCheckingOut(true);
    setError(null);
    window.location.href = checkoutUrl;
  };

  return (
    <>
      <Helmet>
        <title>Your Cart — Bsbasil</title>
        <meta name="description" content="Review your Bsbasil baby clothing selections and proceed to checkout." />
        <link rel="canonical" href="https://bsbasil.com/cart" />
        <meta property="og:title" content="Your Cart — Bsbasil" />
        <meta property="og:description" content="Review your Bsbasil baby clothing selections and proceed to checkout." />
        <meta property="og:url" content="https://bsbasil.com/cart" />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center mb-4 transition-colors"
            style={{ color: 'hsl(var(--primary))' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('stripe.link_continue_shopping')}
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.cart_title')}</h1>
          <p className="mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{cartCount} {cartCount === 1 ? t('stripe.item_singular') : t('stripe.items_plural')}</p>
        </div>

        {/* Error Message */}
        {(error || cartError) && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: 'hsl(var(--error-bg))', borderColor: 'hsl(var(--error-border))' }}>
            <p style={{ color: 'hsl(var(--error-text))' }}>{error || cartError}</p>
          </div>
        )}

        {cart.length === 0 ? (
          /* Empty Cart */
          <div className="rounded-2xl shadow-sm p-12 text-center" style={{ background: 'hsl(var(--card))' }}>
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.empty_cart_title')}</h2>
            <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('stripe.empty_cart_message')}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-full font-medium transition-colors"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              {t('stripe.btn_browse_store')}
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="rounded-2xl shadow-sm overflow-hidden mb-6" style={{ background: 'hsl(var(--card))' }}>
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-6 ${index > 0 ? 'border-t' : ''}`}
                  style={index > 0 ? { borderColor: 'hsl(var(--border))' } : {}}
                >
                  {/* Product Image */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--muted))' }}>
                      <svg className="w-10 h-10" style={{ color: 'hsl(var(--muted-foreground))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>{item.name}</h3>
                    {item.variantTitle ? <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.variantTitle}</p> : null}
                    <PriceTag
                      price={item.price}
                      compareAt={item.compareAtPrice}
                      currency={item.currency}
                      discount={item.discountTitle}
                      priceClassName="font-medium"
                    />
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { void updateQuantity(item.id, item.quantity - 1); }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border text-lg font-medium transition-colors"
                      style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-lg" style={{ color: 'hsl(var(--foreground))' }}>{item.quantity}</span>
                    <button
                      onClick={() => { void updateQuantity(item.id, item.quantity + 1); }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border text-lg font-medium transition-colors"
                      style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[100px]">
                    <p className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => { void removeFromCart(item.id); }}
                    className="p-2 transition-colors"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl shadow-sm p-6" style={{ background: 'hsl(var(--card))' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.order_summary_title')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <span>{t('stripe.subtotal_label')} ({cartCount} {cartCount === 1 ? t('stripe.item_singular') : t('stripe.items_plural')})</span>
                  <span>{formatPrice(cartTotal, cart[0]?.currency || 'usd')}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  <span>{t('stripe.total_label')}</span>
                  <span>{formatPrice(cartTotal, cart[0]?.currency || 'usd')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-4 px-6 rounded-full font-medium text-lg transition-colors disabled:opacity-60"
                style={checkingOut
                  ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                  : { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                }
              >
                {checkingOut ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('stripe.btn_processing')}
                  </span>
                ) : (
                  t('stripe.btn_proceed_to_checkout')
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-3 py-2 text-sm transition-colors"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {t('stripe.btn_clear_cart')}
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}

