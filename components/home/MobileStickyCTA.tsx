'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Mobile-only sticky order bar — slides up after the user scrolls past the hero. */
export function MobileStickyCTA({ fromPrice }: { fromPrice: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-[#4f8f45]/15 bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="text-[11px] font-semibold text-[#6d756e]">Thực đơn tươi mỗi ngày</p>
          <p className="text-sm font-extrabold text-[#243126]">Chỉ từ {fromPrice}</p>
        </div>
        <a href="#menu" className="btn-food btn-food-primary px-5 py-2.5 text-sm">
          Xem thực đơn <ArrowRight />
        </a>
      </div>
    </div>
  );
}
