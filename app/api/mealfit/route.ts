import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { hasAdmin } from '@/lib/supabase/admin';
import { getBootstrap } from '@/lib/mealfit-repo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!hasAdmin) {
    return NextResponse.json({ configured: false, meals: [], customers: [], orders: [] });
  }
  const data = await getBootstrap();
  return NextResponse.json({ configured: true, ...data });
}
