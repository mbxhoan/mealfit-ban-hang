'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';

interface HomeHeroSceneProps {
  videoHref: string;
}

type Pose = { x: number; y: number; rotate: number; scale: number };

const HERO_POSES: Array<Record<'chicken' | 'beef' | 'salmon', Pose>> = [
  {
    chicken: { x: 0, y: 0, rotate: -10, scale: 1 },
    beef: { x: 0, y: 0, rotate: 6, scale: 1 },
    salmon: { x: 0, y: 0, rotate: -4, scale: 1 },
  },
  {
    chicken: { x: -10, y: 6, rotate: -12, scale: 1.02 },
    beef: { x: 10, y: -6, rotate: 4, scale: 1.05 },
    salmon: { x: 10, y: 4, rotate: -2, scale: 0.99 },
  },
  {
    chicken: { x: 10, y: -8, rotate: -7, scale: 0.98 },
    beef: { x: -10, y: 5, rotate: 8, scale: 1.01 },
    salmon: { x: -12, y: -6, rotate: 1, scale: 1.03 },
  },
];

const PARTICLES = [
  { left: '12%', top: '24%', size: 12, bg: 'radial-gradient(circle at 35% 30%, #6b5640, #241810)', dx: '-10px', dy: '-52px', dr: '-120deg', dur: '16s', delay: '-8s' },
  { left: '28%', top: '10%', size: 8, bg: 'radial-gradient(circle at 35% 30%, #9cc25a, #4e7a26)', dx: '12px', dy: '-44px', dr: '160deg', dur: '14s', delay: '-2s' },
  { left: '42%', top: '16%', size: 10, bg: 'radial-gradient(circle at 35% 30%, #e26a4a, #9c2a18)', dx: '14px', dy: '-58px', dr: '90deg', dur: '18s', delay: '-10s' },
  { left: '61%', top: '9%', size: 13, bg: 'radial-gradient(circle at 35% 30%, #6b5640, #241810)', dx: '-16px', dy: '-40px', dr: '130deg', dur: '15s', delay: '-5s' },
  { left: '76%', top: '21%', size: 9, bg: 'radial-gradient(circle at 35% 30%, #fffaf0, #e6dcc8)', dx: '18px', dy: '-50px', dr: '220deg', dur: '13s', delay: '-3s' },
  { left: '88%', top: '13%', size: 14, bg: 'radial-gradient(circle at 35% 30%, #e26a4a, #9c2a18)', dx: '6px', dy: '-38px', dr: '-90deg', dur: '17s', delay: '-12s' },
  { left: '20%', top: '38%', size: 11, bg: 'radial-gradient(circle at 35% 30%, #9cc25a, #4e7a26)', dx: '-14px', dy: '-60px', dr: '180deg', dur: '15s', delay: '-7s' },
  { left: '36%', top: '33%', size: 9, bg: 'radial-gradient(circle at 35% 30%, #d98a3a, #a85618)', dx: '20px', dy: '-32px', dr: '-140deg', dur: '14s', delay: '-1s' },
  { left: '52%', top: '41%', size: 12, bg: 'radial-gradient(circle at 35% 30%, #6b5640, #241810)', dx: '-12px', dy: '-48px', dr: '110deg', dur: '16s', delay: '-6s' },
  { left: '69%', top: '35%', size: 8, bg: 'radial-gradient(circle at 35% 30%, #fff, #f2ece0)', dx: '16px', dy: '-46px', dr: '70deg', dur: '12s', delay: '-4s' },
  { left: '83%', top: '46%', size: 10, bg: 'radial-gradient(circle at 35% 30%, #d98a3a, #a85618)', dx: '-18px', dy: '-54px', dr: '-170deg', dur: '15s', delay: '-9s' },
  { left: '9%', top: '61%', size: 12, bg: 'radial-gradient(circle at 35% 30%, #e26a4a, #9c2a18)', dx: '18px', dy: '-36px', dr: '120deg', dur: '18s', delay: '-2s' },
  { left: '27%', top: '68%', size: 9, bg: 'radial-gradient(circle at 35% 30%, #6b5640, #241810)', dx: '-20px', dy: '-62px', dr: '-200deg', dur: '14s', delay: '-11s' },
  { left: '48%', top: '73%', size: 13, bg: 'radial-gradient(circle at 35% 30%, #9cc25a, #4e7a26)', dx: '10px', dy: '-46px', dr: '150deg', dur: '13s', delay: '-5s' },
  { left: '64%', top: '64%', size: 11, bg: 'radial-gradient(circle at 35% 30%, #e26a4a, #9c2a18)', dx: '-14px', dy: '-52px', dr: '210deg', dur: '16s', delay: '-8s' },
  { left: '81%', top: '71%', size: 10, bg: 'radial-gradient(circle at 35% 30%, #6b5640, #241810)', dx: '20px', dy: '-34px', dr: '-130deg', dur: '14s', delay: '-3s' },
  { left: '92%', top: '59%', size: 7, bg: 'radial-gradient(circle at 35% 30%, #fff, #f2ece0)', dx: '-12px', dy: '-44px', dr: '100deg', dur: '12s', delay: '-7s' },
];

