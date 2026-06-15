// Local-date range helpers for the statistics / orders filters.
// All values are `yyyy-mm-dd` strings comparable with stored deliveryDate.

export type DatePreset = 'week' | 'month' | 'custom' | 'all';

/** Format a Date as a local `yyyy-mm-dd` (no UTC shift). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday → Sunday of the week containing `ref` (default: today). */
export function currentWeek(ref: Date = new Date()): { from: string; to: string } {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toISODate(monday), to: toISODate(sunday) };
}

/** First → last day of the month containing `ref` (default: today). */
export function currentMonth(ref: Date = new Date()): { from: string; to: string } {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { from: toISODate(first), to: toISODate(last) };
}

/** Resolve a preset to a concrete range. `custom`/`all` keep the caller's range. */
export function rangeForPreset(
  preset: DatePreset,
  custom: { from: string; to: string },
): { from: string; to: string } {
  switch (preset) {
    case 'week':
      return currentWeek();
    case 'month':
      return currentMonth();
    case 'all':
      return { from: '', to: '' };
    default:
      return custom;
  }
}
