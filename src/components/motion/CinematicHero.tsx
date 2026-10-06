import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

const KINDS = [
  { src: '/hero-cube/romper.jpg', label: 'Rompers', href: '/catalog?category=Romper' },
  { src: '/hero-cube/sets.jpg', label: 'Sets', href: '/catalog?category=Sets' },
  { src: '/hero-cube/sleepwear.jpg', label: 'Sleepwear', href: '/catalog?category=Sleepwear' },
  { src: '/hero-cube/winter-wear.jpg', label: 'Winter wear', href: '/catalog?category=Winter%20wear' },
  { src: '', label: 'Accessories', href: '/catalog?category=Accessories' },
];
const STILLS = KINDS.filter((kind) => kind.src);

/**
 * Sticky hero. Scrolling plays all six clothing types: the photograph
 * crossfades through each still while the matching name lights up.
 */
export default function CinematicHero({ eyebrow, subtitle }: { eyebrow: string; subtitle: string }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let revert = () => {};
    let cancelled = false;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled || !rootRef.current) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const narrow = window.matchMedia('(max-width: 767px)').matches;

      const ctx = gsap.context(() => {
        const stills = gsap.utils.toArray<HTMLElement>('[data-still]');
        const labels = gsap.utils.toArray<HTMLElement>('[data-type]');
        const caption = root.querySelector('[data-still-name]');
        const bar = root.querySelector('[data-film-bar]');
        const mark = (progress: number) => {
          const index = Math.min(KINDS.length - 1, Math.floor(progress * KINDS.length));
          labels.forEach((label, i) => label.classList.toggle('is-on', i === index));
          if (caption) caption.textContent = KINDS[index]?.label ?? '';
        };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 6.25rem',
            end: 'bottom bottom',
            scrub: 0.65,
            invalidateOnRefresh: true,
            onUpdate: (self) => mark(self.progress),
          },
        });

        timeline.fromTo('[data-hero-photo]', { scale: 1.14 }, { scale: 1, ease: 'none', duration: 1 }, 0);
        if (!narrow) {
          timeline.fromTo('[data-line="a"]', { x: 0 }, { x: -16, ease: 'none', duration: 1 }, 0);
          timeline.fromTo('[data-line="b"]', { x: 0 }, { x: 12, ease: 'none', duration: 1 }, 0);
        }
        timeline.fromTo('[data-watermark]', { xPercent: -4 }, { xPercent: 8, ease: 'none', duration: 1 }, 0);

        const slot = 1 / Math.max(1, stills.length - 1);
        stills.forEach((still, index) => {
          if (index === 0) return;
          const at = (index - 1) * slot;
          timeline.fromTo(still, { opacity: 0 }, { opacity: 1, ease: 'none', duration: slot * 0.5 }, at + slot * 0.28);
          timeline.to(stills[index - 1], { opacity: 0, ease: 'none', duration: slot * 0.4 }, at + slot * 0.55);
        });
        if (bar) timeline.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
        mark(0);
      }, root);

      revert = () => ctx.revert();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative bg-background lg:h-[380vh]">
      <div className="mx-auto grid max-w-content items-center gap-4 overflow-visible px-4 py-6 lg:sticky lg:top-[6.25rem] lg:h-[calc(100dvh-6.25rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:overflow-hidden lg:py-5">
        <p data-watermark className="watermark" aria-hidden="true">
          COLOUR
        </p>
        <div className="relative z-10 min-w-0">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] sm:mb-5 sm:text-xs sm:tracking-[0.24em]" style={{ color: 'hsl(var(--brand-ink))' }}>
            {eyebrow}
          </p>
          <h1 className="text-[clamp(2.35rem,5.4vw,4.8rem)] leading-[0.88]">
            <span data-line="a" className="block">
              Loud colour,
            </span>
            <em data-line="b" className="block">
              quiet comfort.
            </em>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed sm:mt-5 sm:text-base md:text-lg" style={{ color: 'hsl(var(--foreground) / 0.78)' }}>
            {subtitle}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-1.5 sm:mt-5" aria-label="Clothing types">
            {KINDS.map((kind, index) => (
              <li key={kind.label}>
                <Link
                  data-type
                  to={kind.href}
                  className={`inline-flex min-h-9 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-xs ${index === 0 ? 'is-on' : ''}`}
                >
                  {kind.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row">
            <Link
              to="/catalog"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground sm:px-7"
            >
              Explore the collection
              <ArrowRight size={16} />
            </Link>
            <a
              href="#moods"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-foreground/20 px-6 text-sm font-semibold uppercase tracking-[0.14em] sm:px-7"
            >
              Watch the edit
            </a>
          </div>
        </div>
        <div className="relative z-10 flex min-h-0 flex-col">
          <div className="absolute -left-4 top-8 hidden h-[78%] w-16 bg-[#62A848] xl:block" aria-hidden="true" />
          <div data-hero-photo className="relative mx-auto aspect-[3/4] w-full max-w-[34rem] overflow-hidden rounded-[1.25rem] bg-muted will-change-transform lg:aspect-auto lg:h-[min(68vh,40rem)] lg:rounded-[999px_999px_18px_18px]">
            {STILLS.map((still, index) => (
              <img
                key={still.src}
                data-still
                src={still.src}
                alt={still.label}
                className="absolute inset-0 h-full w-full object-contain lg:object-cover"
                style={index === 0 ? undefined : { opacity: 0 }}
                width={720}
                height={900}
              />
            ))}
          </div>
          <p className="mt-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.2em]">
            <span data-still-name>{KINDS[0].label}</span>
            <span>Scroll — the edit plays</span>
          </p>
        </div>
        <div className="absolute bottom-2 left-4 right-4 z-10 h-px bg-foreground/15 sm:bottom-4">
          <div data-film-bar className="h-px origin-left scale-x-0 bg-[#62A848]" />
        </div>
      </div>
    </section>
  );
}
