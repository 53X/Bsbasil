import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { heroSources, HERO_SIZES } from '@/lib/hero-image';
import { bindCubeSteer, scrollPageBy, whenAwake } from '@/lib/page-scroll';
import '../HeroCube.css';

const COUNT = 6;

const POSES = [
  { x: 0, y: 0 },
  { x: 0, y: -90 },
  { x: 0, y: -180 },
  { x: 0, y: -270 },
  { x: -90, y: -360 },
  { x: -270, y: -360 },
];

const FACE_TRANSFORM = [
  'rotateY(0deg) translateZ(calc(var(--cube) / 2))',
  'rotateY(90deg) translateZ(calc(var(--cube) / 2))',
  'rotateY(180deg) translateZ(calc(var(--cube) / 2))',
  'rotateY(-90deg) translateZ(calc(var(--cube) / 2))',
  'rotateX(90deg) translateZ(calc(var(--cube) / 2))',
  'rotateX(-90deg) translateZ(calc(var(--cube) / 2))',
];

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
    src: '/hero-cube/dungarees.webp',
    label: 'Dungarees',
    href: '/catalog?category=Romper',
    lead: 'Play clothes',
    script: 'that keep up',
    sub: 'Room to crawl, climb, and still make it back for a cuddle.',
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
    src: '/hero-cube/party-wear.webp',
    label: 'Party wear',
    href: '/catalog?category=Sets',
    lead: 'Dressed up',
    script: 'for a little occasion',
    sub: 'Waistcoat, shorts, and a bow for the photos.',
  },
];

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

function wrapFace(progress: number) {
  return ((progress % COUNT) + COUNT) % COUNT;
}

function poseUnwrapped(index: number) {
  const cycle = Math.floor(index / COUNT);
  const face = wrapFace(index);
  return {
    x: POSES[face].x + cycle * -360,
    y: POSES[face].y + cycle * -360,
  };
}

/**
 * Sticky hero. The cube loops: rompers follows party wear in both directions.
 */
