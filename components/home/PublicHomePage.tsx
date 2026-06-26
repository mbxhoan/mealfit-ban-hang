import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe2, Leaf, List, ShoppingBag, Sparkles, Truck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { HomeHeroScene } from '@/components/home/HomeHeroScene';
import { formatVND } from '@/lib/format';
import { getCategories, getMeals, getSettings } from '@/lib/mealfit-repo';
import { menuCategories, minPrice } from '@/lib/menu';
import { INITIAL_MEAL_ITEMS } from '@/src/data/mealPrepData';

interface LinkActionProps {
  href: string;
  children: ReactNode;
  className: string;
}

interface CtaButtonsProps {
  menuHref: string;
  mobile?: boolean;
  primaryHref: string;
}

const FEATURES = [
  { icon: Sparkles, title: 'Nguyên liệu', subtitle: 'tươi sạch', color: '#6eb33b' },
  { icon: Leaf, title: 'Cân đối', subtitle: 'dinh dưỡng', color: '#ef8a2e' },
  { icon: Truck, title: 'Giao hàng', subtitle: 'nhanh chóng', color: '#84a93a' },
  { icon: List, title: 'Đa dạng', subtitle: 'thực đơn', color: '#f07b3f' },
] as const;

const SOCIAL_SWATCHES = [
  'linear-gradient(145deg, #d8b9a1, #8e5f4a)',
  'linear-gradient(145deg, #9b715a, #f1d4bd)',
  'linear-gradient(145deg, #f4dfc6, #b57851)',
  'linear-gradient(145deg, #7a5543, #d7b091)',
] as const;

