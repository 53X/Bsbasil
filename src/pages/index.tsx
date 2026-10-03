import { useCallback, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useLoaderData } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { home } from 'virtual:content';
import HeroCube, { HERO_FACES, type HeroFace } from '@/components/HeroCube';
import type { StoreCatalog, StorePromotion } from '@/lib/shopify/types';

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
  const store = useLoaderData() as StoreCatalog & { promotions: StorePromotion[] };
  const promotions = store.promotions ?? [];
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
        'https://www.instagram.com/bs_basil_/',
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

      <main className="home-page">
        {/* ── Hero ── */}
        <section className="relative flex items-center overflow-hidden py-10 sm:py-14 lg:min-h-[85vh] lg:py-xxl">
          <div className="home-collage" aria-hidden="true">
            <img src="/home-collage.jpg" alt="" />
          </div>
          <div className="hero-orbs" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="relative z-10 max-w-content mx-auto px-4 w-full min-w-0 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-10 lg:gap-xl">
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

        {/* ── Promotions from Shopify ── */}
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
                Promotions will appear here once Shopify is connected.
              </p>
            ) : promotions.length === 0 ? (
              <p className="text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Add a Homepage promotion in Shopify and it will show up here.
              </p>
            ) : null}

          </div>

          {store.configured && promotions.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col">
              {promotions.map((promotion) => (
                <motion.div key={promotion.id} variants={fadeUp}>
                  <PromotionCard promotion={promotion} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}

          <div className="max-w-content mx-auto px-4">
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
                  className="motion-tile flex flex-col items-center justify-center gap-sm p-lg rounded-2xl border text-center"
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

function promotionPath(href: string) {
  try {
    const url = new URL(href, 'https://bsbasil.vercel.app');
    if (url.hostname === 'bsbasil.vercel.app' || url.hostname === 'bsbasil.com' || url.hostname === 'www.bsbasil.com') {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return href;
  }
  return href;
}

function PromoStamp({ offer }: { offer: string }) {
  const alreadyUrgent = /24 hours/i.test(offer);
  return (
    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col items-start gap-1.5">
      <span
        className="px-3 py-1.5 rounded-full text-sm sm:text-base font-bold uppercase tracking-wide"
        style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--brand-ink))' }}>
        {offer}
      </span>
      {alreadyUrgent ? null : (
        <span
          className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wide"
          style={{ background: 'hsl(var(--background))', color: 'hsl(var(--brand-ink))' }}>
          Sale ends in 24 hours
        </span>
      )}
    </div>
  );
}

function PromotionCard({ promotion }: { promotion: StorePromotion }) {
  const to = promotionPath(promotion.href);
  const internal = to.startsWith('/');
  const actionClass = 'inline-flex w-[220px] items-center justify-center gap-2 px-lg py-sm rounded-full font-bold text-sm';
  const actionStyle = { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' };
  const action = internal ? (
    <Link to={to} className={actionClass} style={actionStyle}>
      {promotion.buttonLabel}
      <ArrowRight size={14} />
    </Link>
  ) : (
    <a href={to} className={actionClass} style={actionStyle}>
      {promotion.buttonLabel}
      <ArrowRight size={14} />
    </a>
  );
  return (
    <article className="grid w-full items-center lg:grid-cols-[minmax(300px,1fr)_minmax(280px,1.15fr)]" style={{ background: 'hsl(var(--background))' }}>
      <div className="order-2 lg:order-1 flex flex-col justify-center gap-sm px-5 py-5 sm:px-10 lg:py-8">
        {promotion.offer ? (
          <span
            className="self-start text-xs font-bold uppercase tracking-wide px-sm py-1 rounded-full"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--brand-ink))' }}>
            {promotion.offer}
          </span>
        ) : null}
        <h3 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'hsl(var(--foreground))' }}>
          {promotion.heading}
        </h3>
        {promotion.message ? (
          <p className="text-sm sm:text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {promotion.message}
          </p>
        ) : null}
        <div className="pt-1">{action}</div>
      </div>
      <div className="order-1 lg:order-2 flex w-full justify-center px-4 py-4 sm:px-8 lg:px-8 lg:py-8">
        <div className="relative inline-block max-w-full">
          {promotion.videoUrl ? (
            <video
              className="block w-auto max-w-full h-auto max-h-[42vh] sm:max-h-[48vh] lg:max-h-[64vh] object-contain bg-muted"
              controls
              playsInline
              poster={promotion.posterUrl || undefined}
              src={promotion.videoUrl}
            />
          ) : promotion.imageUrl ? (
            <img
              src={promotion.imageUrl}
              alt={promotion.imageAlt}
              className="block w-auto max-w-full h-auto max-h-[42vh] sm:max-h-[48vh] lg:max-h-[64vh] object-contain"
            />
          ) : null}
          {promotion.offer ? <PromoStamp offer={promotion.offer} /> : null}
        </div>
      </div>
    </article>
  );
}