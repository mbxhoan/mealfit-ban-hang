import { INITIAL_MEAL_ITEMS, type MealItem, type CategoryInfo } from '@/src/data/mealPrepData';

export interface Nutrition {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

/** Built-in per-100g (cooked) macro defaults per protein group. Admin overrides win. */
export const CATEGORY_NUTRITION_DEFAULTS: Record<string, Nutrition> = {
  'Ức gà': { kcal: 165, protein: 31, carb: 0, fat: 3.6 },
  'Đùi gà': { kcal: 209, protein: 26, carb: 0, fat: 10.9 },
  'Cốt lết': { kcal: 231, protein: 26, carb: 0, fat: 14 },
  'Nạc heo': { kcal: 143, protein: 21, carb: 0, fat: 6 },
  'Thăn bò': { kcal: 217, protein: 26, carb: 0, fat: 12 },
  Tôm: { kcal: 99, protein: 24, carb: 0.2, fat: 0.3 },
  'Cá thu': { kcal: 205, protein: 19, carb: 0, fat: 13.9 },
  'Cá hồi': { kcal: 208, protein: 20, carb: 0, fat: 13 },
  'Cá tầm': { kcal: 135, protein: 21, carb: 0, fat: 5 },
  'Cá bóp': { kcal: 120, protein: 20, carb: 0, fat: 4 },
};

/** Custom-weight input bounds + the fixed presets shown on the menu nutrition panel. */
export const WEIGHT_MIN = 30;
export const WEIGHT_MAX = 1000;
export const WEIGHT_PRESETS = [100, 150, 200] as const;

/** Scale per-100g macros linearly to an arbitrary gram weight. */
export function nutritionFor(grams: number, base: Nutrition): Nutrition {
  const f = grams / 100;
  return {
    kcal: Math.round(base.kcal * f),
    protein: Math.round(base.protein * f * 10) / 10,
    carb: Math.round(base.carb * f * 10) / 10,
    fat: Math.round(base.fat * f * 10) / 10,
  };
}

/** Resolve a category's macros: admin override (CategoryInfo) wins over the built-in default. */
export function categoryNutrition(name: string, cats: CategoryInfo[] = []): Nutrition | null {
  const c = cats.find((x) => x.name === name);
  const def = CATEGORY_NUTRITION_DEFAULTS[name];
  const pick = (a?: number, b?: number) => (a != null ? a : b);
  const kcal = pick(c?.kcal, def?.kcal);
  const protein = pick(c?.protein, def?.protein);
  const carb = pick(c?.carb, def?.carb);
  const fat = pick(c?.fat, def?.fat);
  if (kcal == null && protein == null && carb == null && fat == null) return null;
  return { kcal: kcal ?? 0, protein: protein ?? 0, carb: carb ?? 0, fat: fat ?? 0 };
}

/** Category photo: admin-set category image preferred, else the first dish photo in the group. */
export function categoryImage(name: string, cats: CategoryInfo[], meals: MealItem[]): string | undefined {
  const c = cats.find((x) => x.name === name);
  if (c?.imageUrl) return c.imageUrl;
  return meals.find((m) => m.category === name && m.imageUrl)?.imageUrl;
}

/** Emoji per category — lightweight visual identity without binary image assets. */
export const CATEGORY_EMOJI: Record<string, string> = {
  'Ức gà': '🍗',
  'Đùi gà': '🍖',
  'Cốt lết': '🥩',
  'Nạc heo': '🥓',
  'Thăn bò': '🐄',
  Tôm: '🦐',
  'Cá thu': '🐟',
  'Cá hồi': '🍣',
  'Cá tầm': '🐠',
  'Cá bóp': '🎣',
  Combo: '🥗',
};

export function minPrice(item: MealItem): number {
  return Math.min(...item.options.map((o) => o.price));
}

export const ALL_MEALS = INITIAL_MEAL_ITEMS;

export const DISHES = INITIAL_MEAL_ITEMS.filter((m) => m.category !== 'Combo');
export const COMBOS = INITIAL_MEAL_ITEMS.filter((m) => m.category === 'Combo');

const dishesOf = (meals: MealItem[]) => meals.filter((m) => m.category !== 'Combo');
const combosOf = (meals: MealItem[]) => meals.filter((m) => m.category === 'Combo');

export function categories(meals: MealItem[] = INITIAL_MEAL_ITEMS): string[] {
  return Array.from(new Set(dishesOf(meals).map((m) => m.category)));
}

/** One representative (cheapest-weight) dish per category, for the landing showcase.
 *  Dishes that have a real photo are preferred as the category representative. */
export function featuredDishes(meals: MealItem[] = INITIAL_MEAL_ITEMS): MealItem[] {
  const byCat = new Map<string, MealItem>();
  for (const m of dishesOf(meals)) {
    const cur = byCat.get(m.category);
    if (!cur || (!cur.imageUrl && m.imageUrl)) byCat.set(m.category, m);
  }
  return Array.from(byCat.values());
}

/** All real, priced weight options offered for a dish, e.g. ["100g","150g","200g"]. */
export function weightOptions(item: MealItem): string[] {
  return Array.from(new Set(item.options.map((o) => o.weight)));
}

export interface CategoryCard {
  name: string;
  emoji: string;
  count: number;
  from: number;
  imageUrl?: string;
  code: string;
}

/** Protein/dish categories with real dish counts + entry price — for the category grid. */
export function categoryCards(meals: MealItem[] = INITIAL_MEAL_ITEMS, cats: CategoryInfo[] = []): CategoryCard[] {
  const map = new Map<string, MealItem[]>();
  for (const m of dishesOf(meals)) {
    const arr = map.get(m.category) ?? [];
    arr.push(m);
    map.set(m.category, arr);
  }
  return Array.from(map.entries()).map(([name, items]) => {
    const withImg = items.find((i) => i.imageUrl);
    return {
      name,
      emoji: CATEGORY_EMOJI[name] ?? '🍽️',
      count: items.length,
      from: Math.min(...items.map(minPrice)),
      imageUrl: categoryImage(name, cats, items),
      code: (withImg ?? items[0]).code,
    };
  });
}

/** One flavor of a category, trimmed to what the public menu needs (no cost/margin). */
export interface MenuFlavor {
  id: string;
  name: string;
  code: string;
  imageUrl?: string;
  options: { weight: string; price: number }[];
}

/** A category enriched with its photo, macros and flavor list — drives the public menu explorer. */
export interface MenuCategory {
  name: string;
  emoji: string;
  imageUrl?: string;
  count: number;
  from: number;
  nutrition: Nutrition | null;
  flavors: MenuFlavor[];
}

/** Build the full category → flavors + macros structure for the interactive home menu. */
export function menuCategories(meals: MealItem[] = INITIAL_MEAL_ITEMS, cats: CategoryInfo[] = []): MenuCategory[] {
  const map = new Map<string, MealItem[]>();
  for (const m of dishesOf(meals)) {
    const arr = map.get(m.category) ?? [];
    arr.push(m);
    map.set(m.category, arr);
  }
  return Array.from(map.entries()).map(([name, items]) => ({
    name,
    emoji: CATEGORY_EMOJI[name] ?? '🍽️',
    imageUrl: categoryImage(name, cats, items),
    count: items.length,
    from: Math.min(...items.map(minPrice)),
    nutrition: categoryNutrition(name, cats),
    flavors: items.map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code,
      imageUrl: m.imageUrl,
      options: m.options.map((o) => ({ weight: o.weight, price: o.price })),
    })),
  }));
}

