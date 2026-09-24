/**
 * Checkout Cancel Page
 *
 * Displayed when user cancels Stripe checkout.
 * No payment was made.
 *
 * URL: /checkout/cancel
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';

export default function CheckoutCancel() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>Order Cancelled — Bsbasil</title>
        <meta name="description" content="Your Bsbasil order was cancelled. No payment was taken. Return to the shop and continue browsing." />
        <link rel="canonical" href="https://bsbasil.com/checkout/cancel" />
        <meta property="og:title" content="Order Cancelled — Bsbasil" />
        <meta property="og:description" content="Your order was cancelled. No payment was taken." />
        <meta property="og:url" content="https://bsbasil.com/checkout/cancel" />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ background: 'hsl(var(--card))' }}>
          {/* Cancel Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'hsl(var(--muted))' }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            {t('stripe.payment_cancelled_title')}
          </h1>

          <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('stripe.payment_cancelled_message')}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/shop"
              className="block w-full py-3 px-4 rounded-full font-medium transition-colors"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              {t('stripe.btn_continue_shopping')}
            </Link>

            <Link
              to="/"
              className="block w-full py-3 px-4 rounded-full font-medium transition-colors"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
            >
              {t('stripe.btn_go_home')}
            </Link>
          </div>

          <p className="mt-6 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('stripe.need_help_text')}{' '}
            <Link to="/contact" className="hover:underline" style={{ color: 'hsl(var(--primary))' }}>
              {t('stripe.contact_support_link')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
