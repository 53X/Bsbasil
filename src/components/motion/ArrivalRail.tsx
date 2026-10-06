import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import ProductCard from '@/components/ProductCard';
import type { StoreProduct } from '@/lib/shopify/types';

/** Product rail. Vertical scroll carries the cards sideways and reveals them one by one. */
export default function ArrivalRail({ products }: { products: StoreProduct[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || products.length === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const cardNodes = () => Array.from(track.querySelectorAll<HTMLElement>('[data-card]'));
    const clearCardMotion = () => {
      cardNodes().forEach((card) => {
        card.style.opacity = '';
        card.style.visibility = '';
        card.style.transform = '';
      });
    };
    cardNodes().forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px)';
    });

    let revert = clearCardMotion;
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const cards = cardNodes();
      const count = Math.max(cards.length, 1);

      const pose = (progress: number) => {
        cards.forEach((card, index) => {
          const start = index / count;
          const span = 1 / count;
          const revealed = gsap.utils.clamp(0, 1, (progress - start) / span);
          const box = card.getBoundingClientRect();
          const delta = box.left + box.width / 2 - window.innerWidth / 2;
          const rotate = gsap.utils.clamp(-18, 18, delta / 28);
          gsap.set(card, {
            autoAlpha: revealed,
            y: (1 - revealed) * 32,
            rotateY: rotate,
            z: -Math.abs(rotate) * 2,
          });
        });
      };

      const ctx = gsap.context(() => {
        const slide = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);
        const applyHeight = () => {
          const stage = root.querySelector('[data-arrival-stage]') as HTMLElement | null;
          const stageHeight = stage?.offsetHeight ?? 0;
          const perCard = Math.round(window.innerHeight * 0.42);
          const span = Math.max(slide(), count * perCard);
          root.style.height = `${Math.max(window.innerHeight * 0.85, stageHeight) + span}px`;
        };
        applyHeight();
        gsap.to(track, {
          x: () => -slide(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 6.25rem',
            end: 'bottom bottom',
            scrub: 0.7,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              applyHeight();
              pose(self.progress);
            },
            onUpdate: (self) => pose(self.progress),
            onLeave: () => pose(1),
            onLeaveBack: () => pose(0),
          },
        });
      }, root);

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('resize', refresh);
      track.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', refresh, { once: true });
      });
      requestAnimationFrame(refresh);
      revert = () => {
        window.removeEventListener('resize', refresh);
        ctx.revert();
        clearCardMotion();
      };
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
          <h2 className="max-w-full text-[clamp(2.2rem,4vw,3.75rem)] leading-none">
            <span className="align-baseline">NEW</span>{' '}
            <em className="ml-[0.12em] inline-block align-baseline text-[1.05em] leading-none">ARRIVALS</em>
          </h2>
          <Link
            to="/catalog"
            className="mb-1 shrink-0 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'hsl(var(--brand-ink))' }}
          >
            View all
          </Link>
        </div>
        <div className="overflow-hidden">
          <div ref={trackRef} className="flex w-max items-stretch gap-4 px-4 pb-8 sm:gap-6" style={{ perspective: '1400px' }}>
            {products.map((product, index) => (
              <div
                key={product.id}
                data-card
                className="w-[min(68vw,280px)] shrink-0 sm:w-[260px]"
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
