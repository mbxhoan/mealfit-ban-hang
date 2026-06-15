'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import MealHeroPlayer from './MealHeroPlayer';

/** Framed hero animation with a gentle idle float + soft scroll parallax. */
export function HeroVisual() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallax = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -56]);

  return (
    <motion.div
      ref={ref}
      style={{ y: parallax }}
      className="relative"
      initial={reduced ? false : { opacity: 0, scale: 0.94, y: 24 }}
      animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-meal-green/10 shadow-[0_44px_100px_-44px_rgba(71,56,36,0.5)] sm:aspect-[5/4]"
      >
        <MealHeroPlayer />
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="pointer-events-none absolute -bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-meal-surface px-4 py-2 text-xs font-bold text-meal-green-dark shadow-[0_18px_40px_-18px_rgba(71,56,36,0.4)] sm:flex"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-meal-green" /> Thực đơn cập nhật mỗi ngày
      </motion.div>
    </motion.div>
  );
}
