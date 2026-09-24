import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { useLoaderData, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { StoreCatalog } from '@/lib/shopify/types';

const AGE_FILTERS = ['All Ages', '0-6M', '6-12M', '12-18M', '18-24M', '24-36M'] as const;
const CATEGORY_FILTERS = ['All', 'Onesies', 'Rompers', 'Sleepwear', 'Sets', 'Dresses', 'Outerwear', 'Bottoms'] as const;

export default function CatalogPage() {
  const store = useLoaderData() as StoreCatalog;
  const [params] = useSearchParams();
  const ageFromUrl = params.get('age');
  const [selectedAge, setSelectedAge] = useState<string>(ageFromUrl && AGE_FILTERS.includes(ageFromUrl as typeof AGE_FILTERS[number]) ? ageFromUrl : 'All Ages');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const products = store.products;

  const hasActiveFilters = selectedAge !== 'All Ages' || selectedCategory !== 'All';

  // Compute visible count for display (does not filter the rendered list)
  const visibleCount = products.filter((p) => {
    const ageMatch = selectedAge === 'All Ages' || p.ageRange === selectedAge;
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return ageMatch && catMatch;
  }).length;

  return (
    <>
      <Helmet>
        <title>Baby Clothes Online India — Bsbasil | Ages 0–3 Years</title>
        <meta
          name="description"
          content="Shop 23+ baby clothes online in India at Bsbasil — rompers, onesies, ethnic wear, sleepwear & gift sets for ages 0–3. Soft, safe fabrics. Pan-India delivery." />
        <link rel="canonical" href="https://bsbasil.com/catalog" />
        <meta property="og:title" content="Baby Clothes Online India — Bsbasil | Ages 0–3 Years" />
        <meta
          property="og:description"
          content="Shop 23+ baby clothes online in India — rompers, onesies, ethnic wear, sleepwear & gift sets for ages 0–3. Soft, safe fabrics with pan-India delivery." />
        <meta property="og:url" content="https://bsbasil.com/catalog" />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Bsbasil baby clothes catalog — rompers, onesies, ethnic wear for ages 0–3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Baby Clothes Online India — Bsbasil | Ages 0–3 Years" />
        <meta name="twitter:description" content="Shop 23+ baby clothes online in India — rompers, onesies, ethnic wear & gift sets for ages 0–3." />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': 'https://bsbasil.com/catalog#webpage',
              name: 'Baby Clothes Online India — Bsbasil | Ages 0–3 Years',
              url: 'https://bsbasil.com/catalog',
              description: "Shop 23+ baby clothes online in India — rompers, onesies, ethnic wear, sleepwear & gift sets for ages 0–3.",
              isPartOf: { '@id': 'https://bsbasil.com/#website' },
              about: { '@id': 'https://bsbasil.com/#organization' },
              inLanguage: 'en-IN',
            },
            {
              '@type': 'ItemList',
              '@id': 'https://bsbasil.com/catalog#itemlist',
              name: 'Bsbasil Baby Clothes Collection',
              description: 'Complete collection of baby and toddler clothing for ages 0–3 years',
              url: 'https://bsbasil.com/catalog',
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: p.name,
                url: `https://bsbasil.com/products/${p.handle}`,
                item: {
                  '@type': 'Product',
                  name: p.name,
                  offers: {
                    '@type': 'Offer',
                    price: String(p.price / 100),
                    priceCurrency: p.currency || 'INR',
                    availability: 'https://schema.org/InStock',
                    seller: { '@id': 'https://bsbasil.com/#organization' },
                  },
                },
              })),
            },
          ],
        }).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <main>
        {/* ── Hero Banner ── */}
        <section className="py-xl text-center" style={{ background: 'hsl(var(--muted))' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="max-w-content mx-auto px-4">
            <h1
              className="text-4xl md:text-5xl font-bold mb-sm"
              style={{ color: 'hsl(var(--foreground))' }}>
              Baby Clothes for Ages 0–3
            </h1>
            <p
              className="text-base md:text-lg max-w-xl mx-auto"
              style={{ color: 'hsl(var(--muted-foreground))' }}>
              Soft, safe &amp; adorable — browse our full collection of baby &amp; toddler wear.
            </p>
          </motion.div>
        </section>

        {/* ── Filters ── */}
        <section
          className="sticky top-16 z-40 border-b py-sm"
          style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
          <div className="max-w-content mx-auto px-4">
            {/* Mobile filter toggle */}
            <div className="flex items-center justify-between md:hidden mb-sm">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-base py-xs rounded-full text-sm font-medium border transition-colors"
                style={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  background: showFilters ? 'hsl(var(--muted))' : 'transparent'
                }}>
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <span
                    className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                    !
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSelectedAge('All Ages'); setSelectedCategory('All'); }}
                  className="flex items-center gap-1 text-sm"
                  style={{ color: 'hsl(var(--primary))' }}>
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              {/* Age filter */}
              <div role="group" aria-label="Filter by age" className="mb-sm">
                <p className="text-xs font-semibold mb-xs uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Age
                </p>
                <div className="flex flex-wrap gap-2">
                  {AGE_FILTERS.map((age) => (
                    <button
                      key={age}
                      onClick={() => setSelectedAge(age)}
                      className="px-base py-xs rounded-full text-sm font-medium border transition-all"
                      style={{
                        background: selectedAge === age ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                        color: selectedAge === age ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                        borderColor: selectedAge === age ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                      }}>
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div role="group" aria-label="Filter by category">
                <p className="text-xs font-semibold mb-xs uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="px-base py-xs rounded-full text-sm font-medium border transition-all"
                      style={{
                        background: selectedCategory === cat ? 'hsl(var(--accent))' : 'hsl(var(--background))',
                        color: selectedCategory === cat ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                        borderColor: selectedCategory === cat ? 'hsl(var(--accent))' : 'hsl(var(--border))'
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Grid ── */}
        <section className="py-xl" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-content mx-auto px-4">
            {/* Results count */}
            <div className="flex items-center justify-between mb-lg">
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Showing{' '}
                <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {visibleCount}
                </span>{' '}
                {visibleCount === 1 ? 'item' : 'items'}
              </p>
              {hasActiveFilters &&
              <button
                onClick={() => {setSelectedAge('All Ages');setSelectedCategory('All');}}
                className="hidden md:flex items-center gap-1 text-sm font-medium"
                style={{ color: 'hsl(var(--primary))' }}>
                
                  <X size={14} />
                  Clear filters
                </button>
              }
            </div>

            {!store.configured && (
              <div className="text-center py-xxxl">
                <h3 className="text-xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>The shop is being connected</h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Products, prices, and videos will show here once the Shopify store is linked.
                </p>
              </div>
            )}
            {store.configured && store.error && (
              <p className="text-sm mb-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>{store.error}</p>
            )}

            {/* Empty state */}
            {store.configured && products.length === 0 && !store.error &&
            <div className="text-center py-xxxl">
                <p className="text-5xl mb-base">🧸</p>
                <h3 className="text-xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
                  The store is connected
                </h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Products will show here after they are added in Shopify.
                </p>
              </div>
            }
            {store.configured && products.length > 0 && visibleCount === 0 && !store.error &&
            <div className="text-center py-xxxl">
                <p className="text-5xl mb-base">🧸</p>
                <h3 className="text-xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
                  No items found
                </h3>
                <p className="text-sm mb-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Try a different age range or category.
                </p>
                <button
                onClick={() => {setSelectedAge('All Ages');setSelectedCategory('All');}}
                className="px-xl py-sm rounded-full font-semibold text-sm"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                
                  Show all products
                </button>
              </div>
            }

            {/* Grid — all products rendered; CSS controls visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-base">
              {products.map((product, i) => {
                const ageMatch = selectedAge === 'All Ages' || product.ageRange === selectedAge;
                const catMatch = selectedCategory === 'All' || product.category === selectedCategory;
                if (!ageMatch || !catMatch) return null;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: 'easeOut' as const }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>);

}