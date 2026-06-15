'use client';

import { useEffect, useState } from 'react';

/**
 * Renders a meal/combo photo when available, else a category emoji.
 * Image source resolution order:
 *   1. serverImageUrl  — from Supabase live data (rendered on the server)
 *   2. offline cache   — image saved in admin while running offline (localStorage)
 *   3. emoji fallback
 * Reading offline data in an effect (not during render) keeps SSR/CSR markup
 * identical, so there is no hydration mismatch.
 */

let offlineCache: Record<string, string> | null = null;
function offlineImages(): Record<string, string> {
  if (offlineCache) return offlineCache;
  offlineCache = {};
  try {
    const raw = localStorage.getItem('mealfit_meals_v2');
    if (raw) {
      for (const m of JSON.parse(raw)) {
        if (m?.code && m?.imageUrl) offlineCache[m.code] = m.imageUrl;
      }
    }
  } catch {
    /* ignore */
  }
  return offlineCache;
}

export function MealThumb({
  code,
  emoji,
  name,
  serverImageUrl,
  imgClass,
  emojiClass,
}: {
  code: string;
  emoji: string;
  name: string;
  serverImageUrl?: string;
  imgClass: string;
  emojiClass: string;
}) {
  const [src, setSrc] = useState(serverImageUrl ?? '');

  useEffect(() => {
    if (src) return;
    const url = offlineImages()[code];
    if (url) setSrc(url);
  }, [code, src]);

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} loading="lazy" className={imgClass} />;
  }
  return <span className={emojiClass}>{emoji}</span>;
}
