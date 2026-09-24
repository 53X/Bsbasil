import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router';

import HomepageSameAsJsonLd from '@/components/HomepageSameAsJsonLd';
import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { CartProvider } from '@/contexts/cart-context';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <CartProvider>
      <Website>
        <Helmet>
          <title>Bsbasil — Soft, Safe Baby Clothes for Ages 0–3</title>
          <meta name="description" content="Bsbasil makes soft, safe, and adorable clothing for babies and toddlers aged 0–3 years. Shop rompers, onesies, sleepsuits, gift sets and more." />
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
        <Header />
        {children}
        <Footer />
      </Website>
    </CartProvider>
  );
}
