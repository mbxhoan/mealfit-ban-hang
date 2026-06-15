import Link from 'next/link';
import Image from 'next/image';
import {
  Leaf,
  Truck,
  ChefHat,
  Clock,
  Salad,
  Target,
  Sparkles,
  ArrowRight,
  Check,
  LogIn,
  Scale,
  Calendar,
  Utensils,
} from 'lucide-react';
import { Reveal } from '@/components/home/Reveal';
import { WordReveal } from '@/components/home/WordReveal';
import { MobileStickyCTA } from '@/components/home/MobileStickyCTA';
import { AmbientBackground } from '@/components/home/AmbientBackground';
import { HeroVisual } from '@/components/home/HeroVisual';
import { MealThumb } from '@/components/home/MealThumb';
import {
  CATEGORY_EMOJI,
  categoryCards,
  curatedCombos,
  featuredDishes,
  weightOptions,
  minPrice,
} from '@/lib/menu';
import { getMeals } from '@/lib/mealfit-repo';
import { INITIAL_MEAL_ITEMS } from '@/src/data/mealPrepData';
import { formatVND } from '@/lib/format';

// Refresh periodically so newly-added admin photos appear without a redeploy.
export const revalidate = 60;

export default async function LandingPage() {
  // Live meals (with photos) when Supabase is configured; otherwise the seed menu.
  const live = await getMeals().catch(() => []);
  const meals = live.length ? live : INITIAL_MEAL_ITEMS;

  const cats = categoryCards(meals);
  const dishes = featuredDishes(meals);
  const combos = curatedCombos(meals);
  const globalMin = Math.min(...meals.filter((m) => m.category !== 'Combo').map(minPrice));

  return (
    <main className="meal-home meal-grain relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-[1]">
        <SiteNav />
        <Hero globalMin={globalMin} catCount={cats.length} />
        <CategorySection cats={cats} />
        <FeaturedSection dishes={dishes} />
        <ComboSection combos={combos} />
        <WhyChooseSection />
        <HowItWorksSection />
        <SuitableForSection />
        <FaqSection />
        <FinalCtaSection globalMin={globalMin} />
        <SiteFooter />
      </div>
      <MobileStickyCTA fromPrice={formatVND(globalMin)} />
    </main>
  );
}

/* ----------------------------------------------------------------- Nav */
function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-meal-green/10 bg-meal-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_-10px_rgba(47,95,52,0.5)] ring-1 ring-meal-green/12">
            <Image src="/logo.png" alt="MealFit VN" width={44} height={44} className="h-10 w-10 object-contain" priority />
          </span>
          <span className="font-display text-xl font-semibold text-meal-green-dark">
            MealFit<span className="text-meal-orange">VN</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-meal-text/80 md:flex">
          <a href="#menu" className="nav-link transition-colors hover:text-meal-green">Thực đơn</a>
          <a href="#combo" className="nav-link transition-colors hover:text-meal-green">Combo</a>
          <a href="#how" className="nav-link transition-colors hover:text-meal-green">Cách đặt</a>
          <a href="#faq" className="nav-link transition-colors hover:text-meal-green">Hỏi đáp</a>
        </nav>
        <Link href="/login" className="btn-food btn-food-ghost px-4 py-2 text-sm">
          <LogIn /> Đăng nhập
        </Link>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- Hero */
