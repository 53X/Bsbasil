import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import ProductCard from '@/components/ProductCard';
import type { StoreProduct } from '@/lib/shopify/types';

/** Product rail. On a wide screen, scroll carries the cards sideways. The title stays put. */
export default function ArrivalRail({ products }: { products: StoreProduct[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || products.length === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = window.matchMedia('(max-width: 1023px)').matches;
    if (reduced) return;

    let revert = () => {};
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const cards = track.querySelectorAll<HTMLElement>('[data-card]');

      const bend = () => {
        cards.forEach((card) => {
          const box = card.getBoundingClientRect();
          const delta = box.left + box.width / 2 - window.innerWidth / 2;
          const rotate = gsap.utils.clamp(-18, 18, delta / 28);
          gsap.set(card, { rotateY: rotate, z: -Math.abs(rotate) * 2 });
        });
      };

      const ctx = gsap.context(() => {
        const photos = track.querySelectorAll('[data-reveal]');
        if (photos.length) {
          gsap.from(photos, {
            autoAlpha: 0,
            y: 40,
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 85%',
              end: 'top 45%',
              scrub: 0.6,
            },
          });
        }
        if (narrow) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);
        const applyHeight = () => {
          const stage = root.querySelector('[data-arrival-stage]') as HTMLElement | null;
          const stageHeight = stage?.offsetHeight ?? 0;
          root.style.height = `${Math.max(window.innerHeight * 0.85, stageHeight) + distance()}px`;
        };
        applyHeight();
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 6.25rem',
            end: 'bottom bottom',
            scrub: 0.7,
            invalidateOnRefresh: true,
            onRefresh: applyHeight,
            onUpdate: bend,
          },
        });
        bend();
      }, root);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert();
    };
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <section ref={rootRef} id="arrivals" className="bg-background">
      <div data-arrival-stage className="sticky top-[6.25rem] overflow-hidden py-6 sm:py-8">
        <div className="mx-auto mb-5 flex w-full max-w-content items-end justify-between gap-4 px-4">
          <h2 className="max-w-full text-[clamp(2.2rem,4vw,3.75rem)] leading-[0.92]">
            NEW
            <br />
            ARRIVALS
          </h2>
          <Link
            to="/catalog"
            className="mb-1 shrink-0 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'hsl(var(--brand-ink))' }}
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto lg:overflow-hidden" data-lenis-prevent>
          <div ref={trackRef} className="flex w-max items-stretch gap-4 px-4 sm:gap-6" style={{ perspective: '1400px' }}>
            {products.map((product, index) => (
              <div
                key={product.id}
                data-card
                className="w-[min(78vw,240px)] shrink-0 sm:w-[260px]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
