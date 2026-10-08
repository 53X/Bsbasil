import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

const KINDS = [
  {
    src: '/hero-cube/romper.webp',
    label: 'Rompers',
    href: '/catalog?category=Romper',
    lead: 'Premium comfort',
    script: 'for precious little ones',
    sub: 'Soft all day, from the first feed to the last cuddle.',
  },
  {
    src: '/hero-cube/sets.webp',
    label: 'Sets',
    href: '/catalog?category=Sets',
    lead: 'Tiny elegance',
    script: 'for big celebration',
    sub: 'A dressed-up set for parties, photos, and everyone waiting to see them.',
  },
  {
    src: '/hero-cube/sleepwear.webp',
    label: 'Sleepwear',
    href: '/catalog?category=Sleepwear',
    lead: 'Cute comfort',
    script: 'for every little journey',
    sub: 'For naps, nights, and every small trip in between.',
  },
  {
    src: '/hero-cube/winter-wear.webp',
    label: 'Winter wear',
    href: '/catalog?category=Winter%20wear',
    lead: 'Cozy warmth',
    script: 'for chilly mornings',
    sub: 'A warm layer that still lets them play.',
  },
  {
    src: '',
    label: 'Accessories',
    href: '/catalog?category=Accessories',
    lead: 'Sweet details',
    script: 'for tiny looks',
    sub: 'The little extras that finish a romper, a set, or a sleepy night.',
  },
];
const STILLS = KINDS.filter((kind) => kind.src);

/** Replace a hero line without wiping a matching word animation already on screen. */
function paintLine(el: Element | null, text: string) {
  if (!(el instanceof HTMLElement)) return;
  const next = text.replace(/\s+/g, ' ').trim();
  if (el.dataset.raw === next) return;
  el.dataset.raw = next;
  el.textContent = text;
  delete el.dataset.words;
  delete el.dataset.played;
  const heading = el.closest('h1, h2, h3');
  if (heading instanceof HTMLElement) {
    delete heading.dataset.words;
    delete heading.dataset.played;
  }
  el.dispatchEvent(new CustomEvent('bs-line-change', { bubbles: true }));
}

/**
 * Sticky hero. Scrolling plays all six clothing types: the photograph
 * crossfades through each still while the matching name lights up.
 */