export interface ComboCard {
  id: string;
  code: string;
  name: string;
  goal: string;
  audience: string;
  from: number;
  imageUrl?: string;
}

/** Hand-written goal copy keyed by the normalised combo base name. Honest — no
 *  nutrition numbers (the dataset has none), only positioning. */
const COMBO_COPY: Record<string, { goal: string; audience: string }> = {
  'combo giữ dáng': { goal: 'Khẩu phần cân bằng, ăn đều mỗi ngày', audience: 'Giữ dáng · ăn sạch' },
  'combo giảm cân': { goal: 'Ưu tiên đạm, tiết chế tinh bột', audience: 'Đang giảm cân' },
  'combo tăng cơ': { goal: 'Nhiều đạm, đủ năng lượng tập luyện', audience: 'Tập gym · tăng cơ' },
  'combo power fit': { goal: 'Năng lượng cao cho ngày vận động nhiều', audience: 'Vận động cường độ cao' },
};

function comboBaseKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.+$/, '')
    .replace(/\s+v\d+$/, '')
    .trim();
}

/** Deduplicated, curated combos (collapses ".", "v1" variants) for the home page.
 *  Prefers a variant that has a photo when collapsing duplicates. */
export function curatedCombos(meals: MealItem[] = INITIAL_MEAL_ITEMS): ComboCard[] {
  const byKey = new Map<string, ComboCard>();
  for (const c of combosOf(meals)) {
    const key = comboBaseKey(c.name);
    const existing = byKey.get(key);
    if (existing && existing.imageUrl) continue; // keep the one already carrying a photo
    const copy = COMBO_COPY[key] ?? { goal: 'Khẩu phần cân đối theo nhu cầu', audience: 'Phù hợp nhiều mục tiêu' };
    byKey.set(key, {
      id: c.id,
      code: c.code,
      name: c.name.replace(/\.+$/, '').replace(/\s+v\d+$/i, '').trim(),
      goal: copy.goal,
      audience: copy.audience,
      from: minPrice(c),
      imageUrl: c.imageUrl,
    });
  }
  return Array.from(byKey.values());
}
