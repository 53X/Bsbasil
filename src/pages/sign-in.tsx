import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Phone } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { toE164 } from '@/lib/phone';
import { takePendingPurchase } from '@/lib/pending-purchase';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/use-cart';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function missingAccount(message: string): boolean {
  return /not found|signups not allowed|does not exist|no user|otp_disabled/i.test(message);
}

export default function SignInPage() {
  const { user, ready, configured } = useAuth();
  const { addVariant, attachBuyer } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const mode = location.pathname === '/sign-up' || params.get('mode') === 'signup' ? 'signup' : 'signin';
  const signingUp = mode === 'signup';
  const [phone, setPhone] = useState(params.get('phone') ?? '');
  const [code, setCode] = useState('');
  const [phoneOpen, setPhoneOpen] = useState(Boolean(params.get('phone')));
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSignup, setNeedsSignup] = useState(false);
  const next = params.get('next') || '/';
  const otherPath = `${signingUp ? '/sign-in' : '/sign-up'}?next=${encodeURIComponent(next)}`;

  useEffect(() => {
    if (!ready || !user || needsSignup) return;
    const justCreated = Date.now() - new Date(user.created_at).getTime() < 20000;
    if (!signingUp && justCreated) {
      setNeedsSignup(true);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const pending = takePendingPurchase();
      const finish = async () => {
        if (pending?.kind === 'buy') {
          const result = await addVariant(pending.variantId, pending.quantity, pending.attributes);
          if (result.success && result.checkoutUrl) {
            const checkoutUrl = await attachBuyer(user);
            window.location.href = checkoutUrl || result.checkoutUrl;
            return;
          }
          navigate('/cart', { replace: true });
          return;
        }
        if (pending?.kind === 'checkout') {
          navigate('/cart?checkout=1', { replace: true });
          return;
        }
        navigate(next.startsWith('/') ? next : '/', { replace: true });
      };
      void finish();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [addVariant, attachBuyer, navigate, needsSignup, next, ready, signingUp, user]);

  const sendCode = async () => {
    const supabase = getSupabase();
    const e164 = toE164(phone);
    if (!supabase || !e164) {
      setError('Enter a valid phone number.');
      return;
    }
    setBusy(true);
    setError(null);
    setNeedsSignup(false);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { shouldCreateUser: signingUp },
    });
    setBusy(false);
    if (otpError) {
      if (!signingUp && missingAccount(otpError.message)) setNeedsSignup(true);
      else setError(otpError.message);
      return;
    }
    setPhone(e164);
    setCodeSent(true);
  };

  const verifyCode = async () => {
    const supabase = getSupabase();
    const e164 = toE164(phone);
    if (!supabase || !e164 || code.trim().length < 4) {
      setError('Enter the code from the text message.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code.trim(),
      type: 'sms',
    });
    setBusy(false);
    if (verifyError) {
      if (!signingUp && missingAccount(verifyError.message)) setNeedsSignup(true);
      else setError(verifyError.message);
    }
  };

  const continueWithGoogle = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const redirectTo = `${window.location.origin}/sign-in?mode=${mode}&next=${encodeURIComponent(next)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message);
    }
  };

  const buttonStyle = {
    borderColor: 'hsl(var(--border))',
    color: 'hsl(var(--foreground))',
    background: 'hsl(var(--background))',
  };

  return (
    <>
      <Helmet>
        <title>{signingUp ? 'Sign up' : 'Sign in'} — Bsbasil</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="max-w-md mx-auto px-4 py-xxl">
        <h1 className="text-3xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
          {signingUp ? 'Sign up' : 'Sign in'}
        </h1>
        <p className="text-sm mb-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {signingUp
            ? 'Create an account with Google or your phone number before you buy.'
            : 'Sign in with Google or your phone number to continue to checkout.'}
        </p>
        {!configured ? (
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Sign-in is not connected yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={busy}
              className="relative w-full flex items-center justify-center py-3 rounded-full font-semibold border disabled:opacity-60"
              style={buttonStyle}
            >
              <span className="absolute left-4 inline-flex h-5 w-5 items-center justify-center">
                <GoogleLogo />
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => { setPhoneOpen(true); setError(null); }}
              disabled={busy}
              className="relative w-full flex items-center justify-center py-3 rounded-full font-semibold border disabled:opacity-60"
              style={buttonStyle}
            >
              <span className="absolute left-4 inline-flex h-5 w-5 items-center justify-center">
                <Phone size={20} aria-hidden="true" />
              </span>
              Continue with phone number
            </button>
            {phoneOpen ? (
              <div className="rounded-2xl border p-4" style={{ borderColor: 'hsl(var(--border))' }}>
                <label className="block text-sm font-medium mb-2" htmlFor="phone" style={{ color: 'hsl(var(--foreground))' }}>
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm mb-3"
                  style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--background))' }}
                />
                {codeSent ? (
                  <>
                    <label className="block text-sm font-medium mb-2" htmlFor="code" style={{ color: 'hsl(var(--foreground))' }}>
                      Text message code
                    </label>
                    <input
                      id="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm mb-3"
                      style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--background))' }}
                    />
                    <button
                      type="button"
                      onClick={verifyCode}
                      disabled={busy}
                      className="w-full py-3 rounded-full font-semibold disabled:opacity-60"
                      style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                    >
                      {busy ? 'Checking' : signingUp ? 'Create account' : 'Sign in'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={busy}
                    className="w-full py-3 rounded-full font-semibold disabled:opacity-60"
                    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                  >
                    {busy ? 'Sending' : 'Send code'}
                  </button>
                )}
              </div>
            ) : null}
            {needsSignup ? (
              <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                No account found.{' '}
                <Link to={`${otherPath}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}`} style={{ color: 'hsl(var(--brand-ink))' }}>
                  Sign up
                </Link>
              </p>
            ) : null}
            {error ? <p className="text-sm" style={{ color: '#9b2c2c' }}>{error}</p> : null}
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {signingUp ? 'Already have an account? ' : 'New here? '}
              <Link to={otherPath} style={{ color: 'hsl(var(--brand-ink))' }}>
                {signingUp ? 'Sign in' : 'Sign up'}
              </Link>
            </p>
          </div>
        )}
        <p className="text-sm mt-lg">
          <Link to="/catalog" style={{ color: 'hsl(var(--brand-ink))' }}>Back to the shop</Link>
        </p>
      </main>
    </>
  );
}
