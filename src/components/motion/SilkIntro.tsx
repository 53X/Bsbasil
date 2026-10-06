import { useEffect, useRef, useState } from 'react';
import ColorWash from '@/components/motion/ColorWash';

/** Silk panel that tears upward once the page is ready. Skipped when motion is reduced. */
export default function SilkIntro() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDone(true);
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    let kill = () => {};
    let cancelled = false;
    const failSafe = window.setTimeout(() => setDone(true), 2200);
    void import('gsap').then((mod) => {
      if (cancelled) return;
      const tween = mod.default.to(panel, {
        yPercent: -110,
        duration: 1.15,
        delay: 0.35,
        ease: 'power4.inOut',
        onComplete: () => {
          setDone(true);
          window.dispatchEvent(new Event('bs-motion-refresh'));
        },
      });
      kill = () => tween.kill();
    });
    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      kill();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={panelRef} data-silk-intro className="fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
      <ColorWash className="absolute inset-0 h-full w-full" />
      <div className="relative flex h-full flex-col items-center justify-center text-[#122117]">
        <p className="text-xs uppercase tracking-[0.42em]">Bsbasil</p>
        <p className="mt-4 font-[family-name:var(--font-heading)] text-6xl leading-none md:text-8xl">The edit</p>
      </div>
    </div>
  );
}
