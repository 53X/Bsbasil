import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';
import { faq } from 'virtual:content';

const SITE_URL = 'https://bsbasil.com';
const PAGE_URL = `${SITE_URL}/faq`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${PAGE_URL}#webpage`,
  name: faq.hero.title,
  url: PAGE_URL,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  mainEntity: faq.categories.flatMap((cat) =>
    cat.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }))
  ),
};

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      <Helmet>
        <title>FAQ — Bsbasil Baby Clothing | Fabrics, Sizing &amp; Shipping</title>
        <meta
          name="description"
          content="Answers to common questions about Bsbasil baby clothing — fabrics, safety, sizing, shipping across India, returns, and more. Shop soft, safe clothes for ages 0–3."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="FAQ — Bsbasil Baby Clothing" />
        <meta
          property="og:description"
          content="Everything you need to know about Bsbasil — fabrics, safety, sizing, and shipping for baby clothes aged 0–3 years."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:alt" content="Bsbasil FAQ — baby clothes for ages 0–3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ — Bsbasil Baby Clothing" />
        <meta
          name="twitter:description"
          content="Everything you need to know about Bsbasil — fabrics, safety, sizing, and shipping for baby clothes aged 0–3 years."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:image:alt" content="Bsbasil FAQ — baby clothes for ages 0–3" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      </Helmet>

      <main>
        {/* Hero */}
        <section className="py-16 md:py-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="max-w-2xl mx-auto"
          >
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}
            >
              Help Centre
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {faq.hero.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {faq.hero.subtitle}
            </p>
          </motion.div>
        </section>

        {/* FAQ Categories */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            {faq.categories.map((category, catIdx) => (
              <div key={category.id}>
                <motion.h2
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: 'easeOut' as const }}
                  className="text-xl md:text-2xl font-bold text-foreground mb-5 flex items-center gap-3"
                >
                  <span
                    className="w-1.5 h-6 rounded-full inline-block shrink-0"
                    style={{ background: 'hsl(var(--primary))' }}
                  />
                  {category.title}
                </motion.h2>

                <div className="space-y-3">
                  {category.faqs.map((item, itemIdx) => {
                    const isOpen = openId === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.35,
                          delay: catIdx * 0.04 + itemIdx * 0.04,
                          ease: 'easeOut' as const,
                        }}
                        className="border border-border rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggle(item.id)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${item.id}`}
                          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-card hover:bg-muted transition-colors"
                        >
                          <span className="text-base font-semibold text-foreground leading-snug">
                            {item.question}
                          </span>
                          <ChevronDown
                            className="shrink-0 text-primary transition-transform duration-300"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            size={20}
                          />
                        </button>
                        <div
                          id={`faq-answer-${item.id}`}
                          className="overflow-hidden transition-all duration-300"
                          style={{ maxHeight: isOpen ? '600px' : '0px' }}
                        >
                          <p className="px-6 py-5 text-muted-foreground leading-relaxed border-t border-border">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="max-w-xl mx-auto text-center rounded-3xl p-10"
            style={{ background: 'hsl(var(--primary) / 0.08)' }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {faq.cta.title}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {faq.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/917700905962"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'hsl(var(--social-whatsapp, 142 70% 45%))' }}
              >
                <MessageCircle size={18} />
                <span>{faq.cta.whatsappText}</span>
              </a>
              <a
                href="mailto:packology.ent@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors border border-border text-foreground hover:bg-muted"
              >
                <Mail size={18} />
                <span>{faq.cta.emailText}</span>
              </a>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
