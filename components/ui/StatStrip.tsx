import React from "react";

export interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  /** tailwind text color for the icon chip, e.g. "text-brand-600 bg-brand-50" */
  accent?: string;
}

/** Responsive quick-stats header. 2 cols on mobile → 4 on desktop, no horizontal scroll. */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.accent ?? "bg-brand-50 text-brand-600"}`}>
            {s.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="stat-value truncate text-slate-800">{s.value}</p>
            {s.sub && <p className="truncate text-[10px] font-medium text-slate-400">{s.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
