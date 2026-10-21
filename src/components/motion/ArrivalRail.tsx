import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import ProductCard from '@/components/ProductCard';
import type { StoreProduct } from '@/lib/shopify/types';

/** Product rail. Vertical page scroll moves the cards sideways, and back again. */
export default function ArrivalRail({
  products,
  id = 'arrivals',
  lead = 'NEW',
  accent = 'ARRIVALS',
  href = '/catalog',
}: {
  products: StoreProduct[];
  id?: string;
  lead?: string;
  accent?: string;
  href?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = root?.querySelector('[data-arrival-stage]') as HTMLElement | null;
    const clip = root?.querySelector('[data-arrival-clip]') as HTMLElement | null;
    if (!root || !track || !stage || !clip || products.length === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      clip.style.overflowX = 'auto';
      return;
    }

    let revert = () => {};
    let cancelled = false;

    const run = () => {
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.scrollWidth - clip.clientWidth);
        const applyHeight = () => {
          const stageHeight = stage.offsetHeight || window.innerHeight;
          root.style.height = `${stageHeight + distance()}px`;
        };
        applyHeight();
        gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => -distance(),
            ease: 'none',
            immediateRender: true,
            scrollTrigger: {
              trigger: root,
              start: 'top 6.25rem',
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
              onRefresh: applyHeight,
            },
          },
        );
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
        root.style.height = '';
        track.style.transform = '';
      };
    });
    };

    let cancelIdle = () => {};
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 1800 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(run, 1200);
      cancelIdle = () => window.clearTimeout(id);
    }

    return () => {
      cancelled = true;
      cancelIdle();
      revert();
    };
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <section ref={rootRef} id={id} className="relative bg-background">
      <div data-arrival-stage className="sticky top-[6.25rem] py-6 sm:py-8">
        <div className="mx-auto mb-5 flex w-full max-w-content items-end justify-between gap-4 px-4">
          <h2 className="max-w-full text-[clamp(2.2rem,4vw,3.75rem)] leading-none">
            <span className="align-baseline">{lead}</span>
            {accent ? (
              <em className="ml-[0.12em] inline-block align-baseline text-[1.05em] leading-none">{accent}</em>
            ) : null}
          </h2>
          <Link
            to={href}
            className="mb-1 shrink-0 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'hsl(var(--brand-ink))' }}
          >
            View all
          </Link>
        </div>
        <div
          data-arrival-clip
          className="arrival-clip overflow-hidden"
        >
          <div ref={trackRef} className="flex w-max items-stretch gap-4 px-4 pb-8 sm:gap-6 lg:gap-8">
            {products.map((product, index) => (
              <div key={product.id} className="w-[min(72vw,280px)] shrink-0 sm:w-[min(42vw,280px)] lg:w-[min(22vw,280px)]">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
