import Link from 'next/link';
import { HeartPulse, LogIn, ArrowRight, Leaf, Truck, Soup, ShieldCheck } from 'lucide-react';
import { BackgroundAnimation } from '@/components/ui/BackgroundAnimation';
import { CATEGORY_EMOJI, COMBOS, categories, featuredDishes, minPrice } from '@/lib/menu';
import { formatVND } from '@/lib/format';

export default function LandingPage() {
  const dishes = featuredDishes();
  const combos = COMBOS.slice(0, 4);
  const cats = categories();

  return (
    <main className="relative min-h-screen text-slate-800">
      <BackgroundAnimation />

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-base font-extrabold tracking-tight">MealFit</span>
          </div>
          <Link href="/login" className="btn bg-brand-600 text-white hover:bg-brand-700">
            <LogIn /> Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <div className="mf-fade-up mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            <Leaf className="h-3.5 w-3.5" /> Eat clean · Healthy meal prep
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Ăn sạch, sống khỏe,
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent"> mỗi ngày.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500 sm:text-base">
            Thực đơn ức gà, thăn bò, cá hồi, tôm… cùng các combo dinh dưỡng theo mục tiêu giữ dáng, giảm cân, tăng cơ —
            chế biến tươi mỗi ngày và giao tận nơi.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn bg-brand-600 px-5 py-2.5 text-white hover:bg-brand-700">
              Vào hệ thống <ArrowRight />
            </Link>
            <a href="#menu" className="btn bg-white px-5 py-2.5 text-slate-700 shadow-sm hover:bg-slate-50">
              Xem thực đơn
            </a>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: <Soup className="h-5 w-5" />, label: `${cats.length} nhóm món` },
            { icon: <Leaf className="h-5 w-5" />, label: 'Nguyên liệu tươi' },
            { icon: <Truck className="h-5 w-5" />, label: 'Giao tận nơi' },
            { icon: <ShieldCheck className="h-5 w-5" />, label: 'Định lượng chuẩn' },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs font-bold text-slate-600"
            >
              <span className="text-brand-600">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </section>

      {/* Menu showcase */}
      <section id="menu" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Thực đơn nổi bật</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Mỗi món có nhiều mức trọng lượng 100g · 150g · 200g.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {dishes.map((m) => (
            <div
              key={m.id}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-4xl transition group-hover:scale-110">
                {CATEGORY_EMOJI[m.category] ?? '🍽️'}
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-brand-600">{m.category}</p>
              <p className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-800">{m.name}</p>
              <p className="mt-1 text-xs text-slate-400">Chỉ từ</p>
              <p className="text-sm font-extrabold text-slate-700">{formatVND(minPrice(m))}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Combos */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Combo theo mục tiêu</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {combos.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-5 shadow-sm"
            >
              <div className="text-3xl">🥗</div>
              <p className="mt-3 text-base font-extrabold text-slate-800">{c.name}</p>
              <p className="mt-1 text-xs text-slate-500">Khẩu phần cân đối, đủ chất theo nhu cầu luyện tập.</p>
              <p className="mt-4 text-lg font-extrabold text-brand-700">{formatVND(minPrice(c))}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-12 text-center text-white shadow-lg sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Sẵn sàng quản lý cửa hàng MealFit?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/85">
            Đăng nhập để quản lý thực đơn, lên đơn, ra bill và theo dõi doanh thu theo thời gian thực.
          </p>
          <Link
            href="/login"
            className="btn mx-auto mt-6 bg-white px-6 py-2.5 text-brand-700 hover:bg-brand-50"
          >
            <LogIn /> Đăng nhập hệ thống
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} MealFit · Hệ thống quản lý bán hàng thực đơn dinh dưỡng
      </footer>
    </main>
  );
}
