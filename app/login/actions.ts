'use server';

import { redirect } from 'next/navigation';
import { authenticate, createSession } from '@/lib/auth';

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get('identifier') || '');
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/dashboard');

  if (!identifier || !password) {
    return { error: 'Vui lòng nhập tài khoản và mật khẩu.' };
  }

  const user = await authenticate(identifier, password);
  if (!user) {
    return { error: 'Tài khoản hoặc mật khẩu không đúng.' };
  }

  await createSession(user);
  redirect(next.startsWith('/') ? next : '/dashboard');
}

export async function logoutAction(): Promise<void> {
  const { destroySession } = await import('@/lib/auth');
  await destroySession();
  redirect('/login');
}
