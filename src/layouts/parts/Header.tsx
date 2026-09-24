import { Link, useLocation } from 'react-router';
import { Menu, X, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/use-cart';

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
      <div className="max-w-content mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/airo-assets/images/logo/horizontal"
              alt="Bsbasil"
              className="block h-auto max-h-10 md:max-h-12 w-auto max-w-[180px] object-contain self-center"
              width={180}
              height={48}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium transition-colors"
                style={{
                  color:
                    location.pathname === item.href
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full transition-colors hover:bg-muted"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} style={{ color: 'hsl(var(--foreground))' }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              style={{
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              <ShoppingBag size={16} />
              Shop Now
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4" style={{ borderColor: 'hsl(var(--border))' }}>
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium py-2 px-2 rounded-md transition-colors"
                  style={{
                    color:
                      location.pathname === item.href
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))',
                    background:
                      location.pathname === item.href ? 'hsl(var(--muted))' : 'transparent',
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
