import { useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useLoaderData } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { home } from 'virtual:content';
import ArrivalRail from '@/components/motion/ArrivalRail';
import CinematicHero from '@/components/motion/CinematicHero';
import Marquee from '@/components/motion/Marquee';
import MoodRail from '@/components/motion/MoodRail';
import type { StoreCatalog, StorePromotion } from '@/lib/shopify/types';

export default function HomePage() {
  const siteUrl = 'https://bsbasil.com';
  const store = useLoaderData() as StoreCatalog & { promotions: StorePromotion[] };
  const promotions = store.promotions ?? [];
  const arrivals = (store.products ?? []).slice(0, 8);
  const ageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ageRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let revert = () => {};
    let cancelled = false;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled) return;
      const gsap = gsapMod.default;
      gsap.registerPlugin(scrollMod.ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.from('[data-age-row]', {
          x: 72,
          opacity: 0,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            end: 'bottom 55%',
            scrub: 0.6,
          },
        });
      }, root);
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let revert = () => {};
    let cancelled = false;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const photos = document.querySelectorAll('[data-shop-photo]');
      if (!photos.length) return;
      const ctx = gsap.context(() => {
        photos.forEach((photo) => {
          gsap.from(photo, {
            autoAlpha: 0,
            y: 56,
            ease: 'none',
            scrollTrigger: {
              trigger: photo,
              start: 'top 92%',
              end: 'top 58%',
              scrub: 0.7,
            },
          });
        });
      });
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, [promotions.length]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ClothingStore'],
        '@id': `${siteUrl}/#organization`,
        name: 'Bsbasil',
        url: siteUrl,
        description:
          'Soft, safe baby clothes for ages 0–3. Rompers, sets, sleepwear, winter wear and accessories.',
        logo: `${siteUrl}/og-image.png`,
        telephone: '+91-7700905962',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-7700905962',
          contactType: 'customer service',
          availableLanguage: ['English', 'Hindi'],
          contactOption: 'TollFree',
        },
        sameAs: ['https://www.instagram.com/bs_basil_/', 'https://www.facebook.com/bsbasil'],
        areaServed: { '@type': 'Country', name: 'India' },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Bsbasil',
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/catalog?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: siteUrl,
        name: 'Bsbasil — Soft, Safe Baby Clothes for Ages 0–3',
        description:
          'Shop soft, safe baby clothes for ages 0–3. Rompers, sets, sleepwear, winter wear and accessories.',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
        datePublished: '2024-01-01',
        dateModified: '2026-10-05',
        inLanguage: 'en-IN',
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Bsbasil — Soft, Safe Baby Clothes for Ages 0–3 | India</title>
        <meta
          name="description"
          content="Shop Bsbasil — soft baby clothes for ages 0–3. Rompers, sets, sleepwear, winter wear and accessories. Safe fabrics, tagless designs, pan-India delivery."
        />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content="Bsbasil — Soft, Safe Baby Clothes for Ages 0–3 | India" />
        <meta
          property="og:description"
          content="Soft baby clothes for ages 0–3. Rompers, sets, sleepwear, winter wear and accessories, with safe fabrics and tagless designs."
        />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Bsbasil baby clothes collection for ages 0–3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bsbasil — Soft, Safe Baby Clothes for Ages 0–3 | India" />
        <meta
          name="twitter:description"
          content="Soft baby clothes for ages 0–3. Rompers, sets, sleepwear, winter wear and accessories."
        />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <main>
        <CinematicHero eyebrow={home.hero.eyebrow} subtitle={home.hero.subtitle} />

        <Marquee items={home.trustBadges.map((badge) => badge.label)} />

        <div id="moods">
          <MoodRail />
        </div>

        <section ref={ageRef} className="border-t border-foreground/10 py-16">
          <div className="mx-auto grid max-w-content gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'hsl(var(--brand-ink))' }}>
                Start here
              </p>
              <h2 className="text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.9]">
                SHOP
                <br />
                <em>by age.</em>
              </h2>
            </div>
            <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
              {home.ageGroups.map((group, index) => (
                <li key={group.id} data-age-row>
                  <Link
                    to={`/catalog?age=${group.range}`}
                    className="group flex min-h-16 items-center justify-between gap-4 py-3"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="text-xs tracking-[0.18em]" style={{ color: 'hsl(var(--logo))' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-2xl uppercase tracking-wide md:text-3xl">{group.label}</span>
                    </span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ArrivalRail products={arrivals} />

        <section className="py-16">
          <div className="mx-auto mb-10 max-w-content px-4">
            <h2 className="text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.9]">{home.featuredSection.title}</h2>
            <p className="mt-3 max-w-md text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {home.featuredSection.subtitle}
            </p>
          </div>
          {!store.configured ? (
            <p className="px-4 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Promotions will appear here once Shopify is connected.
            </p>
          ) : promotions.length === 0 ? (
            <p className="px-4 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Add a Homepage promotion in Shopify and it will show up here.
            </p>
          ) : (
            <div className="flex flex-col">
              {promotions.map((promotion, index) => (
                <PromotionCard key={promotion.id} promotion={promotion} index={index} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-[#122117] py-20 text-[#F6F3EA]">
          <div className="mx-auto grid max-w-content gap-10 px-4 md:grid-cols-2">
            <h2 className="text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.9] text-[#F6F3EA]">
              {home.whyUs.title}
            </h2>
            <ul className="divide-y divide-white/15">
              {home.whyUs.items.map((item, index) => (
                <li key={item.id} className="grid grid-cols-[auto_1fr] gap-4 py-5">
                  <span className="text-xs tracking-[0.18em] text-[#62A848]">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-2xl uppercase text-[#F6F3EA]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#F6F3EA]/75">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
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

function PromotionCard({ promotion, index }: { promotion: StorePromotion; index: number }) {
  const to = promotionPath(promotion.href);
  const internal = to.startsWith('/');
  const flip = index % 2 === 1;
  const actionClass =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#62A848] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-[#122117]';
  const action = internal ? (
    <Link to={to} className={actionClass}>
      {promotion.buttonLabel}
      <ArrowRight size={14} />
    </Link>
  ) : (
    <a href={to} className={actionClass}>
      {promotion.buttonLabel}
      <ArrowRight size={14} />
    </a>
  );

  return (
    <article className="border-t border-foreground/10">
      <div className={`mx-auto grid max-w-content items-center gap-8 px-4 py-12 lg:grid-cols-2 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          {promotion.offer ? (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--brand-ink))' }}>
              {promotion.offer}
            </p>
          ) : null}
          <h3 className="text-[clamp(1.8rem,4vw,3.4rem)] leading-[0.92]">{promotion.heading}</h3>
          {promotion.message ? (
            <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {promotion.message}
            </p>
          ) : null}
          <div className="mt-6">{action}</div>
        </div>
        <div data-shop-photo className="overflow-hidden rounded-[1.25rem]">
          {promotion.videoUrl ? (
            <video
              className="mx-auto block h-auto max-h-[min(70vh,36rem)] w-auto max-w-full"
              controls
              playsInline
              poster={promotion.posterUrl || undefined}
              src={promotion.videoUrl}
            />
          ) : promotion.imageUrl ? (
            <img
              src={promotion.imageUrl}
              alt={promotion.imageAlt}
              className="mx-auto block h-auto max-h-[min(70vh,36rem)] w-auto max-w-full"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
