import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ageLabel, expandProductsByAge, productMatchesFilters } from '@/lib/shopify/map';
import type { StoreCatalog, StorePromotion } from '@/lib/shopify/types';

const AGE_FILTERS = [
  { value: 'All Ages', label: 'All Ages' },
  { value: '0-3M', label: '0–3 Months' },
  { value: '3-6M', label: '3–6 Months' },
  { value: '6-12M', label: '6–12 Months' },
  { value: '12-18M', label: '12–18 Months' },
  { value: '18-24M', label: '18–24 Months' },
  { value: '24-30M', label: '24–30 Months' },
  { value: '30-36M', label: '30–36 Months' },
] as const;
const CATEGORY_FILTERS = ['All Categories', 'Romper', 'Sleepwear', 'Sets', 'Winter wear', 'Accessories'] as const;

export default function CatalogPage() {
  const store = useLoaderData() as StoreCatalog & { promotions?: StorePromotion[] };
  const shopOffer = (store.promotions ?? []).find((promo) => {
    try {
      const path = new URL(promo.href, 'https://bsbasil.com').pathname.replace(/\/$/, '');
      return path === '/catalog' && promo.offer;
    } catch {
      return false;
    }
  })?.offer;
  const [params, setSearchParams] = useSearchParams();
  const ageFromUrl = params.get('age');
  const categoryFromUrl = params.get('category');
  const selectedAge = ageFromUrl && AGE_FILTERS.some((age) => age.value === ageFromUrl) ? ageFromUrl : 'All Ages';
  const selectedCategory =
    categoryFromUrl &&
    categoryFromUrl !== 'All' &&
    categoryFromUrl !== 'All Categories' &&
    (CATEGORY_FILTERS as readonly string[]).includes(categoryFromUrl)
      ? categoryFromUrl
      : 'All Categories';
  const products = store.products;

  const setFilters = (age: string, category: string) => {
    const next = new URLSearchParams();
    // All Ages / All Categories omit that param = no filter on that axis.
    if (age !== 'All Ages') next.set('age', age);
    if (category !== 'All Categories' && category !== 'All') next.set('category', category);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => setFilters('All Ages', 'All Categories');

  const hasActiveFilters = selectedAge !== 'All Ages' || selectedCategory !== 'All Categories';

  // All Ages = ignore age. All Categories = ignore category. Otherwise AND both.
  // One catalog card per Shopify product — ages are sizes on the product page.
  const filteredProducts = products.filter((p) =>
    productMatchesFilters(p, selectedAge, selectedCategory),
  );
  const catalogCards = expandProductsByAge(filteredProducts, selectedAge);
  const visibleCount = catalogCards.length;
  const filterSummary = [
    selectedCategory === 'All Categories' ? null : selectedCategory,
    selectedAge === 'All Ages' ? null : ageLabel(selectedAge),
  ].filter(Boolean).join(' · ');

  return (
    <>
      <Helmet>
        <title>Baby Clothes Online India — Bsbasil | Ages 0–3 Years</title>
        <meta
          name="description"
          content="Shop baby clothes online in India at Bsbasil — rompers, sets, sleepwear, winter wear and accessories for ages 0–3. Soft, safe fabrics. Pan-India delivery." />
        <link rel="canonical" href="https://bsbasil.com/catalog" />
        <meta property="og:title" content="Baby Clothes Online India — Bsbasil | Ages 0–3 Years" />
        <meta
          property="og:description"
          content="Shop baby clothes online in India — rompers, sets, sleepwear, winter wear and accessories for ages 0–3. Soft, safe fabrics with pan-India delivery." />
        <meta property="og:url" content="https://bsbasil.com/catalog" />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Bsbasil baby clothes — rompers, sets, sleepwear, winter wear and accessories" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Baby Clothes Online India — Bsbasil | Ages 0–3 Years" />
        <meta name="twitter:description" content="Shop baby clothes online in India — rompers, sets, sleepwear, winter wear and accessories for ages 0–3." />
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
              description: "Shop baby clothes online in India — rompers, sets, sleepwear, winter wear and accessories for ages 0–3.",
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
        <section className="relative overflow-hidden px-4 pb-6 pt-12 md:pt-16">
          <p className="watermark" aria-hidden="true">SHOP</p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="relative z-10 mx-auto max-w-content">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'hsl(var(--brand-ink))' }}>
              The collection · ages 0–3
            </p>
            <h1 className="max-w-4xl text-[clamp(2.4rem,7vw,5.6rem)] leading-[0.9]">
              Baby clothes,
              <br />
              <em>chosen by age.</em>
            </h1>
            {shopOffer ? (
              <p className="mt-4 inline-flex min-h-9 items-center rounded-full bg-[#62A848] px-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#122117]">
                {shopOffer}
              </p>
            ) : null}
          </motion.div>
        </section>

        {/* ── Filters ── */}
        <section
          className="sticky top-[6.25rem] z-40 border-b py-sm"
          style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>
          <div className="max-w-content mx-auto px-4">
            <div>
              {/* Age filter */}
              <div role="group" aria-label="Filter by age" className="mb-sm">
                <p className="text-xs font-semibold mb-xs uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Age
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
                  {AGE_FILTERS.map((age) => (
                    <button
                      key={age.value}
                      onClick={() => setFilters(age.value, selectedCategory)}
                      className="min-h-11 shrink-0 px-4 rounded-full text-sm font-semibold border transition-all"
                      style={{
                        background: selectedAge === age.value ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                        color: selectedAge === age.value ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                        borderColor: selectedAge === age.value ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                      }}>
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div role="group" aria-label="Filter by category">
                <p className="text-xs font-semibold mb-xs uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Category
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilters(selectedAge, cat)}
                      className="min-h-11 shrink-0 px-4 rounded-full text-sm font-semibold border transition-all"
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
            <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
              <p className="min-w-0 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Showing{' '}
                <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {visibleCount}
                </span>{' '}
                {visibleCount === 1 ? 'item' : 'items'}
                {filterSummary ? (
                  <>
                    {' '}
                    <span aria-hidden="true">·</span>{' '}
                    <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {filterSummary}
                    </span>
                  </>
                ) : null}
              </p>
              {hasActiveFilters &&
              <button
                onClick={clearFilters}
                className="flex shrink-0 items-center gap-1 text-sm font-medium"
                style={{ color: 'hsl(var(--brand-ink))' }}>
                
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
                <h3 className="text-xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
                  No items found
                </h3>
                <p className="text-sm mb-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Try a different age range or category.
                </p>
                <button
                onClick={clearFilters}
                className="px-xl py-sm rounded-full font-semibold text-sm"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                
                  Show all products
                </button>
              </div>
            }

            {/* Grid — one card per product; age filter only limits which products appear */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catalogCards.map(({ product, ageCode }, i) => (
                  <motion.div
                    key={product.id}
                    className="h-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease: 'easeOut' as const }}
                  >
                    <ProductCard
                      product={product}
                      ageHighlight={ageCode || undefined}
                      index={i}
                    />
                  </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>);

}