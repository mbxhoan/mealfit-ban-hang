-- Per-category display photo + nutrition (per 100g) and a small key/value settings store.
-- Categories were previously implicit strings on mealfit_products.category; this gives them a
-- home for a shared photo + macros shown on the public landing page. Settings holds the home
-- contact links (Facebook / Zalo). Writes go through the service-role admin client, like the
-- rest of the MealFit tables; reads are permissive for authenticated users.

create table if not exists public.mealfit_categories (
  name text primary key,
  image_url text,
  kcal numeric,
  protein numeric,
  carb numeric,
  fat numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.mealfit_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.mealfit_categories enable row level security;
alter table public.mealfit_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['mealfit_categories','mealfit_settings']
  loop
    execute format('drop policy if exists "%s_read" on public.%I;', t, t);
    execute format('create policy "%s_read" on public.%I for select using (auth.role() = ''authenticated'');', t, t);
  end loop;
end $$;
