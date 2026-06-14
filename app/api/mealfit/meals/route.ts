import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { upsertMeal, deleteMeal } from '@/lib/mealfit-repo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await upsertMeal(await req.json());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await deleteMeal(await req.json());
  return NextResponse.json({ ok: true });
}
