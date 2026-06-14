import { HeartPulse } from 'lucide-react';
import { Spinner } from './Spinner';

/** Full-viewport brand splash, used as a route loading fallback. */
export function LoadingScreen({ label = 'Đang tải MealFit…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <HeartPulse className="h-8 w-8" />
      </div>
      <div className="text-lg font-extrabold tracking-wide">MEALFIT</div>
      <div className="flex items-center gap-2 text-sm font-medium text-white/80">
        <Spinner className="h-4 w-4" />
        {label}
      </div>
    </div>
  );
}
