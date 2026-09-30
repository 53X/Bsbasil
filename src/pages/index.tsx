import { useCallback, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useLoaderData } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { home } from 'virtual:content';
import HeroCube, { HERO_FACES, type HeroFace } from '@/components/HeroCube';
import ProductCard from '@/components/ProductCard';
import type { StoreCatalog } from '@/lib/shopify/types';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } }
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function HomePage() {
  const siteUrl = 'https://bsbasil.com';
  const store = useLoaderData() as StoreCatalog;
  const [face, setFace] = useState<HeroFace>(HERO_FACES[0]);
  const onFaceChange = useCallback((next: HeroFace) => setFace(next), []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
    {
      '@type': ['Organization', 'ClothingStore'],
      '@id': `${siteUrl}/#organization`,
      name: 'Bsbasil',
      url: siteUrl,
      description: 'Soft, safe & adorable baby clothes for ages 0–3 years. Rompers, onesies, sleepwear, ethnic wear and gift sets for newborns and toddlers in India.',
      logo: `${siteUrl}/og-image.png`,
      telephone: '+91-7700905962',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-7700905962',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
        contactOption: 'TollFree',
      },
      sameAs: [
        'https://www.instagram.com/bsbasil',
        'https://www.facebook.com/bsbasil',
      ],
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Bsbasil',
      publisher: { '@id': `${siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/catalog?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: 'Bsbasil — Soft, Safe Baby Clothes for Ages 0–3',
      description: 'Shop soft, safe & adorable baby clothes for ages 0–3. Rompers, onesies, sleepwear, ethnic wear and gift sets for newborns and toddlers.',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      datePublished: '2024-01-01',
      dateModified: '2026-09-21',
      inLanguage: 'en-IN',
    }]
  };

  return (
    <>
      <Helmet>
        <title>Bsbasil — Soft, Safe Baby Clothes for Ages 0–3 | India</title>
        <meta
          name="description"
          content="Shop Bsbasil — India's trusted baby clothing brand for ages 0–3. Soft rompers, onesies, ethnic wear, sleepwear & gift sets. Safe fabrics, tagless designs, pan-India delivery." />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content="Bsbasil — Soft, Safe Baby Clothes for Ages 0–3 | India" />
        <meta
          property="og:description"
          content="India's trusted baby clothing brand for ages 0–3. Rompers, onesies, ethnic wear, sleepwear & gift sets with safe fabrics and tagless designs." />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Bsbasil baby clothes collection for ages 0–3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bsbasil — Soft, Safe Baby Clothes for Ages 0–3 | India" />
        <meta name="twitter:description" content="India's trusted baby clothing brand for ages 0–3. Rompers, onesies, ethnic wear & gift sets." />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      </Helmet>

      <main>
        {/* ── Hero ── */}
        <section className="relative flex items-center py-10 sm:py-14 lg:min-h-[85vh] lg:py-xxl" style={{ background: 'hsl(var(--background))' }}>
          <div className="relative max-w-content mx-auto px-4 w-full min-w-0 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-10 lg:gap-xl">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-xl min-w-0 order-2 lg:order-1">
              <motion.p
                variants={fadeUp}
                className="inline-block px-base py-xs rounded-full text-sm font-semibold mb-base"
                style={{ background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--brand-ink))' }}>
                {home.hero.eyebrow}
              </motion.p>

              <h1
                className="font-bold leading-tight mb-6 sm:mb-xl min-h-[2.6em] text-[clamp(1.75rem,4.8vw,3.75rem)]"
                style={{ color: 'hsl(var(--foreground))' }}
                aria-live="polite">
                {face.headline}
              </h1>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-base">
                <Link
                  to={face.href}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 px-xl py-base rounded-full font-bold text-base transition-transform hover:scale-105"
                  style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                  <ShoppingBag size={18} />
                  {home.hero.cta}
                </Link>
                <Link
                  to="/about"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 px-xl py-base rounded-full font-bold text-base border transition-colors hover:bg-muted"
                  style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  {home.hero.ctaSecondary}
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
            <div className="order-1 lg:order-2 flex justify-center min-w-0 px-2 sm:px-4 py-4">
              <HeroCube onFaceChange={onFaceChange} />
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-content mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-xl">
              <h2
                className="text-3xl md:text-4xl font-bold mb-sm"
                style={{ color: 'hsl(var(--foreground))' }}>
                {home.featuredSection.title}
              </h2>
              <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {home.featuredSection.subtitle}
              </p>
            </motion.div>

            {!store.configured ? (
              <p className="text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Featured clothes will appear here once Shopify is connected.
              </p>
            ) : store.products.length === 0 ? (
              <p className="text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                The Shopify store is connected. Featured clothes will appear here once products are added.
              </p>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-base">
                {store.products.map((product) => (
                  <motion.div key={product.id} variants={fadeUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mt-xl">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-xl py-base rounded-full font-bold text-base border transition-colors hover:bg-muted"
                style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--brand-ink))' }}>
                View all products
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Shop by Age ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-content mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-xl">
              <h2
                className="text-3xl md:text-4xl font-bold mb-sm"
                style={{ color: 'hsl(var(--foreground))' }}>
                {home.ageSection.title}
              </h2>
              <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {home.ageSection.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-base">
              {home.ageGroups.map((group) =>
              <motion.div key={group.id} variants={fadeUp}>
                  <Link
                  to={`/catalog?age=${group.range}`}
                  className="flex flex-col items-center justify-center gap-sm p-lg rounded-2xl border text-center transition-transform hover:scale-105 hover:shadow-md"
                  style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
                    <span className="text-4xl">{group.emoji}</span>
                    <span className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {group.label}
                    </span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-xxl" style={{ background: '#ffffff' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-content mx-auto px-4 text-center">
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold mb-base"
              style={{ color: 'hsl(var(--foreground))' }}>
              {home.ctaBanner.title}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg mb-lg max-w-xl mx-auto"
              style={{ color: 'hsl(var(--muted-foreground))' }}>
              {home.ctaBanner.subtitle}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-xl py-base rounded-full font-bold text-base transition-transform hover:scale-105"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                <ShoppingBag size={18} />
                {home.ctaBanner.cta}
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>);

}