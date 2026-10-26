import { useEffect, type ReactNode } from 'react';
import { bindLenis, whenAwake } from '@/lib/page-scroll';

/**
 * Lenis smooth scroll, kept in step with GSAP ScrollTrigger.
 * Stays off when the visitor has asked for reduced motion.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let destroyed = false;
    let stop = () => {};

    const start = () => {
      if (destroyed) return;
    void Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([lenisMod, gsapMod, scrollMod]) => {
        if (destroyed) return;
        const Lenis = lenisMod.default;
        const gsap = gsapMod.default;
        const ScrollTrigger = scrollMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          lerp: 0.048,
          smoothWheel: true,
          wheelMultiplier: 0.833,
          syncTouch: false,
          prevent: (node) => Boolean(node.closest('[data-hscroll], [data-cube-control]')),
        });
        bindLenis(lenis);

        lenis.on('scroll', ScrollTrigger.update);
        const ticker = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(ticker);
        gsap.ticker.lagSmoothing(0);

        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener('bs-motion-refresh', refresh);
        window.addEventListener('load', refresh);
        requestAnimationFrame(refresh);

        stop = () => {
          bindLenis(null);
          window.removeEventListener('bs-motion-refresh', refresh);
          window.removeEventListener('load', refresh);
          gsap.ticker.remove(ticker);
          lenis.destroy();
        };
      },
    );
    };

    const cancelAwake = whenAwake(start);

    return () => {
      destroyed = true;
      cancelAwake();
      stop();
    };
  }, []);

  return children;
}
