-- Add optional product/combo photos shown on the public home page.
alter table public.mealfit_products add column if not exists image_url text;
alter table public.mealfit_combos   add column if not exists image_url text;