function Hero({ globalMin, catCount }: { globalMin: number; catCount: number }) {
  const trust = [
    { icon: <Leaf className="h-4 w-4" />, label: 'Nguyên liệu tươi' },
    { icon: <ChefHat className="h-4 w-4" />, label: 'Chế biến trong ngày' },
    { icon: <Scale className="h-4 w-4" />, label: 'Định lượng chuẩn' },
    { icon: <Truck className="h-4 w-4" />, label: 'Giao tận nơi' },
  ];
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-16">
      <div className="text-center lg:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-meal-green/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-meal-green-dark">
          <Sparkles className="h-3.5 w-3.5" /> Fresh daily mealprep
        </span>
        <h1 className="mt-5 font-display !text-[clamp(2.5rem,5.2vw,4rem)] !leading-[1.04]">
          <WordReveal text="Ăn sạch, nhanh," className="block" />
          <WordReveal text="ngon mỗi ngày." className="mt-1 block italic text-meal-orange" delay={0.28} />
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-meal-muted lg:mx-0 lg:text-lg">
          Thực đơn ức gà, thăn bò, cá hồi, tôm… cùng các combo theo mục tiêu giữ dáng, giảm cân, tăng cơ —
          chế biến tươi mỗi ngày, định lượng rõ ràng, giao tận nơi.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <a href="#menu" className="btn-food btn-food-primary">
            Xem thực đơn <ArrowRight />
          </a>
          <a href="#combo" className="btn-food btn-food-ghost">
            Chọn combo
          </a>
        </div>
        <p className="mt-4 text-sm font-semibold text-meal-muted">
          <span className="text-meal-tomato">{catCount} nhóm món</span> · chỉ từ{' '}
          <span className="text-meal-green-dark">{formatVND(globalMin)}</span> / phần
        </p>

        <ul className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4 lg:mx-0">
          {trust.map((t) => (
            <li
              key={t.label}
              className="flex items-center gap-2 rounded-2xl border border-meal-green/10 bg-meal-surface/70 px-3 py-2.5 text-xs font-bold text-meal-text/80"
            >
              <span className="text-meal-green">{t.icon}</span>
              {t.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Remotion hero */}
      <HeroVisual />
    </section>
  );
}

/* --------------------------------------------------------- Categories */
function CategorySection({ cats }: { cats: ReturnType<typeof categoryCards> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHead
        eyebrow="Nhóm món"
        title="Chọn theo nguyên liệu bạn thích"
        sub="Mỗi nhóm có nhiều món và mức trọng lượng khác nhau — dễ phối theo khẩu vị và mục tiêu."
      />
      <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c, i) => (
          <Reveal as="div" key={c.name} delay={i * 0.04}>
            <a
              href="#menu"
              className="food-card group flex h-full items-center gap-3.5 rounded-2xl border border-meal-green/10 bg-meal-surface p-4 shadow-[0_18px_40px_-30px_rgba(71,56,36,0.5)]"
            >
              <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-meal-cream">
                <MealThumb
                  code={c.code}
                  name={c.name}
                  emoji={c.emoji}
                  serverImageUrl={c.imageUrl}
                  imgClass="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  emojiClass="flex h-full w-full items-center justify-center text-3xl transition duration-300 group-hover:scale-110"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-base font-semibold text-meal-green-dark">
                  {c.name}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-meal-muted">
                  {c.count} món · từ {formatVND(c.from)}
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Featured */
function FeaturedSection({ dishes }: { dishes: ReturnType<typeof featuredDishes> }) {
  return (
    <section id="menu" className="scroll-mt-20 bg-meal-cream/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Thực đơn nổi bật"
          title="Món tươi, sẵn sàng để thưởng thức"
          sub="Giá thực tế theo từng mức trọng lượng. Chọn phần vừa bụng, không lãng phí."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {dishes.map((m, i) => (
            <Reveal as="div" key={m.id} delay={(i % 5) * 0.05}>
              <article className="food-card group flex h-full flex-col rounded-3xl border border-meal-green/10 bg-meal-surface p-4 text-center shadow-[0_18px_44px_-30px_rgba(71,56,36,0.5)]">
                <span className="mx-auto block h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-meal-cream to-white shadow-inner">
                  <MealThumb
                    code={m.code}
                    name={m.name}
                    emoji={CATEGORY_EMOJI[m.category] ?? '🍽️'}
                    serverImageUrl={m.imageUrl}
                    imgClass="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                    emojiClass="flex h-full w-full items-center justify-center text-5xl transition duration-300 group-hover:scale-110"
                  />
                </span>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-meal-green">
                  {m.category}
                </p>
                <h3 className="mt-0.5 line-clamp-1 text-sm">{m.name}</h3>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {weightOptions(m).map((w) => (
                    <span
                      key={w}
                      className="rounded-full bg-meal-green/8 px-2 py-0.5 text-[10px] font-bold text-meal-green-dark"
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-3">
                  <p className="text-[11px] text-meal-muted">Chỉ từ</p>
                  <p className="font-display text-lg font-semibold text-meal-tomato">{formatVND(minPrice(m))}</p>
                  <a
                    href="#order"
                    className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full bg-meal-green/10 py-2 text-xs font-bold text-meal-green-dark transition group-hover:bg-meal-green group-hover:text-white"
                  >
                    Đặt món <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Combo */
function ComboSection({ combos }: { combos: ReturnType<typeof curatedCombos> }) {
  return (
    <section id="combo" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Combo theo mục tiêu"
          title="Ăn theo mục tiêu, khỏi phải nghĩ"
          sub="Combo cân đối sẵn cho từng nhu cầu — chọn đúng mục tiêu là xong."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {combos.map((c, i) => (
            <Reveal as="div" key={c.id} delay={i * 0.06}>
              <article className="food-card flex h-full flex-col rounded-3xl border border-meal-green/12 bg-gradient-to-b from-meal-surface to-meal-cream/50 p-6 shadow-[0_22px_50px_-32px_rgba(71,56,36,0.5)]">
                <span className="block h-12 w-12 overflow-hidden rounded-2xl bg-meal-green/10">
                  <MealThumb
                    code={c.code}
                    name={c.name}
                    emoji="🥗"
                    serverImageUrl={c.imageUrl}
                    imgClass="h-full w-full object-cover"
                    emojiClass="flex h-full w-full items-center justify-center text-2xl"
                  />
                </span>
                <span className="mt-4 inline-flex w-fit rounded-full bg-meal-orange/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-meal-orange">
                  {c.audience}
                </span>
                <h3 className="mt-3 font-display text-xl">{c.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-meal-muted">{c.goal}</p>
                <div className="mt-5 flex items-end justify-between border-t border-meal-green/10 pt-4">
                  <span>
                    <span className="block text-[11px] text-meal-muted">Chỉ từ</span>
                    <span className="font-display text-lg font-semibold text-meal-green-dark">{formatVND(c.from)}</span>
                  </span>
                  <a href="#order" className="btn-food btn-food-ghost px-4 py-2 text-xs">
                    Chọn combo
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Why choose */
function WhyChooseSection() {
  const items = [
    { icon: <Leaf className="h-5 w-5" />, title: 'Nguyên liệu tươi', desc: 'Chọn lựa mỗi ngày, ưu tiên độ tươi và an toàn.' },
    { icon: <ChefHat className="h-5 w-5" />, title: 'Chế biến trong ngày', desc: 'Nấu mới, không để qua đêm, giữ trọn vị ngon.' },
    { icon: <Scale className="h-5 w-5" />, title: 'Định lượng rõ ràng', desc: 'Mỗi món có mức 100g · 150g · 200g để bạn dễ chọn.' },
    { icon: <Clock className="h-5 w-5" />, title: 'Tiết kiệm thời gian', desc: 'Nhận là ăn, hợp với người bận rộn, ít thời gian nấu.' },
    { icon: <Target className="h-5 w-5" />, title: 'Theo mục tiêu', desc: 'Combo giữ dáng, giảm cân, tăng cơ — chọn đúng nhu cầu.' },
    { icon: <Truck className="h-5 w-5" />, title: 'Giao tận nơi', desc: 'Đóng gói sạch sẽ, giao đến tận tay đúng lịch.' },
  ];
  return (
    <section className="bg-meal-green-dark py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Vì sao chọn MealFit"
          title="Tươi, sạch, đủ chất — và tiện"
          sub="Những điều giúp bữa ăn của bạn gọn gàng hơn mỗi ngày."
          light
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal as="div" key={it.title} delay={(i % 3) * 0.06}>
              <div className="flex h-full gap-4 rounded-3xl bg-white/8 p-5 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/12">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-meal-yellow/90 text-meal-green-dark">
                  {it.icon}
                </span>
                <div>
                  <h3 className="!text-white">{it.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{it.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- How it works */
function HowItWorksSection() {
  const steps = [
    { icon: <Utensils className="h-5 w-5" />, title: 'Chọn món hoặc combo', desc: 'Lướt thực đơn, chọn món lẻ hoặc combo theo mục tiêu.' },
    { icon: <Scale className="h-5 w-5" />, title: 'Chọn khẩu phần', desc: 'Pick mức 100g · 150g · 200g cho vừa nhu cầu.' },
    { icon: <Calendar className="h-5 w-5" />, title: 'Đặt & xác nhận', desc: 'Chốt đơn và lịch giao phù hợp với bạn.' },
    { icon: <Salad className="h-5 w-5" />, title: 'Nhận & thưởng thức', desc: 'Nhận mealprep tươi, ăn ngon, theo dõi mục tiêu.' },
  ];
  return (
    <section id="how" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead eyebrow="Cách đặt món" title="Bốn bước, gọn trong vài phút" />
        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-meal-green/25 to-transparent lg:block" />
          {steps.map((s, i) => (
            <Reveal as="div" key={s.title} delay={i * 0.08}>
              <div className="food-card relative flex h-full flex-col items-center rounded-3xl border border-meal-green/10 bg-meal-surface p-6 text-center shadow-[0_18px_44px_-32px_rgba(71,56,36,0.5)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-meal-green text-white shadow-[0_12px_26px_-12px_rgba(47,95,52,0.7)]">
                  {s.icon}
                </span>
                <span className="mt-3 font-display text-sm font-bold text-meal-orange">Bước {i + 1}</span>
                <h3 className="mt-1">{s.title}</h3>
                <p className="mt-1.5 text-sm text-meal-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Suitable for */
function SuitableForSection() {
  const who = [
    { emoji: '💼', label: 'Dân văn phòng bận rộn' },
    { emoji: '🏋️', label: 'Người tập gym' },
    { emoji: '🥗', label: 'Người muốn ăn sạch' },
    { emoji: '⚖️', label: 'Người kiểm soát khẩu phần' },
    { emoji: '⏱️', label: 'Người không có thời gian nấu' },
    { emoji: '🎯', label: 'Người ăn theo mục tiêu' },
  ];
  return (
    <section className="bg-meal-cream/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead eyebrow="Phù hợp với" title="MealFit hợp với ai?" sub="Nếu bạn thuộc một trong những nhóm này, mealprep sẽ giúp bạn nhẹ đầu hơn mỗi bữa." />
        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {who.map((w, i) => (
            <Reveal as="div" key={w.label} delay={(i % 3) * 0.05}>
              <div className="food-card flex items-center gap-3 rounded-2xl border border-meal-green/10 bg-meal-surface px-4 py-4 shadow-[0_16px_40px_-32px_rgba(71,56,36,0.5)]">
                <span className="text-3xl">{w.emoji}</span>
                <span className="text-sm font-bold text-meal-text">{w.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- FAQ */
function FaqSection() {
  const faqs = [
    { q: 'Món bảo quản được bao lâu?', a: 'Mealprep ngon nhất khi dùng trong ngày. Nếu cần để lại, hãy bảo quản lạnh và hâm nóng trước khi ăn.' },
    { q: 'Có chọn khẩu phần không?', a: 'Có. Hầu hết món có các mức 100g · 150g · 200g để bạn chọn theo nhu cầu.' },
    { q: 'Có món theo mục tiêu không?', a: 'Có combo giữ dáng, giảm cân, tăng cơ và Power Fit — chọn theo mục tiêu ăn uống của bạn.' },
    { q: 'Có giao tận nơi không?', a: 'Có. Đơn được đóng gói sạch sẽ và giao theo lịch hẹn của bạn.' },
    { q: 'Đặt món như thế nào?', a: 'Liên hệ đặt món theo thông tin ở cuối trang, hoặc nhân viên đặt giúp qua hệ thống MealFit.' },
    { q: 'Có cần hâm lại không?', a: 'Tùy món. Các món dùng nóng sẽ ngon hơn khi hâm lại nhẹ trước khi ăn.' },
  ];
  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead eyebrow="Hỏi đáp" title="Câu hỏi thường gặp" />
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-meal-green/12 bg-meal-surface px-5 py-4 shadow-[0_14px_36px_-30px_rgba(71,56,36,0.5)] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-meal-green-dark">
                {f.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-meal-green/10 text-meal-green transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-meal-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Final CTA */
function FinalCtaSection({ globalMin }: { globalMin: number }) {
  const bullets = ['Tươi mỗi ngày', 'Định lượng rõ ràng', 'Giao tận nơi'];
  return (
    <section id="order" className="scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-meal-green to-meal-green-dark px-6 py-14 text-center text-white shadow-[0_50px_100px_-40px_rgba(47,95,52,0.7)] sm:px-12">
        <span className="pointer-events-none absolute -left-10 -top-10 text-8xl opacity-20 meal-float" style={{ ['--dur' as string]: '8s' }}>🥑</span>
        <span className="pointer-events-none absolute -bottom-8 -right-6 text-8xl opacity-20 meal-float" style={{ ['--dur' as string]: '9s' }}>🍅</span>
        <h2 className="font-display !text-white">Sẵn sàng ăn ngon và gọn hơn mỗi ngày?</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/85">
          Chọn món lẻ hoặc combo theo mục tiêu — chỉ từ {formatVND(globalMin)} mỗi phần. Bắt đầu với bữa đầu tiên hôm nay.
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-white/90">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-meal-yellow" /> {b}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#menu" className="btn-food bg-white text-meal-green-dark hover:bg-meal-cream">
            Xem thực đơn hôm nay <ArrowRight />
          </a>
          <Link href="/login" className="btn-food border border-white/40 bg-transparent text-white hover:bg-white/10">
            <LogIn /> Đăng nhập hệ thống
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Footer */
function SiteFooter() {
  return (
    <footer className="border-t border-meal-green/10 bg-meal-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-meal-green/12">
            <Image src="/logo.png" alt="MealFit VN" width={36} height={36} className="h-8 w-8 object-contain" />
          </span>
          <span className="font-display text-base font-semibold text-meal-green-dark">
            MealFit<span className="text-meal-orange">VN</span>
          </span>
        </div>
        <p className="text-xs font-semibold text-meal-muted">
          © {new Date().getFullYear()} MealFit · Thực đơn eat-clean & combo dinh dưỡng tươi mỗi ngày
        </p>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------- Helpers */
function SectionHead({
  eyebrow,
  title,
  sub,
  light = false,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  light?: boolean;
}) {
  return (
    <Reveal as="div" className="mx-auto max-w-2xl text-center">
      <span
        className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-meal-yellow' : 'text-meal-orange'}`}
      >
        {eyebrow}
      </span>
      <h2 className={`mt-2.5 text-balance ${light ? '!text-white' : ''}`}>{title}</h2>
      {sub && <p className={`mt-3 text-pretty text-base ${light ? 'text-white/75' : 'text-meal-muted'}`}>{sub}</p>}
    </Reveal>
  );
}
