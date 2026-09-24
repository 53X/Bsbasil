import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { privacy_policy } from 'virtual:content';

const site = 'https://bsbasil.com';
const url = `${site}/privacy-policy`;

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>{privacy_policy.meta.title}</title>
        <meta name="description" content={privacy_policy.meta.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={privacy_policy.meta.title} />
        <meta property="og:description" content={privacy_policy.meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Bsbasil Privacy Policy — baby clothes for ages 0–3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={privacy_policy.meta.title} />
        <meta name="twitter:description" content={privacy_policy.meta.description} />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta name="twitter:image:alt" content="Bsbasil Privacy Policy" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          name: privacy_policy.meta.title,
          url,
          description: privacy_policy.meta.description,
          isPartOf: { '@id': `${site}/#website` },
          about: { '@id': `${site}/#organization` },
        }).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <main className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              {privacy_policy.hero.heading}
            </h1>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <span>Last updated: </span>
              <span>{privacy_policy.hero.lastUpdated}</span>
            </p>
          </div>

          {/* Intro */}
          <p className="text-base leading-relaxed mb-10" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {privacy_policy.intro.text}
          </p>

          {/* Sections */}
          {privacy_policy.sections.map((section) => (
            <section key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
                {section.heading}
              </h2>
              {section.body.map((para) => (
                <p key={para.id} className="text-base leading-relaxed mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {para.text}
                </p>
              ))}
            </section>
          ))}

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-border">
            <Link
              to="/"
              className="text-sm font-medium transition-colors"
              style={{ color: 'hsl(var(--primary))' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
