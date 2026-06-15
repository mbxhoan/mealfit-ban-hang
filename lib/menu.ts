import { INITIAL_MEAL_ITEMS, type MealItem } from '@/src/data/mealPrepData';

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
export function categoryCards(meals: MealItem[] = INITIAL_MEAL_ITEMS): CategoryCard[] {
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
      imageUrl: withImg?.imageUrl,
      code: (withImg ?? items[0]).code,
    };
  });
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
