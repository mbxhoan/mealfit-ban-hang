-- MealFit schema migration
-- This migration creates tables specific to the MealFit product for menu items, combos, customers,
-- employees, orders and order details.  It does not enable row‑level security yet; you should
-- create appropriate RLS policies after defining the roles and permissions for your product.

create table if not exists public.mealfit_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text,
  weight integer not null,
  cost_price numeric not null,
  sell_price numeric not null,
  profit numeric not null,
  profit_margin numeric not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mealfit_combos (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sell_price numeric not null,
  cost_price numeric not null,
  profit numeric not null,
  profit_margin numeric not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mealfit_combo_products (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.mealfit_combos(id) on delete cascade,
  product_id uuid not null references public.mealfit_products(id),
  quantity integer not null default 1,
  weight integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (combo_id, product_id)
);

create table if not exists public.mealfit_customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mealfit_employees (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  email text unique,
  role text not null check (role in ('admin','staff')),
  encrypted_password text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mealfit_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid references public.mealfit_customers(id),
  employee_id uuid references public.mealfit_employees(id),
  order_date date not null default current_date,
  total_quantity numeric,
  total_price numeric,
  total_cost numeric,
  discount numeric default 0,
  shipping_fee numeric default 0,
  final_amount numeric,
  status text not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mealfit_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.mealfit_orders(id) on delete cascade,
  product_id uuid references public.mealfit_products(id),
  combo_id uuid references public.mealfit_combos(id),
  quantity numeric not null,
  unit_weight numeric,
  unit_cost_price numeric,
  unit_sell_price numeric,
  total_cost numeric,
  total_price numeric,
  profit numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((product_id is not null and combo_id is null) or (product_id is null and combo_id is not null))
);

-- Indexes for performance
create index if not exists mealfit_products_code_idx on public.mealfit_products(code);
create index if not exists mealfit_combos_code_idx on public.mealfit_combos(code);
create index if not exists mealfit_customers_code_idx on public.mealfit_customers(code);
create index if not exists mealfit_orders_code_idx on public.mealfit_orders(code);

-- Enable row level security later in application setup if needed
-- alter table public.mealfit_products enable row level security;