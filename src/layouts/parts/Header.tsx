import { Link, useLocation } from 'react-router';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/use-cart';

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, ready, signOut } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Shop' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="border-b border-primary-foreground/15 bg-primary text-primary-foreground">
        <p className="mx-auto flex h-8 max-w-content items-center justify-center whitespace-nowrap px-3 text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.2em]">
          Soft cotton · Ages 0–3 · Pan-India delivery
        </p>
      </div>
      <div className="mx-auto max-w-content px-4">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/logo-180.webp"
              srcSet="/logo-180.webp 180w, /logo-280.webp 280w, /logo-horizontal.webp 360w"
              sizes="(min-width: 640px) 180px, 152px"
              alt="Bsbasil"
              className="block h-auto max-h-9 w-auto max-w-[9.5rem] object-contain sm:max-h-11 sm:max-w-[180px]"
              width={180}
              height={54}
              decoding="async"
            />
          </Link>

          <nav className="hidden items-center gap-4 lg:flex xl:gap-7" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium uppercase tracking-[0.16em]"
                  style={{ color: active ? 'hsl(var(--logo))' : 'hsl(var(--foreground))' }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {ready && user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="inline min-h-11 px-1 text-[11px] font-medium uppercase tracking-[0.08em] sm:px-2 sm:text-sm sm:tracking-[0.12em]"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/sign-in"
                className="inline-flex min-h-11 items-center px-1 text-[11px] font-medium uppercase tracking-[0.08em] sm:px-2 sm:text-sm sm:tracking-[0.12em]"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/cart"
              className="relative flex h-11 items-center gap-2 px-2 text-sm font-medium tracking-[0.14em]"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span className="max-sm:sr-only">BAG</span>
              <span className="tabular-nums" style={{ color: 'hsl(var(--logo))' }}>
                {cartCount}
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen
          ? createPortal(
              <div className="fixed inset-0 z-[80] lg:hidden" role="presentation">
                <button
                  type="button"
                  className="absolute inset-0 bg-foreground/45"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <nav
                  className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-background px-6 pb-8 pt-6 shadow-lg"
                  aria-label="Mobile navigation"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--brand-ink))' }}>
                      Menu
                    </p>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center"
                      aria-label="Close menu"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="rounded-xl px-2 py-3 text-lg font-medium uppercase tracking-[0.14em]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  {ready && user ? (
                    <button
                      type="button"
                      className="mt-4 min-h-12 rounded-full border px-4 text-sm font-semibold uppercase tracking-[0.14em]"
                      style={{ borderColor: 'hsl(var(--border))' }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                    >
                      Sign out
                    </button>
                  ) : (
                    <Link
                      to="/sign-in"
                      className="mt-4 flex min-h-12 items-center justify-center rounded-full border px-4 text-sm font-semibold uppercase tracking-[0.14em]"
                      style={{ borderColor: 'hsl(var(--border))' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  )}
                  <Link
                    to="/catalog"
                    className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Explore the collection
                  </Link>
                </nav>
              </div>,
              document.body,
            )
          : null}
      </div>
    </header>
  );
}
