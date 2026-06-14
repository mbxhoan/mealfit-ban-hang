'use client';

import { Suspense, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HeartPulse, LogIn, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { loginAction, type LoginState } from './actions';
import { BackgroundAnimation } from '@/components/ui/BackgroundAnimation';
import { Spinner } from '@/components/ui/Spinner';
import { inputClass } from '@/components/ui/Field';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn w-full bg-brand-600 py-2.5 text-white hover:bg-brand-700">
      {pending ? <Spinner /> : <LogIn />}
      {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
    </button>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <main className="relative min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand banner — desktop only */}
      <div className="relative hidden lg:block">
        <Image src="/banner.png" alt="MealFit — Healthy Meal Prep" fill priority className="object-cover" sizes="50vw" />
      </div>

      {/* Form side */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <BackgroundAnimation />

      <div className="mf-fade-up w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-slate-800">Đăng nhập MealFit</h1>
            <p className="mt-1 text-xs text-slate-400">Hệ thống quản lý bán hàng</p>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <label className="block space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Tài khoản / Email</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="identifier" autoComplete="username" placeholder="admin" className={`${inputClass} pl-9`} />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Mật khẩu</span>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputClass} pl-9`}
              />
            </div>
          </label>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{state.error}</p>
          )}

          <SubmitButton />
        </form>

        <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
          <p className="font-bold text-slate-600">Tài khoản demo</p>
          <p>Admin: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span></p>
          <p>Nhân viên: <span className="font-mono">nhanvien</span> / <span className="font-mono">staff123</span></p>
        </div>

        <Link href="/" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-3.5 w-3.5" /> Về trang giới thiệu
        </Link>
      </div>
      </div>
    </main>
  );
}
