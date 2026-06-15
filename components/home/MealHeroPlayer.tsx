'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { PlayerRef } from '@remotion/player';
import { MealHero, MEAL_HERO } from '@/src/remotion/MealHero';

// @remotion/player is browser-only and heavy — load it on the client after the
// page is interactive. The static fallback shows during SSR + chunk load, so
// there is no layout shift and no JS-disabled blank.
const Player = dynamic(() => import('@remotion/player').then((m) => m.Player), {
  ssr: false,
  loading: () => <StaticHero />,
});

/** CSS-only twin of the Remotion scene — used for SSR, loading, and reduced motion. */
function StaticHero() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 100% at 50% 12%, #fff8ef 0%, #f6ecdc 55%, #efe1c8 100%)',
      }}
      aria-hidden
    >
      <span className="meal-float absolute left-[10%] top-[24%] text-5xl" style={{ ['--dur' as string]: '7s' }}>🍅</span>
      <span className="meal-float absolute right-[12%] top-[20%] text-6xl" style={{ ['--dur' as string]: '8s' }}>🥦</span>
      <span className="meal-float absolute left-[14%] bottom-[18%] text-5xl" style={{ ['--dur' as string]: '6.5s' }}>🥑</span>
      <span className="meal-float absolute right-[14%] bottom-[20%] text-4xl" style={{ ['--dur' as string]: '7.5s' }}>🌿</span>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-[68%] aspect-square items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 38%, #fff 0%, #fdf4e6 60%, #f0e2cb 100%)',
            boxShadow:
              '0 50px 90px -30px rgba(71,56,36,0.35), inset 0 0 0 14px rgba(255,255,255,0.7), inset 0 0 0 16px rgba(47,95,52,0.08)',
          }}
        >
          <div className="grid grid-cols-2 gap-2 rounded-3xl bg-gradient-to-br from-white to-[#f6ecdc] p-4 shadow-2xl">
            {['🍗', '🥦', '🍚', '🥗'].map((f) => (
              <div key={f} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4f8f45]/8 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealHeroPlayer() {
  const [reduced, setReduced] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Force playback once the player has mounted (belt-and-braces with autoPlay).
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      if (p.isPlaying?.()) {
        clearInterval(id);
        return;
      }
      try {
        p.play();
      } catch {
        /* ignore until ready */
      }
    }, 200);
    return () => clearInterval(id);
  }, [reduced]);

  if (reduced) return <StaticHero />;

  return (
    <Player
      ref={playerRef}
      component={MealHero}
      durationInFrames={MEAL_HERO.durationInFrames}
      fps={MEAL_HERO.fps}
      compositionWidth={MEAL_HERO.width}
      compositionHeight={MEAL_HERO.height}
      autoPlay
      loop
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