export default function CinematicHero({ eyebrow }: { eyebrow: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const faceRef = useRef(0);
  const [face, setFace] = useState(0);
  const [showAllFaces, setShowAllFaces] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let revert = () => {};
    let cancelled = false;

    const run = () => {
    setShowAllFaces(true);
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, scrollMod]) => {
      if (cancelled || !rootRef.current) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      let unbindScrub = () => {};
      const ctx = gsap.context(() => {
        const labels = gsap.utils.toArray<HTMLElement>('[data-type]');
        const rig = root.querySelector('[data-cube-rig]');
        const faces = gsap.utils.toArray<HTMLElement>('[data-cube-face]');
        const lead = root.querySelector('[data-hero-lead]');
        const script = root.querySelector('[data-hero-script]');
        const sub = root.querySelector('[data-hero-sub]');
        const bar = root.querySelector('[data-film-bar]');
        const control = root.querySelector('[data-cube-control]');
        let settled = 0;
        let pending = 0;
        let lastScroll = window.scrollY;
        let ignoreScrollUntil = 0;

        const unit = () => {
          const pin = root.offsetHeight - Math.max(240, window.innerHeight - 100);
          return Math.max(160, pin) / COUNT;
        };

        const pageMax = () =>
          Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        const pageBlocked = (delta: number) => {
          const y = window.scrollY;
          return (delta < 0 && y <= 0) || (delta > 0 && y >= pageMax());
        };

        const showFace = (index: number) => {
          const kind = KINDS[index];
          if (index !== faceRef.current) {
            faceRef.current = index;
            setFace(index);
          }
          labels.forEach((label, i) => label.classList.toggle('is-on', i === index));
          faces.forEach((face, i) => {
            const front = i === index;
            face.toggleAttribute('data-front', front);
            face.setAttribute('aria-hidden', front ? 'false' : 'true');
          });
          paintLine(lead, kind?.lead ?? '');
          paintLine(script, kind?.script ?? '');
          paintLine(sub, kind?.sub ?? '');
          if (bar instanceof HTMLElement) {
            gsap.set(bar, { scaleX: index / COUNT });
          }
        };

        const paintRig = (next: number, animate: boolean) => {
          if (!(rig instanceof HTMLElement)) return;
          const pose = poseUnwrapped(next);
          rig.style.transition = animate
            ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none';
          rig.style.transform = `translate3d(0,0,0) rotateX(${pose.x}deg) rotateY(${pose.y}deg)`;
        };

        const goTo = (next: number) => {
          if (next > 60 || next < -60) next = wrapFace(next);
          settled = next;
          pending = 0;
          showFace(wrapFace(next));
          paintRig(next, true);
        };

        const commit = () => {
          if (Math.abs(pending) < 0.08) {
            pending = 0;
            return;
          }
          const dir = Math.sign(pending);
          const steps = Math.abs(pending) >= 0.85 ? Math.max(1, Math.round(Math.abs(pending))) : 1;
          goTo(settled + dir * steps);
        };

        const feed = (deltaProgress: number) => {
          if (!deltaProgress) return;
          pending += deltaProgress;
          if (Math.abs(pending) < 0.22) return;
          commit();
        };

        const heroVisible = () => {
          const box = root.getBoundingClientRect();
          return box.bottom > 80 && box.top < window.innerHeight;
        };

        const scrollDrivesCube = () => window.matchMedia('(min-width: 1024px)').matches;

        const onScroll = () => {
          const y = window.scrollY;
          const dy = y - lastScroll;
          lastScroll = y;
          if (!scrollDrivesCube()) return;
          if (performance.now() < ignoreScrollUntil) return;
          if (!heroVisible()) return;
          if (Math.abs(dy) < 6) return;
          feed(dy / unit());
        };

        if (rig instanceof HTMLElement) {
          gsap.killTweensOf(rig);
          rig.style.willChange = 'transform';
          paintRig(0, false);
        }

        const onWheel = (event: WheelEvent) => {
          if (!scrollDrivesCube()) return;
          if (event.target instanceof Element && event.target.closest('[data-cube-control]')) return;
          const delta = event.deltaY + event.deltaX;
          if (!delta || !heroVisible() || !pageBlocked(delta)) return;
          event.preventDefault();
          feed(delta / unit());
          commit();
        };

        if (control instanceof HTMLElement) {
          unbindScrub = bindCubeSteer(
            control,
            (delta) => {
              ignoreScrollUntil = performance.now() + 480;
              feed(delta / Math.max(140, control.clientWidth * 0.55));
              if (!pageBlocked(delta)) scrollPageBy(delta);
            },
            () => commit(),
          );
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        root.addEventListener('wheel', onWheel, { passive: false });
        showFace(0);
        const previousUnbind = unbindScrub;
        unbindScrub = () => {
          if (rig instanceof HTMLElement) gsap.killTweensOf(rig);
          window.removeEventListener('scroll', onScroll);
          root.removeEventListener('wheel', onWheel);
          previousUnbind();
        };
      }, root);

      revert = () => {
        unbindScrub();
        ctx.revert();
      };
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

    const cancelAwake = whenAwake(run);

    return () => {
      cancelled = true;
      cancelAwake();
      revert();
    };
  }, []);

  useLayoutEffect(() => {
    window.dispatchEvent(new Event('bs-boot-ready'));
  }, []);

  return (
    <section ref={rootRef} className="relative bg-background">
      <div className="hero-stage relative mx-auto grid h-auto max-w-content grid-rows-[auto_auto] items-start gap-3 overflow-visible px-4 py-3 sm:gap-4 sm:py-5 lg:min-h-[calc(100dvh-6.25rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-none lg:items-center lg:gap-8">
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
          <ul className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-5" aria-label="Clothing types">
            {KINDS.map((kind, index) => (
              <li key={kind.label} className="min-w-0">
                <Link
                  data-type
                  to={kind.href}
                  className={`flex min-h-9 w-full items-center justify-center whitespace-nowrap rounded-full border px-2 text-center text-[10px] font-semibold uppercase leading-none tracking-tight sm:text-[11px] ${index === 0 ? 'is-on' : ''}`}
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
        <div className="hero-cube-column relative z-10 mt-8 flex h-[var(--cube)] w-[var(--cube)] max-w-full shrink-0 flex-col items-center justify-center self-center justify-self-center lg:mt-0 lg:h-full lg:w-full lg:max-w-none lg:shrink lg:self-stretch lg:justify-self-stretch">
          <div data-hero-photo className="hero-cube-scene" aria-hidden="true">
            <div className="hero-cube-tilt">
              <div data-cube-rig className="hero-cube-rig">
                <div className="hero-cube">
                  {KINDS.map((kind, index) => (
                    <div
                      key={kind.label}
                      data-cube-face
                      data-cube-front={index === 0 ? '' : undefined}
                      className="hero-cube-face"
                      style={{ transform: FACE_TRANSFORM[index] }}
                      aria-hidden={index === 0 ? undefined : true}
                    >
                      {index === 0 || showAllFaces ? (
                        <img
                          alt={kind.label}
                          {...heroSources(index === 0 ? '/hero-cube/romper.webp' : kind.src)}
                          sizes={HERO_SIZES}
                          width={520}
                          height={616}
                          decoding={index === 0 ? 'sync' : 'async'}
                          fetchPriority={index === 0 ? 'high' : 'low'}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link
            to={KINDS[face].href}
            aria-label={`Shop ${KINDS[face].label}`}
            data-cube-control
            className="hero-cube-link"
          />
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-10 hidden h-px bg-foreground/15 lg:block">
          <div data-film-bar className="h-px origin-left scale-x-0 bg-primary" />
        </div>
      </div>
    </section>
  );
}