export default function CinematicHero({ eyebrow }: { eyebrow: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const [restReady, setRestReady] = useState(false);
  const [hasPoster] = useState(
    () => typeof document !== 'undefined' && Boolean(document.getElementById('hero-lcp')),
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let revert = () => {};
    let cancelled = false;

    const run = () => {
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled || !rootRef.current) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const wide = window.matchMedia('(min-width: 1024px)').matches;

      const ctx = gsap.context(() => {
        const stills = gsap.utils.toArray<HTMLElement>('[data-still]');
        const labels = gsap.utils.toArray<HTMLElement>('[data-type]');
        const caption = root.querySelector('[data-still-name]');
        const lead = root.querySelector('[data-hero-lead]');
        const script = root.querySelector('[data-hero-script]');
        const sub = root.querySelector('[data-hero-sub]');
        const bar = root.querySelector('[data-film-bar]');
        const mark = (progress: number) => {
          const index = Math.min(KINDS.length - 1, Math.floor(progress * KINDS.length));
          const kind = KINDS[index];
          const stillIndex = Math.min(stills.length - 1, index);
          labels.forEach((label, i) => label.classList.toggle('is-on', i === index));
          stills.forEach((still, i) => {
            still.style.opacity = i === stillIndex ? '1' : '0';
          });
          if (caption) caption.textContent = kind?.label ?? '';
          paintLine(lead, kind?.lead ?? '');
          paintLine(script, kind?.script ?? '');
          paintLine(sub, kind?.sub ?? '');
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

        if (wide) {
          timeline.fromTo('[data-hero-photo]', { scale: 1.14 }, { scale: 1, ease: 'none', duration: 1 }, 0);
        }
        timeline.fromTo('[data-watermark]', { xPercent: -4 }, { xPercent: 8, ease: 'none', duration: 1 }, 0);

        if (bar) timeline.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
        mark(0);
      }, root);

      revert = () => ctx.revert();
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('resize', refresh);
      ScrollTrigger.refresh();
      const previousRevert = revert;
      revert = () => {
        window.removeEventListener('resize', refresh);
        previousRevert();
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
  }, []);

  useLayoutEffect(() => {
    const poster = document.getElementById('hero-lcp');
    const frame = rootRef.current?.querySelector('[data-hero-photo]');
    if (poster instanceof HTMLImageElement && frame instanceof HTMLElement) {
      poster.dataset.still = 'true';
      poster.className = 'absolute inset-0 h-full w-full object-contain lg:object-cover';
      poster.removeAttribute('style');
      if (poster.parentElement !== frame) frame.prepend(poster);
    }
    window.dispatchEvent(new Event('bs-boot-ready'));
  }, []);

  useEffect(() => {
    const arm = () => {
      if (window.scrollY > 24) setRestReady(true);
    };
    window.addEventListener('scroll', arm, { passive: true });
    const next = STILLS[1]?.src;
    const warm = () => {
      if (!next) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = next;
    };
    const poster = document.getElementById('hero-lcp');
    if (poster instanceof HTMLImageElement && poster.complete) warm();
    else poster?.addEventListener('load', warm, { once: true });
    return () => window.removeEventListener('scroll', arm);
  }, []);

  return (
    <section ref={rootRef} className="relative h-[280svh] bg-background sm:h-[340svh] lg:h-[380vh]">
      <div className="sticky top-[6.25rem] mx-auto grid h-[calc(100svh-6.25rem)] max-w-content grid-rows-[auto_minmax(0,1fr)] items-stretch gap-3 overflow-hidden px-4 py-3 sm:gap-4 sm:py-5 lg:h-[calc(100dvh-6.25rem)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-none lg:items-stretch lg:gap-8">
        <p data-watermark className="watermark" aria-hidden="true">
          COLOUR
        </p>
        <div className="relative z-10 min-h-0 min-w-0">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:mb-5 sm:text-xs sm:tracking-[0.24em]" style={{ color: 'hsl(var(--brand-ink))' }}>
            {eyebrow}
          </p>
          <h1 className="max-w-full pr-4 text-[clamp(1.7rem,8vw,4.15rem)] leading-none sm:pr-8">
            <span data-line="a" data-hero-lead className="block leading-[1.05]">
              {KINDS[0].lead}
            </span>
            <em data-line="b" data-hero-script className="mt-[0.55em] block max-w-[32rem] text-[0.92em] leading-[1.25] lg:mt-[0.72em]">
              {KINDS[0].script}
            </em>
          </h1>
          <p data-hero-sub className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed sm:mt-5 sm:text-base md:text-lg lg:line-clamp-none" style={{ color: 'hsl(var(--foreground) / 0.78)' }}>
            {KINDS[0].sub}
          </p>
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:mt-5 lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden" aria-label="Clothing types">
            {KINDS.map((kind, index) => (
              <li key={kind.label} className="shrink-0">
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
          <div className="mt-3 flex flex-col gap-3 sm:mt-6 sm:flex-row">
            <Link
              to="/catalog"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground sm:w-auto sm:px-7"
            >
              Explore the collection
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="relative z-10 flex min-h-0 flex-col lg:h-full">
          <div className="absolute -left-4 top-8 hidden h-[78%] w-16 bg-[#62A848] xl:block" aria-hidden="true" />
          <div data-hero-photo className="relative min-h-[9rem] w-full flex-1 overflow-hidden rounded-[1.25rem] bg-muted will-change-transform lg:rounded-[999px_999px_18px_18px]">
            {STILLS.map((still, index) => index === 0 && hasPoster ? null : (
              <img
                key={still.src}
                data-still
                src={index === 0 || restReady ? still.src : undefined}
                srcSet={index === 0 ? `${still.src.replace('.webp', '-640.webp')} 640w, ${still.src} 960w` : undefined}
                sizes={index === 0 ? '(min-width: 1024px) 42vw, 92vw' : undefined}
                alt={still.label}
                className="absolute inset-0 h-full w-full object-contain lg:object-cover"
                style={index === 0 ? undefined : { opacity: 0 }}
                width={720}
                height={900}
                decoding="async"
                {...(index === 0
                  ? { fetchPriority: 'high' as const, loading: 'eager' as const }
                  : { fetchPriority: 'low' as const, loading: 'lazy' as const })}
              />
            ))}
          </div>
          <p className="mt-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.2em]">
            <span data-still-name>{KINDS[0].label}</span>
            <span className="italic-accent normal-case tracking-normal text-base">the edit</span>
          </p>
        </div>
        <div className="absolute bottom-2 left-4 right-4 z-10 h-px bg-foreground/15 sm:bottom-4">
          <div data-film-bar className="h-px origin-left scale-x-0 bg-[#62A848]" />
        </div>
      </div>
    </section>
  );
}
