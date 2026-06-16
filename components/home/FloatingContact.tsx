'use client';

import { Facebook, MessageCircle } from 'lucide-react';

/**
 * Floating bottom-right contact stack for the public (view-only) home page.
 * Shows Facebook + Zalo buttons that link straight to chat; each wiggles
 * periodically (`mf-shake`, motion-reduce safe) to draw attention.
 * A button is omitted when its link is not configured by the admin.
 */
export function FloatingContact({ facebookUrl, zaloUrl }: { facebookUrl?: string; zaloUrl?: string }) {
  const buttons = [
    facebookUrl && {
      href: facebookUrl,
      label: 'Facebook',
      bg: '#1877F2',
      icon: <Facebook className="h-6 w-6" fill="currentColor" stroke="none" />,
    },
    zaloUrl && {
      href: zaloUrl,
      label: 'Zalo',
      bg: '#0068FF',
      icon: <MessageCircle className="h-6 w-6" fill="currentColor" stroke="none" />,
    },
  ].filter(Boolean) as { href: string; label: string; bg: string; icon: React.ReactNode }[];

  if (!buttons.length) return null;

  return (
    <div
      className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {buttons.map((b, i) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Liên hệ qua ${b.label}`}
          className="group flex items-center gap-2"
        >
          <span className="pointer-events-none hidden rounded-full bg-meal-green-dark px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:inline-block">
            {b.label}
          </span>
          <span
            className="mf-shake flex items-center justify-center rounded-full text-white shadow-[0_12px_28px_-8px_rgba(0,0,0,0.45)] ring-2 ring-white/70 transition-transform duration-200 hover:scale-110"
            style={{ backgroundColor: b.bg, height: 52, width: 52, animationDelay: `${i * 0.4}s` }}
          >
            {b.icon}
          </span>
        </a>
      ))}
    </div>
  );
}
