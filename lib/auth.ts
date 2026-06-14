import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from './supabase/server';

export type Role = 'admin' | 'staff';

export interface SessionUser {
  code: string;
  name: string;
  email: string;
  role: Role;
}

const COOKIE = 'mealfit_session';

// Offline fallback accounts (mirrors the rows seeded by the migration). Plain text is acceptable
// only for this bootstrap login; production should hash passwords and authenticate via Supabase.
const SEED_CREDENTIALS: Array<SessionUser & { password: string }> = [
  { code: 'admin', name: 'Quản trị viên', email: 'admin@example.com', role: 'admin', password: 'admin123' },
  { code: 'nhanvien', name: 'Nhân viên bán hàng', email: 'staff@example.com', role: 'staff', password: 'staff123' },
];

/** Validate credentials against Supabase mealfit_employees, falling back to the seed list. */
export async function authenticate(identifier: string, password: string): Promise<SessionUser | null> {
  const id = identifier.trim().toLowerCase();

  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from('mealfit_employees')
      .select('code, name, email, role, encrypted_password')
      .or(`email.eq.${id},code.eq.${id}`)
      .limit(1)
      .maybeSingle();
    if (data && data.encrypted_password === password) {
      return { code: data.code, name: data.name, email: data.email, role: data.role as Role };
    }
  }

  const match = SEED_CREDENTIALS.find(
    (c) => (c.email.toLowerCase() === id || c.code.toLowerCase() === id) && c.password === password,
  );
  if (match) {
    const { password: _pw, ...user } = match;
    return user;
  }
  return null;
}

export async function createSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, Buffer.from(JSON.stringify(user)).toString('base64'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as SessionUser;
  } catch {
    return null;
  }
}