function LinkAction({ href, children, className }: LinkActionProps) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function CtaButtons({ menuHref, mobile = false, primaryHref }: CtaButtonsProps) {
  return (
    <div
      className={
        mobile
          ? 'mt-7 flex flex-col gap-3 sm:max-w-[22rem] lg:hidden'
          : 'mt-9 hidden flex-col gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center'
      }
    >
      <LinkAction
        href={primaryHref}
        className="inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(100deg,#ff971e,#ef6a1e)] px-7 py-4 text-lg font-extrabold text-white shadow-[0_22px_34px_-18px_rgba(239,106,30,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_42px_-18px_rgba(239,106,30,0.92)]"
      >
        Đặt Hàng Ngay
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/24">
          <ArrowRight className="h-4 w-4" />
        </span>
      </LinkAction>

      <Link
        href={menuHref}
        className="inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#f07b23]/95 bg-white/84 px-7 py-[0.9rem] text-lg font-extrabold text-[#3f382f] shadow-[0_16px_28px_-18px_rgba(80,60,30,0.46)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#ef6a1e] hover:text-[#ef6a1e]"
      >
        Xem thực đơn
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6efe7] text-[#ef6a1e]">
          <List className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}

export async function PublicHomePage() {
  const [live, cats, settings] = await Promise.all([
    getMeals().catch(() => []),
    getCategories().catch(() => []),
    getSettings().catch(() => ({}) as Record<string, string>),
  ]);

  const meals = live.length ? live : INITIAL_MEAL_ITEMS;
  const menuCats = menuCategories(meals, cats);
  const dishCount = meals.filter((meal) => meal.category !== 'Combo').length;
  const comboCount = meals.filter((meal) => meal.category === 'Combo').length;
  const categoryCount = menuCats.length;
  const fromPrice = Math.min(...meals.filter((meal) => meal.category !== 'Combo').map(minPrice));
  const primaryHref = settings.zalo_url || settings.facebook_url || '/about-us#contact';
  const menuHref = '/about-us#menu';
  const menuBadge = categoryCount > 9 ? '9+' : String(categoryCount);

  return (
    <main className="home-hero-page home-hero-noise relative h-dvh min-h-screen overflow-hidden bg-[radial-gradient(circle_at_74%_22%,rgba(255,255,255,0.96),rgba(248,237,218,0.72)_42%,rgba(235,219,196,0.96)_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="home-hero-glow absolute left-[-8%] top-[6%] h-[46%] w-[38%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.96),rgba(255,255,255,0)_72%)]" />
        <div
          className="home-hero-glow absolute right-[-7%] top-[-14%] h-[54%] w-[42%] rounded-full bg-[radial-gradient(circle,rgba(247,150,40,0.27),rgba(247,150,40,0)_70%)] blur-[8px]"
          style={{ animationDuration: '19s' }}
        />
        <div
          className="home-hero-glow absolute bottom-[-24%] right-[15%] h-[58%] w-[44%] rounded-full bg-[radial-gradient(circle,rgba(110,170,60,0.24),rgba(110,170,60,0)_68%)] blur-[14px]"
          style={{ animationDuration: '24s' }}
        />
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(74,48,24,0.2)_1.1px,transparent_1.4px),radial-gradient(circle,rgba(176,58,34,0.18)_1px,transparent_1.4px),radial-gradient(circle,rgba(94,140,52,0.16)_1.1px,transparent_1.5px)] [background-size:46px_46px,78px_78px,120px_120px] [background-position:0_0,22px_30px,60px_14px]" />
      </div>

      <div className="relative z-20 mx-auto flex h-full w-full max-w-[1600px] flex-col overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16">
        <header className="flex shrink-0 items-center justify-between gap-4 py-5 sm:py-6 lg:py-7">
          <Link href="/" className="shrink-0">
            <Image
              src="/home/logo-transparent.png"
              alt="MealFit VN"
              width={210}
              height={72}
              priority
              className="h-auto w-[102px] sm:w-[154px] lg:w-[188px]"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-lg font-semibold text-[#3d372f] md:flex">
            <Link href="/" aria-current="page" className="relative pb-2 text-[#f07b23]">
              Trang chủ
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#f07b23]" />
            </Link>
            <Link href={menuHref} className="transition hover:text-[#f07b23]">
              Thực đơn
            </Link>
            <Link href="/about-us" className="transition hover:text-[#f07b23]">
              Về chúng tôi
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm font-bold text-[#554d43] shadow-[0_12px_28px_-18px_rgba(80,60,30,0.4)] backdrop-blur-md sm:flex">
              <Globe2 className="h-4 w-4 text-[#d0c8bc]" />
              <span aria-hidden="true">🇻🇳</span>
              <span>VI</span>
            </div>
            <Link
              href="/login"
              aria-label="Đăng nhập"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/64 text-[#554d43] shadow-[0_12px_28px_-18px_rgba(80,60,30,0.4)] backdrop-blur-md transition hover:-translate-y-0.5 hover:text-[#2d2a24] sm:h-11 sm:w-11"
            >
              <UserRound className="h-5 w-5" />
            </Link>
            <Link
              href={menuHref}
              aria-label="Xem thực đơn"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/64 text-[#554d43] shadow-[0_12px_28px_-18px_rgba(80,60,30,0.4)] backdrop-blur-md transition hover:-translate-y-0.5 hover:text-[#2d2a24] min-[420px]:flex sm:h-11 sm:w-11"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ef6a1e] px-1 text-[11px] font-extrabold text-white">
                {menuBadge}
              </span>
            </Link>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 items-start gap-6 pb-8 sm:pb-10 lg:grid-cols-[minmax(32rem,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr] lg:items-center lg:gap-x-1 lg:gap-y-4 lg:overflow-hidden lg:pb-7 xl:grid-cols-[minmax(36rem,0.9fr)_minmax(0,1.1fr)]">
          <div className="max-w-[44rem] pt-1 sm:pt-3 lg:pt-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#edf0d4]/92 px-4 py-2 text-sm font-bold tracking-[0.01em] text-[#79a820] shadow-[0_8px_20px_-16px_rgba(80,60,30,0.45)]">
              <Leaf className="h-4 w-4 fill-current stroke-[2.2]" />
              EAT CLEAN - LIVE FIT
            </span>

            <h1 className="mt-6 max-w-[44rem] text-[3rem] font-black leading-[0.94] tracking-normal text-[#2f2a24] sm:text-[3.7rem] lg:text-[3.45rem] xl:text-[4.05rem]">
              <span className="block lg:whitespace-nowrap">Ăn chuẩn - Tập chất</span>
              <span className="mt-2 block">
                Cùng{' '}
                <span className="bg-[linear-gradient(95deg,#6caf2d_0%,#9db21f_34%,#ff8c1e_68%,#ff5a1f_100%)] bg-clip-text text-transparent">
                  MealFit
                </span>
              </span>
            </h1>

            <p className="mt-5 max-w-[34rem] text-balance text-[1.02rem] leading-7 text-[#6d6558] sm:text-[1.1rem]">
              Thực đơn healthy mỗi ngày, được thiết kế riêng cho mục tiêu của bạn. Tươi ngon, tiện lợi,
              đủ chất và giao nhanh theo lịch.
              <span className="font-semibold text-[#413a30]"> Chỉ từ {formatVND(fromPrice)} / phần.</span>
            </p>

            <CtaButtons menuHref={menuHref} mobile primaryHref={primaryHref} />
          </div>

          <div className="min-h-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full">
            <HomeHeroScene videoHref="/about-us#video" />
          </div>

          <div className="max-w-[38rem] lg:row-start-2 lg:self-start">
            <div className="mt-6 grid max-w-[38rem] grid-cols-2 gap-3 sm:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-center gap-2.5 rounded-[1.15rem] bg-white/38 px-3 py-2 backdrop-blur-[2px]">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border bg-white/70"
                      style={{ borderColor: `${feature.color}55`, color: feature.color }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block text-[0.92rem] font-bold text-[#37332d]">{feature.title}</span>
                      <span className="block text-[0.88rem] text-[#8a8276]">{feature.subtitle}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <CtaButtons menuHref={menuHref} primaryHref={primaryHref} />

            <div className="mt-7 flex items-center gap-4">
              <div className="flex items-center -space-x-3">
                {SOCIAL_SWATCHES.map((swatch, index) => (
                  <span
                    key={swatch}
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#f4e7d5] shadow-[0_10px_18px_-12px_rgba(80,60,30,0.45)]"
                    style={{ background: swatch, zIndex: SOCIAL_SWATCHES.length - index }}
                  />
                ))}
              </div>
              <div className="text-sm leading-snug text-[#7f786d] sm:text-base">
                <span className="block font-extrabold text-[#2f2a24]">{dishCount + comboCount}+ món & combo</span>
                <span>gồm {categoryCount} nhóm thực đơn cập nhật mỗi ngày</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
