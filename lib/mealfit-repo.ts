import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { MealItem, Customer, Order, OrderDetail, PricingOption } from '@/src/data/mealPrepData';

const w = (s: string) => parseInt(s, 10) || 0;
const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ---------- READ ----------

export async function getMeals(): Promise<MealItem[]> {
  const db = createAdminClient();
  if (!db) return [];
  const [{ data: products }, { data: combos }] = await Promise.all([
    db.from('mealfit_products').select('*').order('name'),
    db.from('mealfit_combos').select('*').order('name'),
  ]);

  // Group product rows into MealItem (one item per code-prefix / name).
  const byKey = new Map<string, MealItem>();
  for (const r of products ?? []) {
    const base = String(r.code).split('__')[0];
    const opt: PricingOption = {
      weight: `${r.weight}g`,
      price: Number(r.sell_price),
      cost: Number(r.cost_price),
      profit: Number(r.profit),
      margin: Number(r.profit_margin),
    };
    const existing = byKey.get(base);
    if (existing) existing.options.push(opt);
    else byKey.set(base, { id: base, name: r.name, code: base, category: r.category ?? '', options: [opt] });
  }
  for (const item of byKey.values()) item.options.sort((a, b) => w(a.weight) - w(b.weight));

  const comboItems: MealItem[] = (combos ?? []).map((c) => ({
    id: c.code,
    name: c.name,
    code: c.code,
    category: 'Combo',
    options: [
      {
        weight: 'Combo',
        price: Number(c.sell_price),
        cost: Number(c.cost_price),
        profit: Number(c.profit),
        margin: Number(c.profit_margin),
      },
    ],
  }));

  return [...byKey.values(), ...comboItems];
}

export async function getCustomers(): Promise<Customer[]> {
  const db = createAdminClient();
  if (!db) return [];
  const { data } = await db.from('mealfit_customers').select('*').order('name');
  return (data ?? []).map((c) => ({
    id: c.code,
    name: c.name,
    phone: c.phone ?? '',
    address: c.address ?? '',
    email: '',
    totalOrders: 0,
    totalSpent: 0,
    notes: c.notes ?? '',
    createdAt: (c.created_at ?? '').slice(0, 10),
  }));
}

export async function getOrders(): Promise<Order[]> {
  const db = createAdminClient();
  if (!db) return [];
  const { data } = await db
    .from('mealfit_orders')
    .select(
      '*, customer:mealfit_customers(code,name,phone,address), items:mealfit_order_items(*, product:mealfit_products(name,code), combo:mealfit_combos(name,code))',
    )
    .order('order_date', { ascending: false });

  return (data ?? []).map((o: any): Order => {
    const items: OrderDetail[] = (o.items ?? []).map((it: any) => {
      const isCombo = !!it.combo_id;
      return {
        mealId: isCombo ? it.combo?.code : String(it.product?.code ?? '').split('__')[0],
        mealName: isCombo ? it.combo?.name : it.product?.name,
        weight: isCombo ? 'Combo' : `${it.unit_weight}g`,
        quantity: Number(it.quantity),
        price: Number(it.unit_sell_price),
        cost: Number(it.unit_cost_price),
      };
    });
    return {
      id: o.id,
      orderNumber: o.code,
      customerId: o.customer?.code ?? '',
      customerName: o.customer?.name ?? '',
      customerPhone: o.customer?.phone ?? '',
      customerAddress: o.customer?.address ?? '',
      items,
      totalAmount: Number(o.total_price ?? 0),
      totalCost: Number(o.total_cost ?? 0),
      totalProfit: Number(o.total_price ?? 0) - Number(o.total_cost ?? 0),
      deliveryFee: Number(o.shipping_fee ?? 0),
      paymentMethod: 'COD',
      paymentStatus: 'Chưa thanh toán',
      status: o.status,
      deliveryDate: (o.order_date ?? '').slice(0, 10),
      createdAt: o.created_at,
      notes: o.note ?? '',
    };
  });
}

/** Bootstrap payload: meals, customers (with order aggregates), orders. */
export async function getBootstrap() {
  const [meals, customers, orders] = await Promise.all([getMeals(), getCustomers(), getOrders()]);
  for (const c of customers) {
    const theirs = orders.filter((o) => o.customerId === c.id);
    c.totalOrders = theirs.length;
    c.totalSpent = theirs.reduce((s, o) => s + o.totalAmount, 0);
  }
  return { meals, customers, orders };
}