const HERBS = [
  { left: '18%', top: '15%', width: 28, fill: '#71b53b', rotate: '-18deg', dx: '16px', dy: '-22px', dr: '10deg', dur: '17s', delay: '-3s' },
  { left: '33%', top: '8%', width: 22, fill: '#5a9c2a', rotate: '16deg', dx: '-10px', dy: '16px', dr: '-12deg', dur: '14s', delay: '-6s' },
  { left: '49%', top: '20%', width: 34, fill: '#4e8a23', rotate: '-26deg', dx: '18px', dy: '18px', dr: '18deg', dur: '18s', delay: '-5s' },
  { left: '73%', top: '12%', width: 30, fill: '#7cc24a', rotate: '28deg', dx: '-14px', dy: '14px', dr: '-16deg', dur: '16s', delay: '-9s' },
  { left: '86%', top: '25%', width: 24, fill: '#6eb33b', rotate: '-18deg', dx: '12px', dy: '-12px', dr: '12deg', dur: '15s', delay: '-4s' },
  { left: '11%', top: '55%', width: 40, fill: '#6eb33b', rotate: '18deg', dx: '-10px', dy: '-18px', dr: '-8deg', dur: '19s', delay: '-7s' },
  { left: '28%', top: '82%', width: 26, fill: '#4e8a23', rotate: '-12deg', dx: '12px', dy: '18px', dr: '12deg', dur: '14s', delay: '-2s' },
  { left: '58%', top: '78%', width: 20, fill: '#7cc24a', rotate: '22deg', dx: '-16px', dy: '-10px', dr: '-14deg', dur: '18s', delay: '-6s' },
  { left: '73%', top: '63%', width: 38, fill: '#5a9c2a', rotate: '-28deg', dx: '10px', dy: '20px', dr: '14deg', dur: '17s', delay: '-8s' },
  { left: '90%', top: '76%', width: 30, fill: '#71b53b', rotate: '20deg', dx: '-12px', dy: '-18px', dr: '-10deg', dur: '16s', delay: '-1s' },
];

function HerbLeaf({
  fill,
  style,
}: {
  fill: string;
  style: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 16"
      className="home-hero-leaf absolute h-auto opacity-80 drop-shadow-[0_4px_6px_rgba(40,70,25,0.18)]"
      style={style}
    >
      <path d="M2 8 C 12 -2, 28 -2, 38 8 C 28 18, 12 18, 2 8 Z" fill={fill} />
      <path d="M4 8 L 36 8" stroke="rgba(40,70,25,0.38)" strokeWidth="1" />
    </svg>
  );
}

