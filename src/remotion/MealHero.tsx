import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

/**
 * MealHero — ambient, seamless-loop hero scene for the homepage.
 *
 * Lots of gentle, continuous motion (two counter-rotating ingredient rings,
 * drifting herb specks, rocking utensils, bobbing plate + meal box, rising
 * steam, pulsing badge) — yet every element is visible at every frame, so it
 * never collapses to an empty plate. All motion is period-locked to the clip
 * length via sin(2π·f/N), so the loop seam is invisible. Warm food palette only.
 */

export const MEAL_HERO = {
  width: 1200,
  height: 820,
  fps: 30,
  durationInFrames: 300,
} as const;

const TAU = Math.PI * 2;

type Orbit = { emoji: string; size: number; radius: number; base: number; ry: number; spin: number };

// Outer ring — larger ingredients, slow clockwise drift.
const OUTER: Orbit[] = [
  { emoji: '🍅', size: 74, radius: 392, base: 0.02, ry: 0.6, spin: 1 },
  { emoji: '🥦', size: 86, radius: 404, base: 0.36, ry: 0.55, spin: 1 },
  { emoji: '🥑', size: 78, radius: 384, base: 0.68, ry: 0.62, spin: 1 },
  { emoji: '🥕', size: 70, radius: 410, base: 0.2, ry: 0.58, spin: 1 },
  { emoji: '🌽', size: 72, radius: 396, base: 0.52, ry: 0.6, spin: 1 },
  { emoji: '🍋', size: 62, radius: 388, base: 0.85, ry: 0.64, spin: 1 },
];

// Inner ring — smaller accents, faster counter-clockwise drift.
const INNER: Orbit[] = [
  { emoji: '🌿', size: 46, radius: 300, base: 0.12, ry: 0.66, spin: -1.5 },
  { emoji: '🥚', size: 44, radius: 286, base: 0.45, ry: 0.7, spin: -1.5 },
  { emoji: '🫑', size: 48, radius: 308, base: 0.74, ry: 0.64, spin: -1.5 },
  { emoji: '🍄', size: 42, radius: 294, base: 0.95, ry: 0.68, spin: -1.5 },
];

// Tiny drifting specks (seeds / herb bits).
const SPECKS = ['🌱', '🫛', '🌶️', '🧄'];

const BOX_FOOD = ['🍗', '🥦', '🍚', '🥗'];

const Orbiter: React.FC<{ o: Orbit; cx: number; cy: number; loop: number; i: number }> = ({
  o,
  cx,
  cy,
  loop,
  i,
}) => {
  const a = o.base * TAU + loop * o.spin;
  const x = cx + Math.cos(a) * o.radius - o.size / 2;
  const y = cy + Math.sin(a) * o.radius * o.ry - o.size / 2;
  const rot = Math.sin(a + i) * 12 + i * 3;
  const depth = (Math.sin(a) + 1) / 2; // 0 back .. 1 front
  const bob = Math.sin(loop * 2 + i) * 5;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        fontSize: o.size,
        transform: `rotate(${rot}deg) scale(${0.82 + depth * 0.3})`,
        opacity: 0.72 + depth * 0.28,
        filter: `drop-shadow(0 ${12 + depth * 14}px ${16 + depth * 10}px rgba(71,56,36,0.22))`,
      }}
    >
      {o.emoji}
    </div>
  );
};

const Steam: React.FC<{ x: number; offset: number }> = ({ x, offset }) => {
  const frame = useCurrentFrame();
  const cycle = ((frame + offset) % 90) / 90;
  const y = interpolate(cycle, [0, 1], [0, -135]);
  const opacity = interpolate(cycle, [0, 0.25, 0.75, 1], [0, 0.55, 0.18, 0]);
  const wobble = Math.sin(cycle * Math.PI * 3 + offset) * 16;
  const scale = interpolate(cycle, [0, 1], [0.6, 1.5]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x + wobble,
        top: 232 + y,
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        filter: 'blur(9px)',
        opacity,
        transform: `scale(${scale})`,
      }}
    />
  );
};

