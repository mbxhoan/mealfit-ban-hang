/*
 * Seed script for MealFit data
 *
 * This script reads the provided Excel spreadsheet and imports menu items,
 * combos, customers, employees, orders and order details into Supabase.
 *
 * To run:
 *   1. Install dependencies: npm install xlsx @supabase/supabase-js
 *   2. Place the MealFit spreadsheet (e.g. 3e0de3b2-69d0-4da2-9c6a-ea6e1e8e4434.xlsx) in the same directory.
 *   3. Set environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *   4. Execute: TS_NODE_TRANSPILE_ONLY=true ts-node scripts/seed/mealfit.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as path from 'path';

// Read Supabase credentials from env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to the Excel file. Adjust this if your filename/location differs.
const filePath = path.resolve(__dirname, '../../3e0de3b2-69d0-4da2-9c6a-ea6e1e8e4434.xlsx');

// Utility to extract a numeric weight (e.g. "100g" → 100)
function parseWeight(value: string): number {
  const match = value.match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? parseFloat(match[1]) : 0;
}

async function seedMealFit() {
  const workbook = XLSX.readFile(filePath);

  /**
   * 1. Seed products
   * We derive products from the `Bang_gia` sheet. Each row corresponds to a weight variant of a menu item.
   */
  const priceRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Bang_gia'], { defval: null });

  const products = priceRows.map(row => {
    const key = row['Key']; // e.g. "Ức gà cajun | 100g"
    const name = row['Món'];
    const sellPrice = Number(row['Giá bán']);
    const costPrice = Number(row['Giá vốn']);
    const profit = Number(row['Lãi/gói']);
    const profitMargin = Number(row['Tỉ lệ lãi (%)']);
    const weightPart = key.split('|')[1]?.trim();
    const weight = weightPart ? parseWeight(weightPart) : 0;
    // Generate a stable code: slugify name + weight (replace spaces/accented chars)
    const slugBase = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const code = `${slugBase}-${weight}`;
    return {
      code,
      name,
      category: null,
      weight,
      cost_price: costPrice,
      sell_price: sellPrice,
      profit,
      profit_margin: profitMargin,
    };
  });

  // Upsert products into Supabase
  console.log(`Inserting ${products.length} products...`);
  const { error: prodError } = await supabase
    .from('mealfit_products')
    .upsert(products, { onConflict: 'code' });
  if (prodError) {
    console.error('Failed to insert products:', prodError);
  }

  /**
   * 2. Seed combos
   * We derive combos from `Combo_tong_hop` and link their components via `Combo_chi_tiet`.
   */
  const comboRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Combo_tong_hop'], { defval: null });
  const comboDetailRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Combo_chi_tiet'], { defval: null });

  const combos = comboRows
    .filter(r => r['Mã combo'])
    .map(r => {
      return {
        code: String(r['Mã combo']).trim(),
        name: String(r['Tên combo']).trim(),
        description: r['Mô tả'] || null,
        // For now derive pricing as sum of underlying products
        sell_price: 0,
        cost_price: 0,
        profit: 0,
        profit_margin: 0,
      };
    });

  // Upsert combos first to generate IDs
  console.log(`Inserting ${combos.length} combos...`);
  const { data: insertedCombos, error: comboError } = await supabase
    .from('mealfit_combos')
    .upsert(combos, { onConflict: 'code' })
    .select();
  if (comboError) {
    console.error('Failed to insert combos:', comboError);
  }
  // Build a lookup map from code to id for linking
  const comboMap: Record<string, string> = {};
  (insertedCombos || []).forEach(c => {
    comboMap[c.code] = c.id;
  });

  // Build a lookup map for products by code for linking combos
  const { data: existingProducts } = await supabase
    .from('mealfit_products')
    .select('id, code');
  const productMap: Record<string, string> = {};
  (existingProducts || []).forEach(p => {
    productMap[p.code] = p.id;
  });

  // Prepare combo-product relationships
  const comboItems: any[] = [];
  for (const detail of comboDetailRows) {
    const comboCode = String(detail['Mã combo']).trim();
    const itemName = detail['Món'];
    const weight = parseWeight(String(detail['Trọng lượng'] || ''));
    const quantity = detail['Số lượng'] || 1;
    // Reconstruct product code using slug + weight
    const slugBase = itemName
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const productCode = `${slugBase}-${weight}`;
    const comboId = comboMap[comboCode];
    const productId = productMap[productCode];
    if (comboId && productId) {
      comboItems.push({
        combo_id: comboId,
        product_id: productId,
        quantity,
        weight,
      });
    }
  }

  console.log(`Inserting ${comboItems.length} combo items...`);
  const { error: comboItemsError } = await supabase
    .from('mealfit_combo_products')
    .upsert(comboItems, { onConflict: 'combo_id,product_id' });
  if (comboItemsError) {
    console.error('Failed to insert combo items:', comboItemsError);
  }

  /**
   * 3. Seed customers
   */
  const customerRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Khach_hang'], { defval: null });
  const customers = customerRows
    .filter(r => r['Tên KH (KHÔNG ĐƯỢC TRÙNG)'])
    .map(r => {
      const name = String(r['Tên KH (KHÔNG ĐƯỢC TRÙNG)']).trim();
      const code = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return {
        code,
        name,
        phone: r['SĐT'] || null,
        address: r['Địa chỉ'] || null,
        notes: r['Ghi chú'] || null,
      };
    });

  console.log(`Inserting ${customers.length} customers...`);
  const { error: customerError } = await supabase
    .from('mealfit_customers')
    .upsert(customers, { onConflict: 'code' });
  if (customerError) {
    console.error('Failed to insert customers:', customerError);
  }

  /**
   * 4. Seed employees
   * Note: the spreadsheet may contain a sheet `Nhân_viên`. Passwords must be encrypted or set manually.
   */
  const employeeRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Nhân_viên'], { defval: null });
  const employees = employeeRows
    .filter(r => r['Tên Nhân Viên (KHÔNG ĐƯỢC TRÙNG)'])
    .map((r, index) => {
      const name = String(r['Tên Nhân Viên (KHÔNG ĐƯỢC TRÙNG)']).trim();
      const code = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const role = index === 0 ? 'admin' : 'staff';
      // WARNING: set a default password here; in production ask users to change
      const plainPassword = 'Password123';
      // Supabase requires bcrypt/encrypted password only through auth.users; here we store plain text temporarily
      return {
        code,
        name,
        email: r['Email'] || `${code}@example.com`,
        role,
        encrypted_password: plainPassword,
      };
    });

  console.log(`Inserting ${employees.length} employees...`);
  const { error: employeeError } = await supabase
    .from('mealfit_employees')
    .upsert(employees, { onConflict: 'code' });
  if (employeeError) {
    console.error('Failed to insert employees:', employeeError);
  }

  /**
   * 5. TODO: Seed orders and order items
   * The sheets `Don_hang` and `Chi_tiet_don_hang` contain order data, but mapping them into the
   * normalised schema is non‑trivial. You can extend this script to parse those sheets,
   * generate codes for each order (`DH0001` → `dh0001`), look up customer and employee
   * references, compute totals and then insert into `mealfit_orders` and `mealfit_order_items`.
   */

  console.log('Seeding complete.');
}

seedMealFit().catch(err => {
  console.error(err);
});