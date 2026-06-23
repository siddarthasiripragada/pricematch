create extension if not exists pg_trgm;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('vegetable', 'fruit')),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  store_name text not null,
  price_value numeric(10, 2) not null check (price_value >= 0),
  price_unit text not null check (price_unit in ('per lb', 'per kg', 'per item')),
  flyer_image_url text not null,
  valid_from date default current_date,
  valid_to date,
  created_at timestamptz not null default now()
);

create index if not exists products_name_trgm_idx on products using gin (name gin_trgm_ops);
create index if not exists prices_product_price_idx on prices (product_id, price_value);

alter table products enable row level security;
alter table prices enable row level security;

create policy "Products are readable" on products for select using (true);
create policy "Prices are readable" on prices for select using (true);
