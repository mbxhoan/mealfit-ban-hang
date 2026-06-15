'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Staggered word reveal — each word lifts and fades in. Plays when scrolled
 * into view (once). Respects reduced motion and stays accessible (full phrase
 * exposed via aria-label, words hidden from assistive tech). No clipping mask,
 * so Vietnamese diacritics above/below the baseline are never cut.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  step = 0.05,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          initial={{ y: '0.45em', opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: delay + i * step, ease: [0.16, 1, 0.3, 1] }}
        >
          {i < words.length - 1 ? `${w} ` : w}
        </motion.span>
      ))}
    </span>
  );
}

/** Keeps a decorative inline accent on its own block line. */
export function RevealLine({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={`block ${className ?? ''}`}>{children}</span>;
}