// ---------- WRITE ----------

export async function upsertMeal(meal: MealItem): Promise<void> {
  const db = createAdminClient();
  if (!db) return;
  if (meal.category === 'Combo') {
    const o = meal.options[0];
    await db.from('mealfit_combos').upsert(
      {
        code: meal.code,
        name: meal.name,
        description: null,
        sell_price: o.price,
        cost_price: o.cost,
        profit: o.profit,
        profit_margin: o.margin,
      },
      { onConflict: 'code' },
    );
    return;
  }
  // Non-combo: replace option rows for this item (keyed by name).
  await db.from('mealfit_products').delete().eq('name', meal.name);
  const rows = meal.options.map((o) => ({
    code: `${meal.code}__${w(o.weight)}`,
    name: meal.name,
    category: meal.category,
    weight: w(o.weight),
    cost_price: o.cost,
    sell_price: o.price,
    profit: o.profit,
    profit_margin: o.margin,
  }));
  await db.from('mealfit_products').upsert(rows, { onConflict: 'code' });
}

export async function deleteMeal(meal: MealItem): Promise<void> {
  const db = createAdminClient();
  if (!db) return;
  if (meal.category === 'Combo') await db.from('mealfit_combos').delete().eq('code', meal.code);
  else await db.from('mealfit_products').delete().eq('name', meal.name);
}

export async function upsertCustomer(c: Customer): Promise<void> {
  const db = createAdminClient();
  if (!db) return;
  await db.from('mealfit_customers').upsert(
    {
      code: c.id || slug(c.name),
      name: c.name,
      phone: c.phone || null,
      address: c.address || null,
      notes: c.notes || null,
    },
    { onConflict: 'code' },
  );
}

export async function deleteCustomer(id: string): Promise<void> {
  const db = createAdminClient();
  if (!db) return;
  await db.from('mealfit_customers').delete().eq('code', id);
}

export async function upsertOrder(o: Order): Promise<void> {
  const db = createAdminClient();
  if (!db) return;

  const { data: cust } = await db.from('mealfit_customers').select('id').eq('code', o.customerId).maybeSingle();
  const totalQty = o.items.reduce((s, it) => s + it.quantity, 0);
  const { data: row } = await db
    .from('mealfit_orders')
    .upsert(
      {
        code: o.orderNumber,
        customer_id: cust?.id ?? null,
        order_date: o.deliveryDate,
        total_quantity: totalQty,
        total_price: o.totalAmount,
        total_cost: o.totalCost,
        shipping_fee: o.deliveryFee || 0,
        final_amount: o.totalAmount + (o.deliveryFee || 0),
        status: o.status,
        note: o.notes || null,
      },
      { onConflict: 'code' },
    )
    .select('id')
    .single();
  if (!row) return;

  await db.from('mealfit_order_items').delete().eq('order_id', row.id);

  // Resolve product/combo FKs by code.
  const [{ data: prods }, { data: combos }] = await Promise.all([
    db.from('mealfit_products').select('id, code'),
    db.from('mealfit_combos').select('id, code'),
  ]);
  const prodByCode = new Map((prods ?? []).map((r) => [r.code, r.id]));
  const comboByCode = new Map((combos ?? []).map((r) => [r.code, r.id]));

  const items = o.items.map((it) => {
    const isCombo = it.weight === 'Combo';
    return {
      order_id: row.id,
      product_id: isCombo ? null : prodByCode.get(`${it.mealId}__${w(it.weight)}`) ?? null,
      combo_id: isCombo ? comboByCode.get(it.mealId) ?? null : null,
      quantity: it.quantity,
      unit_weight: isCombo ? null : w(it.weight),
      unit_cost_price: it.cost,
      unit_sell_price: it.price,
      total_cost: it.cost * it.quantity,
      total_price: it.price * it.quantity,
      profit: (it.price - it.cost) * it.quantity,
    };
  });
  const valid = items.filter((i) => i.product_id || i.combo_id);
  if (valid.length) await db.from('mealfit_order_items').insert(valid);
}

export async function deleteOrder(id: string): Promise<void> {
  const db = createAdminClient();
  if (!db) return;
  // id may be a uuid (from DB) or an order code (offline).
  const col = /^[0-9a-f-]{36}$/i.test(id) ? 'id' : 'code';
  await db.from('mealfit_orders').delete().eq(col, id);
}
