import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { upsertCategory } from '@/lib/mealfit-repo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await upsertCategory(await req.json());
  return NextResponse.json({ ok: true });
}
