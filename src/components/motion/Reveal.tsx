import { useEffect, useRef, type ReactNode } from 'react';

/** GSAP entrance for anything marked data-reveal inside this wrapper. */
export default function Reveal({
  children,
  className,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
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
        const items = root.querySelectorAll('[data-reveal]');
        if (!items.length) return;
        if (immediate) {
          gsap.from(items, {
            y: 28,
            opacity: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out',
          });
          return;
        }
        gsap.from(items, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 86%',
            once: true,
          },
        });
      }, root);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert();
    };
  }, [immediate]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
