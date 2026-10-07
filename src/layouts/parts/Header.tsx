import { Link, useLocation } from 'react-router';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/use-cart';

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, ready, signOut } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Shop' },
    { href: '/#moods', label: 'Lookbook' },
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
      <div className="border-b border-[#122117]/15 bg-[#62A848] text-[#122117]">
        <p className="mx-auto flex h-8 max-w-content items-center justify-center whitespace-nowrap px-3 text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.2em]">
          Soft cotton · Ages 0–3 · Pan-India delivery
        </p>
      </div>
      <div className="mx-auto max-w-content px-4">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/logo-horizontal.webp"
              alt="Bsbasil"
              className="block h-auto max-h-9 w-auto max-w-[9.5rem] object-contain sm:max-h-11 sm:max-w-[180px]"
              width={180}
              height={48}
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
                className="hidden min-h-11 px-2 text-sm font-medium uppercase tracking-[0.12em] sm:inline"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/sign-in"
                className="hidden min-h-11 items-center px-2 text-sm font-medium uppercase tracking-[0.12em] sm:inline-flex"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/cart"
              className="relative flex h-11 items-center gap-2 px-2 text-sm font-medium uppercase tracking-[0.14em]"
              aria-label={`BAG ${cartCount}`}
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Bag</span>
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

        {isMobileMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-foreground/10 py-3 lg:hidden" aria-label="Mobile navigation">
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
            {ready && user ? (
              <button
                type="button"
                className="rounded-xl px-2 py-3 text-left text-lg font-medium uppercase tracking-[0.14em]"
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
                className="rounded-xl px-2 py-3 text-lg font-medium uppercase tracking-[0.14em]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
            <Link
              to="/catalog"
              className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore the collection
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
