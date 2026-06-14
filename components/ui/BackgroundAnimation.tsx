/** Decorative drifting brand blobs. Fixed, behind content, pointer-events none, motion-safe. */
export function BackgroundAnimation() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
        style={{ animation: 'mf-drift 18s ease-in-out infinite' }}
      />
      <div
        className="absolute right-[-10%] top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-300/30 blur-3xl"
        style={{ animation: 'mf-drift 24s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute bottom-[-15%] left-1/4 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl"
        style={{ animation: 'mf-drift 30s ease-in-out infinite' }}
      />
    </div>
  );
}
