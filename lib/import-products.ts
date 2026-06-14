import type { MealItem, PricingOption } from '@/src/data/mealPrepData';

export const IMPORT_COLUMNS = [
  { key: 'Tên món', rule: 'Bắt buộc. Tên hiển thị của món.' },
  { key: 'Nhóm', rule: 'Bắt buộc. Danh mục, ví dụ: Ức gà, Thăn bò, Combo.' },
  { key: 'Trọng lượng (g)', rule: 'Bắt buộc. Số nguyên > 0, ví dụ 100.' },
  { key: 'Giá vốn', rule: 'Bắt buộc. Số ≥ 0 (VND).' },
  { key: 'Giá bán', rule: 'Bắt buộc. Số > 0 và ≥ giá vốn (VND).' },
] as const;

export const TEMPLATE_HEADER = IMPORT_COLUMNS.map((c) => c.key);

export const TEMPLATE_EXAMPLE_ROWS = [
  ['Ức gà cajun', 'Ức gà', 100, 16609, 25000],
  ['Ức gà cajun', 'Ức gà', 150, 24913, 36000],
  ['Combo giữ dáng', 'Combo', 0, 173427, 219000],
];

export interface RowError {
  row: number; // 1-based data row
  col: string;
  value: string;
  error: string;
}

export interface ParsedRow {
  name: string;
  category: string;
  weight: number;
  cost: number;
  sell: number;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // Strip VND grouping separators (space, dot, comma); prices are integers.
  const n = Number(String(v).replace(/[\s.,]/g, ''));
  return Number.isFinite(n) ? n : null;
};

/** Validate raw sheet rows. Returns clean parsed rows + a list of cell-level errors. */
export function validateRows(rows: Record<string, unknown>[]): { parsed: ParsedRow[]; errors: RowError[] } {
  const errors: RowError[] = [];
  const parsed: ParsedRow[] = [];

  rows.forEach((raw, i) => {
    const rowNo = i + 1;
    const name = String(raw['Tên món'] ?? '').trim();
    const category = String(raw['Nhóm'] ?? '').trim();
    const weightRaw = raw['Trọng lượng (g)'];
    const cost = num(raw['Giá vốn']);
    const sell = num(raw['Giá bán']);
    const isCombo = category.toLowerCase() === 'combo';
    const weight = num(weightRaw) ?? 0;

    if (!name) errors.push({ row: rowNo, col: 'Tên món', value: '', error: 'Thiếu tên món' });
    if (!category) errors.push({ row: rowNo, col: 'Nhóm', value: '', error: 'Thiếu nhóm' });
    if (!isCombo && (weight === null || weight <= 0))
      errors.push({ row: rowNo, col: 'Trọng lượng (g)', value: String(weightRaw ?? ''), error: 'Phải là số > 0' });
    if (cost === null || cost < 0)
      errors.push({ row: rowNo, col: 'Giá vốn', value: String(raw['Giá vốn'] ?? ''), error: 'Số ≥ 0' });
    if (sell === null || sell <= 0)
      errors.push({ row: rowNo, col: 'Giá bán', value: String(raw['Giá bán'] ?? ''), error: 'Số > 0' });
    if (cost !== null && sell !== null && sell < cost)
      errors.push({ row: rowNo, col: 'Giá bán', value: String(sell), error: 'Giá bán < giá vốn' });

    if (name && category && cost !== null && sell !== null && sell > 0)
      parsed.push({ name, category, weight: isCombo ? 0 : weight, cost, sell });
  });

  return { parsed, errors };
}

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/** Group validated rows into MealItem[] (one item per name, options per weight). */
export function rowsToMeals(parsed: ParsedRow[]): MealItem[] {
  const byName = new Map<string, MealItem>();
  for (const r of parsed) {
    const id = slug(r.name);
    const profit = r.sell - r.cost;
    const margin = r.sell > 0 ? Math.round((profit / r.sell) * 100) : 0;
    const option: PricingOption = {
      weight: r.category.toLowerCase() === 'combo' ? 'Combo' : `${r.weight}g`,
      price: r.sell,
      cost: r.cost,
      profit,
      margin,
    };
    const existing = byName.get(id);
    if (existing) {
      existing.options.push(option);
    } else {
      byName.set(id, {
        id,
        name: r.name,
        code: `MF-${id.toUpperCase().replace(/-/g, '').slice(0, 8)}`,
        category: r.category,
        options: [option],
      });
    }
  }
  return Array.from(byName.values());
}
