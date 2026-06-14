/*
 * Seed MealFit Supabase tables from the source workbook + curated menu data.
 *
 * - Products / combos: from src/data/mealPrepData.ts (digitized Bang_gia / combos).
 * - Customers:         from the Khach_hang sheet + any name referenced by an order.
 * - Orders + items:    from the Don_hang / Chi_tiet_don_hang sheets.
 * - Employees:         one admin + one staff, ready for login.
 *
 * Uses the service-role key over PostgREST (tables must already exist). Idempotent.
 * Run: npm run seed   (requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEALFIT_XLSX_PATH)
 */

import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { INITIAL_MEAL_ITEMS, type MealItem } from '../../src/data/mealPrepData';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const weightNum = (w: string): number => parseInt(String(w), 10) || 0;
const isCombo = (m: MealItem) => m.category === 'Combo';
const slugify = (s: string) =>
  String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const parseNum = (v: unknown): number => {
  if (v == null || v === '') return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const parseDate = (v: unknown): string | null => {
  const m = String(v ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
};
const mapStatus = (delivery: unknown): string => {
  const s = String(delivery ?? '').toLowerCase();
  if (s.includes('hủy') || s.includes('huy')) return 'Đã hủy';
  if (s.includes('đã giao') || s.includes('da giao')) return 'Đã giao';
  if (s.includes('đang giao') || s.includes('dang giao')) return 'Đang giao';
  return 'Mới';
};

const ok = async (label: string, p: PromiseLike<{ error: any }>) => {
  const { error } = await p;
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
};

async function main() {
  const xlsxPath = path.resolve(
    process.cwd(),
    process.env.MEALFIT_XLSX_PATH || 'docs/Meal Prep quản lý bán hàng final_sheet.xlsx',
  );
  const wb = XLSX.readFile(xlsxPath);
  const sheet = (name: string): any[] =>
    wb.Sheets[name] ? XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: null, raw: false }) : [];

  // 1) Products (one row per weight option).
  const products = INITIAL_MEAL_ITEMS.filter((m) => !isCombo(m)).flatMap((m) =>
    m.options.map((o) => ({
      code: `${m.code}__${weightNum(o.weight)}`,
      name: m.name,
      category: m.category,
      weight: weightNum(o.weight),
      cost_price: o.cost,
      sell_price: o.price,
      profit: o.profit,
      profit_margin: o.margin,
    })),
  );
  await ok(`products (${products.length})`, db.from('mealfit_products').upsert(products, { onConflict: 'code' }));

  // 2) Combos.
  const combos = INITIAL_MEAL_ITEMS.filter(isCombo).map((m) => {
    const o = m.options[0];
    return {
      code: m.code,
      name: m.name,
      description: null,
      sell_price: o.price,
      cost_price: o.cost,
      profit: o.profit,
      profit_margin: o.margin,
    };
  });
  await ok(`combos (${combos.length})`, db.from('mealfit_combos').upsert(combos, { onConflict: 'code' }));

  // 3) Customers — Khach_hang sheet + any name referenced by an order.
  const donRows = sheet('Don_hang').filter((r) => /^DH\d+/.test(String(r['Mã đơn'] ?? '')));
  const custMap = new Map<string, any>(); // code -> row
  const nameToCode = new Map<string, string>(); // trimmed name -> code
  let emptyCounter = 0;
  const addCust = (name: unknown, phone?: unknown, address?: unknown, notes?: unknown) => {
    const nm = String(name ?? '').trim();
    if (!nm) return;
    if (nameToCode.has(nm)) {
      const e = custMap.get(nameToCode.get(nm)!);
      if (!e.phone && phone) e.phone = String(phone).trim();
      if (!e.address && address) e.address = String(address).trim();
      return;
    }
    let code = 'c-' + (slugify(nm) || `x${++emptyCounter}`);
    let final = code, k = 1;
    while (custMap.has(final)) final = `${code}-${k++}`;
    nameToCode.set(nm, final);
    custMap.set(final, {
      code: final,
      name: nm,
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
      notes: notes ? String(notes).trim() : null,
    });
  };
  sheet('Khach_hang')
    .filter((r) => r['Tên KH (KHÔNG ĐƯỢC TRÙNG)'])
    .forEach((r) => addCust(r['Tên KH (KHÔNG ĐƯỢC TRÙNG)'], r['SĐT'], r['Địa chỉ'], r['Ghi chú']));
  donRows.forEach((r) => addCust(r['Tên KH'], r['SĐT'], r['Địa chỉ']));
  const customers = [...custMap.values()];
  await ok(`customers (${customers.length})`, db.from('mealfit_customers').upsert(customers, { onConflict: 'code' }));

  // 4) Employees.
  await ok(
    'employees (2)',
    db.from('mealfit_employees').upsert(
      [
        { code: 'admin', name: 'Quản trị viên', email: 'admin@example.com', role: 'admin', encrypted_password: 'admin123' },
        { code: 'nhanvien', name: 'Nhân viên bán hàng', email: 'staff@example.com', role: 'staff', encrypted_password: 'staff123' },
      ],
      { onConflict: 'code' },
    ),
  );

  // Lookup maps for FK resolution.
  const { data: custRows } = await db.from('mealfit_customers').select('id, code');
  const custByCode = new Map((custRows ?? []).map((r) => [r.code, r.id]));
  const { data: prodRows } = await db.from('mealfit_products').select('id, name, weight');
  const prodByNameWeight = new Map((prodRows ?? []).map((r) => [`${r.name}|${r.weight}`, r.id]));
  const { data: comboRows2 } = await db.from('mealfit_combos').select('id, name');
  const comboByName = new Map((comboRows2 ?? []).map((r) => [r.name, r.id]));

  // 5) Group order items by order code.
  const ctRows = sheet('Chi_tiet_don_hang').filter((r) => /^DH\d+/.test(String(r['Mã đơn'] ?? '')));
  const itemsByOrder = new Map<string, any[]>();
  for (const r of ctRows) {
    const oc = String(r['Mã đơn']).trim();
    if (!itemsByOrder.has(oc)) itemsByOrder.set(oc, []);
    itemsByOrder.get(oc)!.push({
      combo: String(r['Loại dòng'] ?? '').toLowerCase().includes('combo'),
      món: String(r['Món'] ?? '').trim(),
      wn: weightNum(String(r['Trọng lượng'] ?? '')),
      qty: parseNum(r['Số lượng']) || 1,
      sell: parseNum(r['Giá bán/gói']),
      cost: parseNum(r['Giá vốn/gói']),
    });
  }

  // 6) Orders.
  const orderRows = donRows.map((r) => {
    const code = String(r['Mã đơn']).trim();
    const its = itemsByOrder.get(code) ?? [];
    const totalCost = its.reduce((s, it) => s + it.cost * it.qty, 0);
    return {
      code,
      customer_id: custByCode.get(nameToCode.get(String(r['Tên KH'] ?? '').trim()) ?? '') ?? null,
      order_date: parseDate(r['Ngày']) ?? '2026-01-01',
      total_quantity: parseNum(r['Tổng SL']),
      total_price: parseNum(r['Tổng CHƯA SHIP']),
      total_cost: totalCost,
      discount: parseNum(r['Giảm giá (đ)']),
      shipping_fee: parseNum(r['Phí ship']),
      final_amount: parseNum(r['Sau giảm (đ)']),
      status: mapStatus(r['Trạng thái giao hàng']),
      note: r['Ghi chú'] ? String(r['Ghi chú']).trim() : null,
    };
  });
  await ok(`orders (${orderRows.length})`, db.from('mealfit_orders').upsert(orderRows, { onConflict: 'code' }));

  const { data: orderIdRows } = await db.from('mealfit_orders').select('id, code');
  const orderByCode = new Map((orderIdRows ?? []).map((r) => [r.code, r.id]));

  // 7) Order items — refresh fully (idempotent), resolve product/combo FKs.
  await db.from('mealfit_order_items').delete().not('id', 'is', null);
  let matched = 0, skipped = 0;
  const itemRows: any[] = [];
  for (const [code, its] of itemsByOrder) {
    const orderId = orderByCode.get(code);
    if (!orderId) continue;
    for (const it of its) {
      const productId = it.combo ? null : prodByNameWeight.get(`${it.món}|${it.wn}`) ?? null;
      const comboId = it.combo ? comboByName.get(it.món) ?? null : null;
      if (!productId && !comboId) {
        skipped++;
        continue;
      }
      matched++;
      itemRows.push({
        order_id: orderId,
        product_id: productId,
        combo_id: comboId,
        quantity: it.qty,
        unit_weight: it.combo ? null : it.wn,
        unit_cost_price: it.cost,
        unit_sell_price: it.sell,
        total_cost: it.cost * it.qty,
        total_price: it.sell * it.qty,
        profit: (it.sell - it.cost) * it.qty,
      });
    }
  }
  for (let i = 0; i < itemRows.length; i += 500) {
    await ok(
      `order_items ${i + 1}-${Math.min(i + 500, itemRows.length)}`,
      db.from('mealfit_order_items').insert(itemRows.slice(i, i + 500)),
    );
  }
  console.log(`\nItems matched: ${matched}, skipped (no product/combo match): ${skipped}`);
  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