function ProteinFigure({
  active,
  alt,
  className,
  src,
  poseKey,
  floatDuration,
  floatOffset,
}: {
  active: number;
  alt: string;
  className: string;
  src: string;
  poseKey: 'chicken' | 'beef' | 'salmon';
  floatDuration: number;
  floatOffset: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={HERO_POSES[active][poseKey]}
      transition={{ type: 'spring', stiffness: 58, damping: 14, mass: 0.8 }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -floatOffset, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src={src}
          alt={alt}
          width={760}
          height={760}
          priority
          unoptimized
          sizes="(max-width: 640px) 74vw, (max-width: 1024px) 46vw, 38vw"
          className="home-hero-protein h-auto w-full"
        />
      </motion.div>
    </motion.div>
  );
}

export function HomeHeroScene({ videoHref }: HomeHeroSceneProps) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % HERO_POSES.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const goPrev = () => setActive((current) => (current + HERO_POSES.length - 1) % HERO_POSES.length);
  const goNext = () => setActive((current) => (current + 1) % HERO_POSES.length);

  return (
    <div className="relative mx-auto h-[24rem] w-full max-w-[31rem] sm:h-[30rem] sm:max-w-[38rem] lg:h-auto lg:max-w-[44rem] lg:aspect-square xl:max-w-[46rem]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((particle) => (
          <span
            key={`${particle.left}-${particle.top}`}
            className="home-hero-particle absolute rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              background: particle.bg,
              boxShadow: particle.size > 10 ? '0 1px 2px rgba(60,40,20,0.3)' : undefined,
              ['--dx' as string]: particle.dx,
              ['--dy' as string]: particle.dy,
              ['--dr' as string]: particle.dr,
              animationDuration: particle.dur,
              animationDelay: particle.delay,
            }}
          />
        ))}

        {HERBS.map((leaf) => (
          <HerbLeaf
            key={`${leaf.left}-${leaf.top}`}
            fill={leaf.fill}
            style={{
              left: leaf.left,
              top: leaf.top,
              width: leaf.width,
              transform: `rotate(${leaf.rotate})`,
              ['--dx' as string]: leaf.dx,
              ['--dy' as string]: leaf.dy,
              ['--dr' as string]: leaf.dr,
              animationDuration: leaf.dur,
              animationDelay: leaf.delay,
            }}
          />
        ))}
      </div>

      <ProteinFigure
        active={active}
        alt="Ức gà nướng MealFit"
        className="absolute left-[2%] top-[1%] z-30 w-[46%] sm:left-[0%] sm:top-[0%] sm:w-[48%] lg:left-[-2%] lg:top-[-1%] lg:w-[50%] xl:left-[-1%]"
        src="/home/chicken.png"
        poseKey="chicken"
        floatDuration={6.6}
        floatOffset={18}
      />
      <ProteinFigure
        active={active}
        alt="Thăn bò MealFit"
        className="absolute -right-[1%] top-[17%] z-20 w-[40%] sm:-right-[2%] sm:top-[16%] sm:w-[42%] lg:-right-[2%] lg:top-[18%] lg:w-[46%] xl:-right-[1%]"
        src="/home/beef.png"
        poseKey="beef"
        floatDuration={7.2}
        floatOffset={20}
      />
      <ProteinFigure
        active={active}
        alt="Cá hồi MealFit"
        className="absolute left-[7%] top-[43%] z-40 w-[66%] sm:left-[6%] sm:top-[44%] sm:w-[68%] lg:left-[8%] lg:top-[44%] lg:w-[72%] xl:left-[9%] xl:top-[43%]"
        src="/home/salmon.png"
        poseKey="salmon"
        floatDuration={5.8}
        floatOffset={16}
      />

      <div className="pointer-events-auto absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/72 px-3 py-2 shadow-[0_18px_34px_-20px_rgba(80,60,30,0.45)] backdrop-blur-md sm:bottom-4 sm:gap-4 sm:px-4 sm:py-2.5">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4ede1] text-[#8a857c] transition hover:bg-white hover:text-[#3e352d]"
          aria-label="Hiện protein trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {HERO_POSES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Hiện protein ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                index === active ? 'w-5 bg-[#ff7a1b]' : 'w-2.5 bg-[#d6cdc0]'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4ede1] text-[#8a857c] transition hover:bg-white hover:text-[#3e352d]"
          aria-label="Hiện protein tiếp theo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Link
        href={videoHref}
        className="absolute bottom-4 right-0 z-50 flex items-center gap-3 text-[#5f564b] transition hover:text-[#2d2a24] sm:right-4"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/62 shadow-[0_16px_30px_-18px_rgba(80,60,30,0.55)] backdrop-blur-md">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </span>
        <span className="hidden text-base font-semibold leading-snug sm:block">
          Xem video
          <span className="block text-[#8a8276]">về MealFit</span>
        </span>
      </Link>
    </div>
  );
}
