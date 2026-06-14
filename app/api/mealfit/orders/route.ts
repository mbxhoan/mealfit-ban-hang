import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { upsertOrder, deleteOrder } from '@/lib/mealfit-repo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await upsertOrder(await req.json());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteOrder(id);
  return NextResponse.json({ ok: true });
}
