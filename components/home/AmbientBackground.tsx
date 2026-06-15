/**
 * Ambient page background for the home page:
 *   1. soft warm gradient orbs drifting behind every section
 *   2. a faint organic dot field slowly panning
 *   3. a layer of fresh ingredients gently floating (food theme, low opacity)
 * Pure CSS, fixed, non-interactive, fully disabled under prefers-reduced-motion.
 */

// Visible floating produce across the whole page (matching the CTA corner look).
const FLOATERS = [
  { e: '🍅', top: '8%', left: '5%', size: 56, dur: 9, r: -8, op: 0.5 },
  { e: '🥦', top: '22%', left: '90%', size: 64, dur: 11, r: 10, op: 0.42 },
  { e: '🥑', top: '48%', left: '3%', size: 60, dur: 10, r: 6, op: 0.5 },
  { e: '🥕', top: '66%', left: '93%', size: 52, dur: 12, r: -10, op: 0.46 },
  { e: '🌿', top: '38%', left: '48%', size: 44, dur: 13, r: 8, op: 0.3 },
  { e: '🥚', top: '84%', left: '20%', size: 46, dur: 9.5, r: -6, op: 0.4 },
  { e: '🫑', top: '14%', left: '62%', size: 52, dur: 11.5, r: 9, op: 0.4 },
  { e: '🍋', top: '58%', left: '72%', size: 48, dur: 10.5, r: -7, op: 0.44 },
  { e: '🌽', top: '30%', left: '14%', size: 50, dur: 12.5, r: 7, op: 0.42 },
  { e: '🍄', top: '74%', left: '54%', size: 44, dur: 10.8, r: -9, op: 0.36 },
  { e: '🫛', top: '90%', left: '80%', size: 42, dur: 11.8, r: 6, op: 0.38 },
  { e: '🍠', top: '6%', left: '34%', size: 48, dur: 13.2, r: -8, op: 0.36 },
  { e: '🥬', top: '52%', left: '30%', size: 52, dur: 9.8, r: 9, op: 0.34 },
  { e: '🍆', top: '20%', left: '78%', size: 46, dur: 12.2, r: -6, op: 0.36 },
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
            filter: 'drop-shadow(0 12px 16px rgba(71,56,36,0.12))',
          }}
        >
          {f.e}
        </span>
      ))}
    </div>
  );
}
