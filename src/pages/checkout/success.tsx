/**
 * Checkout Success Page
 *
 * Displayed after Stripe payment redirect.
 * VALIDATES payment via S2S call before showing success.
 *
 * URL: /checkout/success?session_id=cs_xxx
 *
 * Stripe enum values (for reference):
 *   session.status: "open" | "complete" | "expired"
 *   session.payment_status: "paid" | "unpaid" | "no_payment_required"
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';

import { checkout_success } from 'virtual:content';
import { useCart } from '@/contexts/use-cart';
import { formatPrice } from '@/lib/stripe/format';

interface SessionDetails {
  customerName?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string; // "paid" | "unpaid" | "no_payment_required"
  status?: string; // "open" | "complete" | "expired"
}

// Verification states
type VerificationState = 'verifying' | 'verified' | 'failed' | 'no_session';

export default function CheckoutSuccess() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [verification, setVerification] = useState<VerificationState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const firedRef = useRef(false);

  // MANDATORY: Verify payment status with Stripe before showing success
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // No session_id in URL
    if (!sessionId) {
      setVerification('no_session');
      setErrorMessage(checkout_success.errors.no_session);
      return;
    }

    if (!sessionId.startsWith('cs_')) {
      setVerification('failed');
      setErrorMessage(checkout_success.errors.invalid_format);
      return;
    }

    // Fetch session from backend (which calls Stripe API)
    fetch(`/api/stripe/session/${sessionId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve session');
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.success || !data?.session) {
          throw new Error('Invalid session response');
        }

        const session = data.session;
        setDetails(session);

        // ROBUST CHECK: Verify BOTH status AND payment_status per Stripe docs
        // status: "complete" means checkout flow finished
        // payment_status: "paid" means payment was successful
        const isComplete = session.status === 'complete';
        const isPaid = session.paymentStatus === 'paid';

        if (isComplete && isPaid) {
          const marker = sessionStorage.getItem('stripe-buy-now-session');
          sessionStorage.removeItem('stripe-buy-now-session');
          if (marker !== sessionId) {
            clearCart();
          }
          setVerification('verified');
        } else if (session.paymentStatus === 'unpaid') {
          setVerification('failed');
          setErrorMessage(checkout_success.errors.payment_not_completed);
        } else if (session.status === 'expired') {
          setVerification('failed');
          setErrorMessage(checkout_success.errors.session_expired);
        } else if (session.status === 'open') {
          setVerification('failed');
          setErrorMessage(checkout_success.errors.still_processing);
        } else {
          setVerification('failed');
          setErrorMessage(checkout_success.errors.unexpected_state);
        }
      })
      .catch((error) => {
        console.error('Payment verification failed:', error);
        setVerification('failed');
        setErrorMessage(checkout_success.errors.verification_failed);
      });
  }, [sessionId, clearCart]);

  // VERIFYING STATE - Show loading spinner
  if (verification === 'verifying') {
    return (
      <>
        <Helmet>
          <title>Verifying Payment — Bsbasil</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ background: 'hsl(var(--card))' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }}></div>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.verifying_payment_title')}</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>{t('stripe.verifying_payment_message')}</p>
          </div>
        </div>
      </>
    );
  }

  // FAILED or NO_SESSION STATE - Show error
  if (verification === 'failed' || verification === 'no_session') {
    return (
      <>
        <Helmet>
          <title>Payment Issue — Bsbasil</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ background: 'hsl(var(--card))' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'hsl(var(--secondary) / 0.2)' }}>
              <svg
                className="w-8 h-8"
                style={{ color: 'hsl(var(--secondary))' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.payment_failed_title')}</h1>
            <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>{errorMessage}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/shop"
                className="block w-full py-3 px-4 rounded-full font-medium transition-colors"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                {t('stripe.btn_try_again')}
              </Link>
              <Link
                to="/"
                className="block w-full py-3 px-4 rounded-full font-medium transition-colors"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
              >
                {t('stripe.btn_return_home')}
              </Link>
            </div>
            {sessionId && (
              <p className="mt-6 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('stripe.reference_label')}: {sessionId.slice(0, 20)}...</p>
            )}
          </div>
        </div>
      </>
    );
  }

  // VERIFIED STATE - Payment confirmed! Show success
  return (
    <>
      <Helmet>
        <title>Order Confirmed — Bsbasil</title>
        <meta name="description" content="Your Bsbasil order is confirmed. Thank you for shopping with us!" />
        <link rel="canonical" href="https://bsbasil.com/checkout/success" />
        <meta property="og:title" content="Order Confirmed — Bsbasil" />
        <meta property="og:url" content="https://bsbasil.com/checkout/success" />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center" style={{ background: 'hsl(var(--card))' }}>
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
            <svg
              className="w-8 h-8"
              style={{ color: 'hsl(var(--primary))' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.payment_success_title')}</h1>

          <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {t('stripe.payment_success_message')}
          </p>

          {/* Order details from verified session */}
          {details && (
            <div className="rounded-xl p-4 mb-6 text-left" style={{ background: 'hsl(var(--muted))' }}>
              {details.customerName && (
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.detail_name_label')}:</span> {details.customerName}
                </p>
              )}
              {details.amountTotal != null && details.currency && (
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.detail_total_label')}:</span>{' '}
                  {formatPrice(details.amountTotal, details.currency)}
                </p>
              )}
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{t('stripe.detail_status_label')}:</span>{' '}
                <span className="font-medium" style={{ color: 'hsl(var(--primary))' }}>{t('stripe.detail_status_verified')}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="block w-full py-3 px-4 rounded-full font-medium transition-colors"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              {t('stripe.btn_return_home')}
            </Link>

            <Link
              to="/shop"
              className="block w-full py-3 px-4 rounded-full font-medium transition-colors"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
            >
              {t('stripe.btn_continue_shopping')}
            </Link>
          </div>

          {sessionId && (
            <p className="mt-6 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{t('stripe.order_reference_label')}: {sessionId.slice(0, 20)}...</p>
          )}
        </div>
      </div>
    </>
  );
}
