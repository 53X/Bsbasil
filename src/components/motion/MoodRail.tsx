import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

const KINDS = [
  { src: '/hero-cube/romper.webp', label: 'Rompers', href: '/catalog?category=Romper' },
  { src: '/hero-cube/sets.webp', label: 'Sets', href: '/catalog?category=Sets' },
  { src: '/hero-cube/sleepwear.webp', label: 'Sleepwear', href: '/catalog?category=Sleepwear' },
  { src: '/hero-cube/winter-wear.webp', label: 'Winter wear', href: '/catalog?category=Winter%20wear' },
  { src: '', label: 'Accessories', href: '/catalog?category=Accessories' },
];

/**
 * Lookbook sits in a normal document flow. Sideways movement is only from the
 * arrows, so a vertical wheel continues into the next section.
 */
export default function MoodRail() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(max > 4 && el.scrollLeft < max - 4);
    setProgress(max <= 0 ? 1 : el.scrollLeft / max);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    el.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', sync, { once: true });
    });
    return () => {
      el.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-mood-card]');
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    const amount = (card?.getBoundingClientRect().width ?? el.clientWidth * 0.75) + gap;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * amount, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="relative bg-background py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-8">
        <div className="w-full shrink-0 px-4 lg:w-[min(34vw,26rem)] lg:px-10">
          <p
            className="mb-3 text-[0.9rem] font-semibold uppercase leading-[1.2rem] tracking-[0.22em] sm:mb-4"
            style={{ color: 'hsl(var(--brand-ink))' }}
          >
            The Bsbasil archive
          </p>
          <h2 className="text-[clamp(1.85rem,8vw,4.15rem)] leading-none">
            <span className="block text-[0.92em] leading-[1.05]">Creating little styles</span>
            <em className="mt-[0.55em] block text-[0.92em] leading-[1.15]">for big personality</em>
          </h2>
          <p data-subhead className="mt-5 max-w-sm text-sm leading-relaxed sm:text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Rompers, sets, sleepwear, winter wear, and accessories, made for a baby with{' '}
            <span className="italic-accent text-[1.45em] leading-none">a point of view</span>.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              aria-label="Show previous styles"
              disabled={!canPrev}
              onClick={() => scrollByCard(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground shadow-sm transition hover:border-[#62A848] hover:text-[#62A848] disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Show next styles"
              disabled={!canNext}
              onClick={() => scrollByCard(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground shadow-sm transition hover:border-[#62A848] hover:text-[#62A848] disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5 h-px w-32 origin-left bg-foreground/15 sm:w-40">
            <div
              data-mood-bar
              className="h-px origin-left bg-[#62A848]"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex w-full min-w-0 gap-4 overflow-x-hidden px-4 pb-2 sm:gap-6 lg:gap-8 lg:px-0 lg:pr-10"
        >
          {KINDS.map((kind, index) => (
            <Link
              key={kind.label}
              to={kind.href}
              data-mood-card
              className="group w-[min(72vw,420px)] shrink-0"
            >
              <div className="arch-frame relative flex h-[min(46svh,34rem)] items-end overflow-hidden bg-[#62A848] sm:h-[min(56vh,34rem)]">
                {kind.src ? (
                  <img
                    src={kind.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    width={480}
                    height={640}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                ) : (
                  <span className="relative z-10 p-8 text-4xl uppercase leading-none text-[#122117]">Accessories</span>
                )}
              </div>
              <p className="look-caption italic-accent mt-3 flex items-baseline gap-2 text-sm uppercase">
                <span>{String(index + 1).padStart(2, '0')}</span>
                {kind.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
