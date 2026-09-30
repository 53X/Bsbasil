import { useEffect, useState } from 'react';
import './HeroCube.css';

export type HeroFace = {
  category: string;
  headline: string;
  image: string;
  alt: string;
  href: string;
};

export const HERO_FACES: HeroFace[] = [
  {
    category: 'Romper',
    headline: 'Made for little adventures',
    image: '/hero-cube/romper.jpg',
    alt: 'Baby in a pink bunny romper',
    href: '/catalog?category=Romper',
  },
  {
    category: 'Sets',
    headline: 'A full outfit, ready to wear',
    image: '/hero-cube/sets.jpg',
    alt: 'Toddler in a navy check waistcoat set',
    href: '/catalog?category=Sets',
  },
  {
    category: 'Sleepwear',
    headline: 'Soft enough for sweet dreams',
    image: '/hero-cube/sleepwear.jpg',
    alt: 'Baby in a cherry print sleepsuit',
    href: '/catalog?category=Sleepwear',
  },
  {
    category: 'Romper',
    headline: 'Play clothes that keep up',
    image: '/hero-cube/dungarees.jpg',
    alt: 'Baby in blue giraffe dungarees',
    href: '/catalog?category=Romper',
  },
  {
    category: 'Winter wear',
    headline: 'Warm layers for cooler days',
    image: '/hero-cube/winter-wear.jpg',
    alt: 'Baby in a light blue giraffe hoodie',
    href: '/catalog?category=Winter%20wear',
  },
  {
    category: 'Sets',
    headline: 'Dressed for a little occasion',
    image: '/hero-cube/party-wear.jpg',
    alt: 'Toddler in a light blue waistcoat and shorts',
    href: '/catalog?category=Sets',
  },
];

const FACE_TRANSFORM = [
  'rotateY(0deg) translateZ(calc(var(--cube) / 2))',
  'rotateY(90deg) translateZ(calc(var(--cube) / 2))',
  'rotateY(180deg) translateZ(calc(var(--cube) / 2))',
  'rotateY(-90deg) translateZ(calc(var(--cube) / 2))',
  'rotateX(90deg) translateZ(calc(var(--cube) / 2))',
  'rotateX(-90deg) translateZ(calc(var(--cube) / 2))',
];

const POSES = [
  'rotateX(0deg) rotateY(0deg)',
  'rotateX(0deg) rotateY(-90deg)',
  'rotateX(0deg) rotateY(-180deg)',
  'rotateX(0deg) rotateY(-270deg)',
  'rotateX(-90deg) rotateY(-360deg)',
  'rotateX(90deg) rotateY(-360deg)',
];

const HOLD_MS = 3200;

export default function HeroCube({ onFaceChange }: { onFaceChange: (face: HeroFace) => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onFaceChange(HERO_FACES[index]);
  }, [index, onFaceChange]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_FACES.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-cube-scene" aria-hidden="true">
      <div className="hero-cube-tilt">
      <div className="hero-cube-rig" style={{ transform: POSES[index] }}>
        <div className="hero-cube">
          {HERO_FACES.map((face, faceIndex) => (
            <div key={face.image} className="hero-cube-face" style={{ transform: FACE_TRANSFORM[faceIndex] }}>
              <img src={face.image} alt="" sizes="(min-width: 1024px) 28vw, 62vw" />
              <span>{face.category}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
