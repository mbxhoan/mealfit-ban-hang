'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Grid,
  ShoppingBag,
  Tag,
  Users,
  TrendingUp,
  ClipboardList,
  Upload,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import type { SessionUser } from '@/lib/auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ToastProvider } from '@/components/ui/Toast';
import { BackgroundAnimation } from '@/components/ui/BackgroundAnimation';
import { logoutAction } from '@/app/login/actions';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: <Grid className="h-4 w-4" /> },
  { href: '/orders', label: 'Đơn hàng', icon: <ShoppingBag className="h-4 w-4" /> },
  { href: '/products', label: 'Thực đơn & Combo', icon: <Tag className="h-4 w-4" /> },
  { href: '/customers', label: 'Khách hàng', icon: <Users className="h-4 w-4" /> },
  { href: '/reports', label: 'Báo cáo doanh thu', icon: <TrendingUp className="h-4 w-4" /> },
  { href: '/statistics', label: 'Thống kê', icon: <ClipboardList className="h-4 w-4" /> },
  { href: '/import', label: 'Nhập dữ liệu', icon: <Upload className="h-4 w-4" />, adminOnly: true },
];

function NavLinks({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV.filter((n) => !n.adminOnly || role === 'admin').map((n) => {
        const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-bold transition-all ${
              active
                ? 'border-l-4 border-brand-500 bg-slate-900 text-white'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {n.icon}
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-slate-800 text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-700 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm">
          <Image src="/logo.png" alt="MealFit VN" width={40} height={40} className="h-full w-full object-contain" priority />
        </div>
        <div>
          <span className="block text-sm font-bold tracking-tight text-white">MealFit</span>
          <span className="block text-[9px] font-semibold uppercase tracking-wider text-brand-400">
            Sales Management
          </span>
        </div>
      </div>

      <NavLinks role={user.role} onNavigate={onNavigate} />

      <div className="border-t border-slate-700 bg-slate-900/50 p-3">
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-bold uppercase text-slate-200">
            {user.name.slice(0, 2)}
          </div>
          <div className="min-w-0 text-xs">
            <p className="truncate font-semibold text-white">{user.name}</p>
            <p className="text-[10px] capitalize text-brand-400">{user.role === 'admin' ? 'Quản trị' : 'Nhân viên'}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="btn w-full bg-slate-700 text-slate-200 hover:bg-slate-600">
            <LogOut /> Đăng xuất
          </button>
        </form>
      </div>
    </div>
  );
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Bảng điều khiển tổng quan',
  '/orders': 'Quản lý đơn hàng',
  '/products': 'Thực đơn & Bảng giá combo',
  '/customers': 'Hồ sơ khách hàng',
  '/reports': 'Báo cáo doanh thu & lợi nhuận',
  '/statistics': 'Thống kê đi chợ & soạn đơn',
  '/import': 'Nhập dữ liệu từ Excel',
};

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = TITLES[`/${pathname.split('/')[1] ?? ''}`] ?? 'MealFit';

  return (
    <AuthProvider user={user}>
      <ToastProvider>
        <DataProvider>
          <BackgroundAnimation />
          <div className="flex h-screen w-full overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 lg:block">
              <SidebarBody user={user} />
            </aside>

            {/* Mobile sidebar overlay */}
            <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
              <div
                onClick={() => setMobileOpen(false)}
                className={`absolute inset-0 bg-slate-900/50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
              />
              <div
                className={`absolute left-0 top-0 h-full w-64 transition-transform duration-300 ${
                  mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <SidebarBody user={user} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>

            {/* Main column */}
            <div className="flex h-full flex-1 flex-col overflow-hidden">
              <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                    aria-label="Mở menu"
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                  <h1 className="truncate text-slate-800">{title}</h1>
                </div>
                <span className="hidden rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </header>

              <main className="mf-scroll flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mf-fade mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </DataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
