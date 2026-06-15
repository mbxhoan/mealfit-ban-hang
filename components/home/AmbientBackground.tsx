/**
 * Ambient page background for the home page:
 *   1. soft warm gradient orbs drifting behind every section
 *   2. a faint organic dot field slowly panning
 *   3. a layer of fresh ingredients gently floating (food theme, low opacity)
 * Pure CSS, fixed, non-interactive, fully disabled under prefers-reduced-motion.
 */

const FLOATERS = [
  { e: '🍅', top: '12%', left: '6%', size: 34, dur: 9, r: -8, op: 0.16 },
  { e: '🥦', top: '26%', left: '88%', size: 40, dur: 11, r: 10, op: 0.14 },
  { e: '🥑', top: '54%', left: '4%', size: 36, dur: 10, r: 6, op: 0.15 },
  { e: '🥕', top: '70%', left: '92%', size: 32, dur: 12, r: -10, op: 0.14 },
  { e: '🌿', top: '40%', left: '46%', size: 30, dur: 13, r: 8, op: 0.1 },
  { e: '🥚', top: '82%', left: '24%', size: 28, dur: 9.5, r: -6, op: 0.13 },
  { e: '🫑', top: '16%', left: '64%', size: 34, dur: 11.5, r: 9, op: 0.12 },
  { e: '🍋', top: '60%', left: '70%', size: 30, dur: 10.5, r: -7, op: 0.13 },
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Drifting warm orbs */}
      <div
        className="meal-orb absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,143,69,0.20), rgba(79,143,69,0) 70%)',
          animation: 'mf-drift 26s ease-in-out infinite',
        }}
      />
      <div
        className="meal-orb absolute right-[-12%] top-[18%] h-[30rem] w-[30rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,139,60,0.18), rgba(239,139,60,0) 70%)',
          animation: 'mf-drift 32s ease-in-out infinite reverse',
        }}
      />
      <div
        className="meal-orb absolute bottom-[-15%] left-[28%] h-[28rem] w-[28rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(243,193,75,0.20), rgba(243,193,75,0) 70%)',
          animation: 'mf-drift 38s ease-in-out infinite',
        }}
      />

      {/* Faint organic dot field, slowly panning */}
      <div className="meal-dots absolute inset-0" />

      {/* Floating fresh ingredients */}
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className="meal-float absolute select-none"
          style={{
            top: f.top,
            left: f.left,
            fontSize: f.size,
            opacity: f.op,
            ['--dur' as string]: `${f.dur}s`,
            ['--r' as string]: `${f.r}deg`,
            animationDelay: `${i * -1.3}s`,
            filter: 'saturate(0.9)',
          }}
        >
          {f.e}
        </span>
      ))}
    </div>
  );
}
