'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, X, Flame, Beef, Wheat, Droplet, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/home/Reveal';
import { MealThumb } from '@/components/home/MealThumb';
import { formatVND } from '@/lib/format';
import {
  WEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_PRESETS,
  nutritionFor,
  type MenuCategory,
  type MenuFlavor,
} from '@/lib/menu';

const flavorWeights = (f: MenuFlavor) => Array.from(new Set(f.options.map((o) => o.weight)));
const representative = (c: MenuCategory) => c.flavors.find((f) => f.imageUrl) ?? c.flavors[0];

/**
 * Public, view-only menu: pick a category to see its flavors and nutrition by weight.
 * Owns the category grid + featured dishes + a detail modal (shared selection state).
 */
export function MenuExplorer({
  categories,
  zaloUrl,
}: {
  categories: MenuCategory[];
  zaloUrl?: string;
}) {
  const [selected, setSelected] = useState<MenuCategory | null>(null);

  return (
    <>
      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHead
          eyebrow="Nhóm món"
          title="Chọn theo nguyên liệu bạn thích"
          sub="Bấm vào nhóm để xem các vị và thông tin dinh dưỡng theo trọng lượng."
        />
        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal as="div" key={c.name} delay={i * 0.04}>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className="food-card group flex h-full w-full items-center gap-3.5 rounded-2xl border border-meal-green/10 bg-meal-surface p-4 text-left shadow-[0_18px_40px_-30px_rgba(71,56,36,0.5)]"
              >
                <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-meal-cream">
                  <MealThumb
                    code={c.name}
                    name={c.name}
                    emoji={c.emoji}
                    serverImageUrl={c.imageUrl}
                    imgClass="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                    emojiClass="flex h-full w-full items-center justify-center text-3xl transition duration-300 group-hover:scale-110"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-semibold text-meal-green-dark">{c.name}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-meal-muted">
                    {c.count} vị · từ {formatVND(c.from)}
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured (one representative dish per category) */}
      <section id="menu" className="scroll-mt-20 bg-meal-cream/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Thực đơn nổi bật"
            title="Món tươi, sẵn sàng để thưởng thức"
            sub="Bấm để xem đầy đủ các vị và dinh dưỡng theo từng mức trọng lượng."
          />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c, i) => {
              const rep = representative(c);
              if (!rep) return null;
              return (
                <Reveal as="div" key={c.name} delay={(i % 5) * 0.05}>
                  <button
                    type="button"
                    onClick={() => setSelected(c)}
                    className="food-card group flex h-full w-full flex-col rounded-3xl border border-meal-green/10 bg-meal-surface p-4 text-center shadow-[0_18px_44px_-30px_rgba(71,56,36,0.5)]"
                  >
                    <span className="mx-auto block h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-meal-cream to-white shadow-inner">
                      <MealThumb
                        code={rep.code}
                        name={rep.name}
                        emoji={c.emoji}
                        serverImageUrl={rep.imageUrl}
                        categoryImageUrl={c.imageUrl}
                        imgClass="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        emojiClass="flex h-full w-full items-center justify-center text-5xl transition duration-300 group-hover:scale-110"
                      />
                    </span>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-meal-green">{c.name}</p>
                    <h3 className="mt-0.5 line-clamp-1 text-sm">{c.count} vị</h3>
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {flavorWeights(rep).map((w) => (
                        <span key={w} className="rounded-full bg-meal-green/8 px-2 py-0.5 text-[10px] font-bold text-meal-green-dark">
                          {w}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-3">
                      <p className="text-[11px] text-meal-muted">Chỉ từ</p>
                      <p className="font-display text-lg font-semibold text-meal-tomato">{formatVND(c.from)}</p>
                      <span className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full bg-meal-green/10 py-2 text-xs font-bold text-meal-green-dark transition group-hover:bg-meal-green group-hover:text-white">
                        Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {selected && <CategoryModal category={selected} zaloUrl={zaloUrl} onClose={() => setSelected(null)} />}
    </>
  );
}

/* ---------------------------------------------------------------- Modal */
function CategoryModal({ category, zaloUrl, onClose }: { category: MenuCategory; zaloUrl?: string; onClose: () => void }) {
  const [grams, setGrams] = useState(150);
  const nutri = category.nutrition;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const clamp = (n: number) => Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, Math.round(n) || WEIGHT_MIN));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-meal-green-dark/40 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-meal-bg p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        {/* Header */}
        <div className="flex items-start gap-4">
          <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-meal-cream">
            <MealThumb
              code={category.name}
              name={category.name}
              emoji={category.emoji}
              serverImageUrl={category.imageUrl}
              imgClass="h-full w-full object-cover"
              emojiClass="flex h-full w-full items-center justify-center text-4xl"
            />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl text-meal-green-dark">{category.name}</h3>
            <p className="mt-0.5 text-sm text-meal-muted">{category.count} vị · chỉ từ {formatVND(category.from)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-meal-surface p-2 text-meal-muted shadow-sm transition hover:text-meal-tomato" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nutrition by weight */}
        {nutri && (
          <div className="mt-6 rounded-2xl border border-meal-green/12 bg-meal-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-meal-orange">Dinh dưỡng theo trọng lượng</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {WEIGHT_PRESETS.map((w) => (
                <NutriCol key={w} label={`${w}g`} n={nutritionFor(w, nutri)} />
              ))}
              <div className="rounded-xl border border-dashed border-meal-green/30 bg-meal-cream/40 p-2.5 text-center">
                <input
                  type="number"
                  value={grams}
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  onChange={(e) => setGrams(Number(e.target.value))}
                  onBlur={(e) => setGrams(clamp(Number(e.target.value)))}
                  aria-label="Trọng lượng tùy chọn (gram)"
                  className="w-full rounded-md border border-meal-green/20 bg-white px-1 py-1 text-center text-sm font-bold text-meal-green-dark outline-none focus:border-meal-green"
                />
                <span className="mt-1 block text-[10px] font-semibold text-meal-muted">gram tùy chọn</span>
              </div>
            </div>
            <NutriRow n={nutritionFor(clamp(grams), nutri)} />
            <p className="mt-2 text-[10px] text-meal-muted">
              Số tùy chọn từ {WEIGHT_MIN}–{WEIGHT_MAX}g. Macro ước tính/100g, tỉ lệ theo gram.
            </p>
          </div>
        )}

        {/* Flavors */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-meal-green">Các vị</p>
          <div className="mt-3 space-y-2.5">
            {category.flavors.map((f) => (
              <div key={f.id} className="flex flex-col gap-2 rounded-2xl border border-meal-green/10 bg-meal-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-display text-base font-semibold text-meal-green-dark">{f.name}</span>
                <div className="flex flex-wrap gap-1.5">
                  {f.options.map((o) => (
                    <span key={o.weight} className="rounded-full bg-meal-green/8 px-2.5 py-1 text-[11px] font-bold text-meal-green-dark">
                      {o.weight} · {formatVND(o.price)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {zaloUrl && (
          <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="btn-food btn-food-primary mt-6 w-full justify-center">
            <MessageCircle className="h-4 w-4" /> Liên hệ đặt món qua Zalo
          </a>
        )}
      </div>
    </div>
  );
}

function NutriCol({ label, n }: { label: string; n: ReturnType<typeof nutritionFor> }) {
  return (
    <div className="rounded-xl border border-meal-green/12 bg-meal-cream/40 p-2.5 text-center">
      <span className="block text-sm font-bold text-meal-green-dark">{label}</span>
      <span className="mt-1 block text-[11px] font-bold text-meal-tomato">{n.kcal} kcal</span>
      <span className="mt-0.5 block text-[10px] text-meal-muted">{n.protein}g đạm</span>
    </div>
  );
}

function NutriRow({ n }: { n: ReturnType<typeof nutritionFor> }) {
  const items = [
    { icon: <Flame className="h-4 w-4" />, label: 'Calo', val: `${n.kcal} kcal`, color: 'text-meal-tomato' },
    { icon: <Beef className="h-4 w-4" />, label: 'Đạm', val: `${n.protein} g`, color: 'text-meal-green-dark' },
    { icon: <Wheat className="h-4 w-4" />, label: 'Carb', val: `${n.carb} g`, color: 'text-meal-orange' },
    { icon: <Droplet className="h-4 w-4" />, label: 'Béo', val: `${n.fat} g`, color: 'text-meal-green' },
  ];
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 rounded-xl bg-meal-cream/50 px-3 py-2">
          <span className={it.color}>{it.icon}</span>
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold text-meal-muted">{it.label}</span>
            <span className={`block text-sm font-bold ${it.color}`}>{it.val}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal as="div" className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-meal-orange">{eyebrow}</span>
      <h2 className="mt-2.5 text-balance">{title}</h2>
      {sub && <p className="mt-3 text-pretty text-base text-meal-muted">{sub}</p>}
    </Reveal>
  );
}
