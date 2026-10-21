import { useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useLoaderData } from 'react-router';
import { Leaf, Heart, Globe, ShieldCheck, Sparkles, Baby, Recycle } from 'lucide-react';
import type { StoreAbout } from '@/lib/shopify/types';

const valuesMeta = [
  {
    icon: Leaf
  },
  {
    icon: Heart
  },
  {
    icon: Globe
  },
];

const badgesMeta = [
  {
    icon: ShieldCheck
  },
  {
    icon: Sparkles
  },
  {
    icon: Baby
  },
  {
    icon: Recycle
  },
];

export function AboutView({ content, embedded = false }: { content: StoreAbout; embedded?: boolean }) {
  const siteUrl = 'https://bsbasil.com';
  const pageUrl = `${siteUrl}/about`;
  const Frame = embedded ? 'div' : 'main';

  return (
    <>
      {embedded ? null : (
      <Helmet>
        <title>About Bsbasil — Indian Baby Clothing Brand for Ages 0–3</title>
        <meta
          name="description"
          content="Bsbasil is an Indian baby clothing brand for ages 0–3, founded by parents who believe every baby deserves soft, safe & beautiful clothes. Discover our story and values."
        />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="About Bsbasil — Indian Baby Clothing Brand for Ages 0–3" />
        <meta
          property="og:description"
          content="Founded by parents for parents — Bsbasil makes soft, safe & beautiful baby clothes for ages 0–3 years in India."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Bsbasil — Indian baby clothing brand for ages 0–3" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Bsbasil — Indian Baby Clothing Brand for Ages 0–3" />
        <meta name="twitter:description" content="Founded by parents for parents — Bsbasil makes soft, safe & beautiful baby clothes for ages 0–3 years in India." />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': `${pageUrl}#webpage`,
          name: 'About Bsbasil — Indian Baby Clothing Brand for Ages 0–3',
          url: pageUrl,
          description: 'Bsbasil is an Indian baby clothing brand for ages 0–3, founded by parents who believe every baby deserves soft, safe & beautiful clothes.',
          isPartOf: { '@id': `${siteUrl}/#website` },
          about: { '@id': `${siteUrl}/#organization` },
          inLanguage: 'en-IN',
        }).replace(/</g, '\\u003c')}</script>
      </Helmet>
      )}
      <Frame data-script-ink>
        <AboutReveal />
        {/* ── Hero ── */}
        <section className="relative" style={{ background: 'hsl(var(--muted))' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/airo-assets/images/pages/about/hero"
              alt="Mother and baby in soft Bsbasil clothing"
              className="w-full h-full object-cover opacity-20"
              width={1400}
              height={600}
              sizes="100vw"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
          <div className="relative max-w-content mx-auto px-4 py-xxxl text-center">
            <div>
              <p
                data-about-reveal
                className="text-sm font-semibold tracking-wide mb-sm"
                style={{ color: 'hsl(var(--brand-ink))' }}
              >
                {content.eyebrow}
              </p>
              <h1
                data-about-reveal
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-lg leading-[1.05]"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {content.heading}
                {content.headingAccent ? (
                  <em className="mt-[0.55em] block text-[0.92em] leading-[1.15]">{content.headingAccent}</em>
                ) : null}
              </h1>
              <p
                data-about-reveal
                className="text-lg md:text-xl max-w-2xl mx-auto mb-lg"
                style={{ color: 'hsl(var(--mutedForeground, var(--muted-foreground)))' }}
              >
                <AccentText text={content.lede} phrase="as gentle as they are adorable" />
              </p>
              <p
                data-about-reveal
                className="text-base max-w-xl mx-auto"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {content.story}
              </p>
            </div>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-content mx-auto px-4">
            <div data-about-reveal className="text-center mb-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-sm leading-[1.05]" style={{ color: 'hsl(var(--foreground))' }}>
                {content.valuesHeading}
                {content.valuesHeadingAccent ? (
                  <em className="mt-[0.55em] block text-[0.92em] leading-[1.15]">{content.valuesHeadingAccent}</em>
                ) : null}
              </h2>
              <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <AccentText text={content.valuesIntro} phrase="three core promises" />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-base">
              {content.values.map((v, _airoIdx) => {
                const Icon = valuesMeta[_airoIdx % valuesMeta.length].icon;
                const tone = [
                  { color: 'hsl(var(--success))', bg: 'hsl(var(--muted))' },
                  { color: 'hsl(var(--primary))', bg: 'hsl(var(--card))' },
                  { color: 'hsl(var(--info))', bg: 'hsl(var(--muted))' },
                ][_airoIdx % 3];

                return (
                  <div
                    key={v.title}
                    data-about-reveal
                    className="rounded-2xl p-lg flex flex-col items-center text-center border"
                    style={{ background: tone.bg, borderColor: 'hsl(var(--border))' }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-base"
                      style={{ background: 'hsl(var(--background))' }}
                    >
                      <Icon size={28} style={{ color: tone.color }} />
                    </div>
                    <h3 className="italic-accent mb-sm text-[clamp(1.7rem,2.5vw,2.15rem)] leading-[1.2]">
                      {v.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Safety Promise ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-content mx-auto px-4">
            <div className="text-center">
              <div data-about-reveal className="mb-sm">
                <ShieldCheck size={48} style={{ color: 'hsl(var(--brand-ink))', margin: '0 auto' }} />
              </div>
              <h2
                data-about-reveal
                className="text-3xl md:text-4xl font-bold mb-base leading-[1.05]"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {content.safetyHeading}
                {content.safetyHeadingAccent ? (
                  <em className="mt-[0.55em] block text-[0.92em] leading-[1.15]">{content.safetyHeadingAccent}</em>
                ) : null}
              </h2>
              <p
                data-about-reveal
                className="text-base md:text-lg max-w-2xl mx-auto mb-xl leading-relaxed"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <AccentText text={content.safetyBody} phrase="nothing less" />
              </p>

              <div className="flex flex-wrap justify-center gap-base">
                {content.badges.map((label, _airoIdx) => {
                  const Icon = badgesMeta[_airoIdx % badgesMeta.length].icon;

                  return (
                    <div
                      key={label}
                      data-about-reveal
                      className="flex items-center gap-sm px-lg py-sm rounded-full border font-medium text-sm"
                      style={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      <Icon size={18} style={{ color: 'hsl(var(--brand-ink))' }} />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Founder Note ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-content mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-xl">
              <div data-about-reveal className="flex-shrink-0">
                <img
                  src="/airo-assets/images/pages/about/founder"
                  alt="Bsbasil founder with her baby"
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4"
                  style={{ borderColor: 'hsl(var(--primary))' }}
                  width={256}
                  height={256}
                  sizes="(min-width: 768px) 256px, 192px"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div data-about-reveal className="text-center md:text-left">
                <p className="text-sm font-semibold mb-sm" style={{ color: 'hsl(var(--brand-ink))' }}>
                  {content.founderEyebrow}
                </p>
                <blockquote
                  className="text-xl md:text-2xl font-medium leading-relaxed mb-base"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  “<AccentText text={content.founderQuote} phrase="Bsbasil is my love letter to every parent who wants the very best for their little one." />”
                </blockquote>
                <p className="font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  — {content.founderName}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--blush))' }}>
          <div className="max-w-content mx-auto px-4 text-center">
            <h2
              data-about-reveal
              className="text-3xl md:text-4xl font-bold mb-base leading-[1.05]"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {content.ctaHeading}
              {content.ctaHeadingAccent ? (
                <em className="mt-[0.55em] block text-[0.92em] leading-[1.15]">{content.ctaHeadingAccent}</em>
              ) : null}
            </h2>
            <p
              data-about-reveal
              className="text-lg mb-lg"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <AccentText text={content.ctaBody} phrase="soft, safe, and adorable" />
            </p>
            <div data-about-reveal>
              <Link
                to={content.ctaHref}
                className="inline-block px-xl py-base rounded-full font-bold text-base transition-transform hover:scale-105"
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }}
              >
                {content.ctaLabel}
              </Link>
            </div>
          </div>
        </section>
      </Frame>
    </>
  );
}

export default function AboutPage() {
  const content = useLoaderData() as StoreAbout;
  return <AboutView content={content} />;
}

function AccentText({ text, phrase }: { text: string; phrase: string }) {
  const index = text.indexOf(phrase);
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="italic-accent text-[1.35em] leading-none">{phrase}</span>
      {text.slice(index + phrase.length)}
    </>
  );
}

/** About page only: each block stays hidden until it enters the screen, then slides in from the left. */
function AboutReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-about-reveal]')];
    if (reduced) {
      nodes.forEach((el) => { el.dataset.shown = '1'; });
      return;
    }

    let frame = 0;
    const reveal = (batch: HTMLElement[]) => {
      const ordered = [...batch].sort((a, b) => {
        const aa = a.getBoundingClientRect();
        const bb = b.getBoundingClientRect();
        return aa.top - bb.top || aa.left - bb.left;
      });
      ordered.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.08}s`;
        el.dataset.shown = '1';
      });
    };

    const tick = () => {
      frame = 0;
      if (document.querySelector('[data-silk-intro]')) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      const vh = window.innerHeight;
      const entered: HTMLElement[] = [];
      nodes.forEach((el) => {
        if (el.dataset.shown === '1') return;
        const box = el.getBoundingClientRect();
        if (box.height < 2) return;
        if (box.bottom < 48 && box.top < 0) {
          el.style.transition = 'none';
          el.dataset.shown = '1';
          return;
        }
        if (box.top < vh - 32 && box.bottom > 64) entered.push(el);
      });
      if (entered.length) reveal(entered);
      if (nodes.some((el) => el.dataset.shown !== '1')) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(tick);
    };

    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('bs-motion-refresh', kick);

    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('bs-motion-refresh', kick);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
