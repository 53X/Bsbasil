import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router';

import HomepageSameAsJsonLd from '@/components/HomepageSameAsJsonLd';
import HeadlineMotion from '@/components/motion/HeadlineMotion';
import SmoothScroll from '@/components/motion/SmoothScroll';
import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    // Bring the next pages' code down once the homepage has painted, so a
    // click does not sit there while a chunk downloads.
    const run = () => {
      void import('@/pages/catalog');
      void import('@/pages/product');
      void import('@/pages/about');
      void import('@/pages/contact');
      void import('@/pages/lookbook');
      void import('@/pages/cart');
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AuthProvider>
    <CartProvider>
      <Website>
        <Helmet>
          <title>Bsbasil — Soft, Safe Baby Clothes for Ages 0–3</title>
          <meta name="description" content="Bsbasil makes soft, safe clothing for babies and toddlers aged 0–3. Shop rompers, sets, sleepwear, winter wear and accessories." />
          <meta property="og:site_name" content="Bsbasil" />
          <meta property="og:image" content="https://bsbasil.com/og-image.png" />
          <meta property="og:image:secure_url" content="https://bsbasil.com/og-image.png" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Bsbasil — Soft, Safe Baby Clothes for Ages 0–3" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@bsbasil" />
          <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
          <meta name="twitter:image:alt" content="Bsbasil — Soft, Safe Baby Clothes for Ages 0–3" />
        </Helmet>
        <HomepageSameAsJsonLd />
        <ScrollRestoration />
        <HeadlineMotion />
        <SmoothScroll>
          <>
            <Header />
            <div id="content" className="min-w-0 flex-1 overflow-x-clip">
              {children}
            </div>
            <Footer />
          </>
        </SmoothScroll>
      </Website>
    </CartProvider>
    </AuthProvider>
  );
}
