'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Classes for the trigger button (so callers can keep their existing look, e.g. colored pills). */
  className?: string;
  /** Force the search box on/off. Defaults to auto: shown when there are more than 6 options. */
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Accessible combobox with type-to-filter. Drop-in replacement for `<select>`.
 * The dropdown panel uses fixed positioning so it is never clipped by an
 * `overflow` ancestor (tables, modals, scroll areas).
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className,
  searchable,
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
  ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<{ left: number; top: number; bottom: number; width: number } | null>(null);
  const [above, setAbove] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showSearch = searchable ?? options.length > 6;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = norm(query);
    return options.filter((o) => norm(o.label).includes(q));
  }, [options, query]);

  const reposition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.top, bottom: r.bottom, width: r.width });
    setAbove(window.innerHeight - r.bottom < 280 && r.top > window.innerHeight - r.bottom);
  };

  const openPanel = () => {
    if (disabled) return;
    reposition();
    setQuery('');
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    if (showSearch) searchRef.current?.focus();

    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScrollResize = () => reposition();

    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onScrollResize);
    window.addEventListener('scroll', onScrollResize, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onScrollResize);
      window.removeEventListener('scroll', onScrollResize, true);
    };
  }, [open, showSearch]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const panelStyle: React.CSSProperties = rect
    ? above
      ? { position: 'fixed', left: rect.left, bottom: window.innerHeight - rect.top + 4, width: Math.max(rect.width, 200) }
      : { position: 'fixed', left: rect.left, top: rect.bottom + 4, width: Math.max(rect.width, 200) }
    : {};

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={
          className ??
          'flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100'
        }
      >
        <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>

      {open && rect && (
        <div
          ref={panelRef}
          style={panelStyle}
          className="z-[60] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          {showSearch && (
            <div className="relative border-b border-slate-100 p-2">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-slate-700 outline-none focus:border-indigo-500"
              />
            </div>
          )}
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-slate-400">Không tìm thấy</li>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={o.disabled}
                      onClick={() => pick(o.value)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        active ? 'bg-indigo-50 font-bold text-indigo-700' : 'font-medium text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </>
  );
}
