import React from 'react';
import { Composition } from 'remotion';
import { MealHero, MEAL_HERO } from './MealHero';

/**
 * Remotion studio root. Preview / still-render with:
 *   npx remotion studio src/remotion/index.ts
 *   npx remotion still MealHero public/hero-poster.png --frame=120
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MealHero"
      component={MealHero}
      durationInFrames={MEAL_HERO.durationInFrames}
      fps={MEAL_HERO.fps}
      width={MEAL_HERO.width}
      height={MEAL_HERO.height}
    />
  );
};
