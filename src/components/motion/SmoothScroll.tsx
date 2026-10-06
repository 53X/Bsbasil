import { useEffect, type ReactNode } from 'react';

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

    void Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([lenisMod, gsapMod, scrollMod]) => {
        if (destroyed) return;
        const Lenis = lenisMod.default;
        const gsap = gsapMod.default;
        const ScrollTrigger = scrollMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
          lerp: 0.075,
          smoothWheel: true,
          wheelMultiplier: 0.72,
          touchMultiplier: 1,
        });

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
          window.removeEventListener('bs-motion-refresh', refresh);
          window.removeEventListener('load', refresh);
          gsap.ticker.remove(ticker);
          lenis.destroy();
        };
      },
    );

    return () => {
      destroyed = true;
      stop();
    };
  }, []);

  return children;
}
