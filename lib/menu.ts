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

export function categories(): string[] {
  return Array.from(new Set(DISHES.map((m) => m.category)));
}

/** One representative (cheapest-weight) dish per category, for the landing showcase. */
export function featuredDishes(): MealItem[] {
  const seen = new Set<string>();
  const out: MealItem[] = [];
  for (const m of DISHES) {
    if (!seen.has(m.category)) {
      seen.add(m.category);
      out.push(m);
    }
  }
  return out;
}