export const MealHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const loop = (frame / durationInFrames) * TAU;
  const cx = width / 2;
  const cy = height / 2 - 10;

  const plateBob = Math.sin(loop) * 12;
  const plateTilt = Math.sin(loop) * 1.6;
  const glowPulse = 0.28 + (Math.sin(loop * 2) * 0.5 + 0.5) * 0.18;
  const rayRot = (frame / durationInFrames) * 18;

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(125% 105% at 50% 8%, #fffaf2 0%, #f7eedd 52%, #efe1c8 100%)',
        overflow: 'hidden',
        fontFamily: 'Fraunces, Georgia, serif',
      }}
    >
      {/* Slow rotating light rays */}
      <div
        style={{
          position: 'absolute',
          left: cx - 470,
          top: cy - 470,
          width: 940,
          height: 940,
          borderRadius: '50%',
          transform: `rotate(${rayRot}deg)`,
          background:
            'conic-gradient(from 0deg, rgba(243,193,75,0.10), rgba(243,193,75,0) 22%, rgba(79,143,69,0.10) 50%, rgba(243,193,75,0) 78%, rgba(243,193,75,0.10))',
          filter: 'blur(6px)',
        }}
      />

      {/* Pulsing warm glow */}
      <div
        style={{
          position: 'absolute',
          left: cx - 340,
          top: cy - 320,
          width: 680,
          height: 680,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(243,193,75,0.55) 0%, rgba(243,193,75,0) 68%)',
          opacity: glowPulse,
          filter: 'blur(10px)',
        }}
      />

      {/* Drifting specks */}
      {SPECKS.map((s, i) => {
        const t = loop * (0.7 + i * 0.15) + i * 1.7;
        const x = cx + Math.cos(t) * (180 + i * 60) - 14;
        const y = cy + Math.sin(t * 1.3) * (150 + i * 30) - 14;
        return (
          <div
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: 30,
              opacity: 0.55,
              transform: `rotate(${Math.sin(t) * 30}deg)`,
              filter: 'drop-shadow(0 8px 10px rgba(71,56,36,0.18))',
            }}
          >
            {s}
          </div>
        );
      })}

      {/* Two ingredient rings */}
      {OUTER.map((o, i) => (
        <Orbiter key={`o${i}`} o={o} cx={cx} cy={cy} loop={loop} i={i} />
      ))}
      {INNER.map((o, i) => (
        <Orbiter key={`i${i}`} o={o} cx={cx} cy={cy} loop={loop} i={i + 10} />
      ))}

      {/* Rocking utensils */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: cy - 40,
          fontSize: 84,
          transform: `rotate(${-18 + Math.sin(loop) * 6}deg)`,
          opacity: 0.9,
          filter: 'drop-shadow(0 16px 18px rgba(71,56,36,0.2))',
        }}
      >
        🍴
      </div>
      <div
        style={{
          position: 'absolute',
          right: 104,
          top: cy - 30,
          fontSize: 74,
          transform: `rotate(${20 + Math.sin(loop + 1) * 6}deg)`,
          opacity: 0.9,
          filter: 'drop-shadow(0 16px 18px rgba(71,56,36,0.2))',
        }}
      >
        🥢
      </div>

      {/* Plate + meal box */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${plateBob}px) rotate(${plateTilt}deg)` }}>
          <div
            style={{
              position: 'relative',
              width: 470,
              height: 470,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 36%, #ffffff 0%, #fdf4e6 58%, #efe0c8 100%)',
              boxShadow:
                '0 56px 100px -34px rgba(71,56,36,0.4), inset 0 0 0 15px rgba(255,255,255,0.75), inset 0 0 0 17px rgba(47,95,52,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Steam x={206} offset={0} />
            <Steam x={244} offset={30} />
            <Steam x={224} offset={62} />

            {/* Garnish sprig bobbing on the rim */}
            <div
              style={{
                position: 'absolute',
                top: 64,
                right: 120,
                fontSize: 52,
                transform: `rotate(${10 + Math.sin(loop * 1.6) * 8}deg) translateY(${Math.sin(loop * 1.6) * 4}px)`,
              }}
            >
              🌿
            </div>

            {/* Meal box */}
            <div
              style={{
                transform: `translateY(${Math.sin(loop + 0.6) * 6}px) rotate(${Math.sin(loop) * -2}deg)`,
                width: 308,
                height: 226,
                borderRadius: 30,
                background: 'linear-gradient(158deg, #ffffff, #f6ecdc)',
                boxShadow: '0 34px 54px -20px rgba(71,56,36,0.45)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 11,
                padding: 18,
              }}
            >
              {BOX_FOOD.map((food, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 17,
                    background: 'rgba(79,143,69,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                    transform: `translateY(${Math.sin(loop * 1.5 + i) * 4}px) rotate(${Math.sin(loop * 2 + i) * 4}deg) scale(${
                      0.98 + (Math.sin(loop * 2 + i) * 0.5 + 0.5) * 0.05
                    })`,
                  }}
                >
                  {food}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Badge */}
      <div
        style={{
          position: 'absolute',
          top: 92,
          left: cx - 96,
          transform: `translateY(${Math.sin(loop * 1.2) * 6}px) rotate(-5deg) scale(${
            1 + (Math.sin(loop * 2) * 0.5 + 0.5) * 0.05
          })`,
          background: '#4f8f45',
          color: '#fff',
          padding: '13px 26px',
          borderRadius: 999,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 25,
          boxShadow: '0 20px 34px -14px rgba(47,95,52,0.6)',
        }}
      >
        Tươi mỗi ngày
      </div>

      {/* Caption */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#2f5f34',
          fontWeight: 600,
          fontSize: 33,
          opacity: 0.92,
          transform: `translateY(${Math.sin(loop + 1) * 4}px)`,
        }}
      >
        Bữa ăn cân bằng, sẵn sàng để thưởng thức.
      </div>
    </AbsoluteFill>
  );
};

export const HERO_EASING = Easing.bezier(0.16, 1, 0.3, 1);
