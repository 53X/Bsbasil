import { about } from 'virtual:content';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Leaf, Heart, Globe, ShieldCheck, Sparkles, Baby, Recycle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

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

export default function AboutPage() {
  const siteUrl = 'https://bsbasil.com';
  const pageUrl = `${siteUrl}/about`;

  return (
    <>
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
      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/airo-assets/images/pages/about/hero"
              alt="Mother and baby in soft Bsbasil clothing"
              className="w-full h-full object-cover opacity-20"
              width={1400}
              height={600}
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="relative max-w-content mx-auto px-4 py-xxxl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold tracking-wide mb-sm"
                style={{ color: 'hsl(var(--primary))' }}
              >
                Our Story
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-lg"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Made with Love,<br />
                <span style={{ color: 'hsl(var(--primary))' }}>Worn with Joy</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl max-w-2xl mx-auto mb-lg"
                style={{ color: 'hsl(var(--mutedForeground, var(--muted-foreground)))' }}
              >
                Bsbasil was born from a simple belief — every little one deserves clothes that are
                as gentle as they are adorable.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-base max-w-xl mx-auto"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Founded by parents, for parents. We design every piece with tiny humans in mind —
                soft fabrics, safe dyes, and thoughtful fits that grow with your baby.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-content mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
                What We Stand For
              </h2>
              <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Every Bsbasil piece is guided by three core promises.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-base"
            >
              {about.values.map((v, _airoIdx) => {
                const Icon = valuesMeta[_airoIdx].icon;

                return (
                  <motion.div
                    key={v.title}
                    variants={fadeUp}
                    className="rounded-2xl p-lg flex flex-col items-center text-center border"
                    style={{ background: v.bg, borderColor: 'hsl(var(--border))' }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-base"
                      style={{ background: 'hsl(var(--background))' }}
                    >
                      <Icon size={28} style={{ color: v.color }} />
                    </div>
                    <h3 className="text-xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
                      {v.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {v.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── Safety Promise ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-content mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center"
            >
              <motion.div variants={fadeUp} className="mb-sm">
                <ShieldCheck size={48} style={{ color: 'hsl(var(--primary))', margin: '0 auto' }} />
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-base"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Our Safety Promise
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-base md:text-lg max-w-2xl mx-auto mb-xl leading-relaxed"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Every Bsbasil garment is tested to meet international baby safety standards. We use
                only OEKO-TEX® certified fabrics — free from harmful chemicals, dyes, and
                irritants. Because your baby's skin deserves nothing less.
              </motion.p>

              <motion.div
                variants={stagger}
                className="flex flex-wrap justify-center gap-base"
              >
                {about.badges.map((b, _airoIdx) => {
                  const Icon = badgesMeta[_airoIdx].icon;

                  return (
                    <motion.div
                      key={b.label}
                      variants={fadeUp}
                      className="flex items-center gap-sm px-lg py-sm rounded-full border font-medium text-sm"
                      style={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      <Icon size={18} style={{ color: 'hsl(var(--primary))' }} />
                      <span>{b.label}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Founder Note ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-content mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col md:flex-row items-center gap-xl"
            >
              <motion.div variants={fadeUp} className="flex-shrink-0">
                <img
                  src="/airo-assets/images/pages/about/founder"
                  alt="Bsbasil founder with her baby"
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4"
                  style={{ borderColor: 'hsl(var(--primary))' }}
                  width={256}
                  height={256}
                  loading="lazy"
                />
              </motion.div>
              <motion.div variants={fadeUp} className="text-center md:text-left">
                <p className="text-sm font-semibold mb-sm" style={{ color: 'hsl(var(--primary))' }}>
                  A note from our founder
                </p>
                <blockquote
                  className="text-xl md:text-2xl font-medium leading-relaxed mb-base italic"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  "When my daughter was born, I couldn't find clothes that were truly soft, safe,
                  and beautiful all at once. So I made them. Bsbasil is my love letter to every
                  parent who wants the very best for their little one."
                </blockquote>
                <p className="font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  — Founder, Bsbasil
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--primary))' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-content mx-auto px-4 text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold mb-base"
              style={{ color: 'hsl(var(--primary-foreground))' }}
            >
              Dress your little one in love
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg mb-lg"
              style={{ color: 'hsl(var(--primary-foreground) / 0.85)' }}
            >
              Explore our collection of soft, safe, and adorable clothes for ages 0–3.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/catalog"
                className="inline-block px-xl py-base rounded-full font-bold text-base transition-transform hover:scale-105"
                style={{
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--primary))',
                }}
              >
                Shop Now
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
