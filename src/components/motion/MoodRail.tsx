import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

const KINDS = [
  { src: '/hero-cube/romper.jpg', label: 'Rompers', href: '/catalog?category=Romper' },
  { src: '/hero-cube/sets.jpg', label: 'Sets', href: '/catalog?category=Sets' },
  { src: '/hero-cube/sleepwear.jpg', label: 'Sleepwear', href: '/catalog?category=Sleepwear' },
  { src: '/hero-cube/winter-wear.jpg', label: 'Winter wear', href: '/catalog?category=Winter%20wear' },
  { src: '', label: 'Accessories', href: '/catalog?category=Accessories' },
];

/** Vertical scroll is spent moving this lookbook sideways, on every screen size. */
export default function MoodRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let revert = () => {};
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 32);
        const applyHeight = () => {
          const stage = section.querySelector('[data-mood-stage]') as HTMLElement | null;
          const stageHeight = stage?.offsetHeight ?? window.innerHeight;
          section.style.height = `${stageHeight + distance()}px`;
        };
        applyHeight();
        gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 6.25rem',
              end: 'bottom bottom',
              scrub: 0.6,
              invalidateOnRefresh: true,
              onRefresh: applyHeight,
            },
          },
        );
        const bar = section.querySelector('[data-mood-bar]');
        if (bar) {
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top 6.25rem',
                end: 'bottom bottom',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }, section);
      revert = () => ctx.revert();
      const refresh = () => ScrollTrigger.refresh();
      track.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', refresh, { once: true });
      });
      window.addEventListener('resize', refresh);
      requestAnimationFrame(refresh);
      const previousRevert = revert;
      revert = () => {
        window.removeEventListener('resize', refresh);
        previousRevert();
      };
    });

    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-background">
      <div
        data-mood-stage
        className="sticky top-[6.25rem] flex h-[calc(100svh-6.25rem)] items-center overflow-hidden lg:h-[calc(100dvh-6.25rem)]"
      >
        <div ref={trackRef} className="flex w-max items-end gap-4 px-4 py-6 sm:gap-6 lg:gap-8 lg:px-10">
          <div className="w-[min(78vw,26rem)] shrink-0 pr-2">
            <p className="mb-3 text-[0.9rem] font-semibold uppercase leading-[1.2rem] tracking-[0.22em] sm:mb-4" style={{ color: 'hsl(var(--brand-ink))' }}>
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
            <div className="mt-6 h-px w-32 origin-left bg-foreground/15 sm:w-40">
              <div data-mood-bar className="h-px origin-left scale-x-0 bg-[#62A848]" />
            </div>
          </div>
          {KINDS.map((kind, index) => (
            <Link key={kind.label} to={kind.href} className="group w-[min(72vw,420px)] shrink-0">
              <div className="arch-frame relative flex h-[min(46svh,34rem)] items-end overflow-hidden bg-[#62A848] sm:h-[min(56vh,34rem)]">
                {kind.src ? (
                  <img
                    src={kind.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    width={480}
                    height={640}
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
