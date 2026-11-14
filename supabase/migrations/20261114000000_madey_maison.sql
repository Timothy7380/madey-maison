-- Madey Maison: boutique products + online orders
create extension if not exists "pgcrypto";

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  arm           text not null check (arm in ('fashion','interiors')),
  category      text not null default '',
  description   text not null default '',
  price         numeric(12,2) not null check (price >= 0),
  image_url     text not null,
  stock_qty     integer not null default 0 check (stock_qty >= 0),
  ship_days     integer not null default 3,   -- days to ship when in stock
  preorder_days integer not null default 21,  -- days to make/source when out of stock
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  delivery_address text not null,
  notes            text default '',
  items            jsonb not null,   -- [{product_id,name,unit_price,qty,fulfilment:'ship'|'preorder',days_to_deliver}]
  total            numeric(12,2) not null,
  has_preorder     boolean not null default false,
  status           text not null default 'pending'
                   check (status in ('pending','pre-order','confirmed','shipped','delivered','cancelled')),
  created_at       timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- Anyone can browse active products
drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products
  for select to anon, authenticated using (is_active = true);

-- Anyone can place an order, but cannot read other people's orders
drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders" on public.orders
  for insert to anon, authenticated with check (true);

-- Seed catalogue
insert into public.products (name, arm, category, description, price, image_url, stock_qty, ship_days, preorder_days, display_order) values
 ('Atelier Silk Trouser','fashion','Trousers','Fluid silk-blend trouser with a gathered cuff.',185000,'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',6,3,14,1),
 ('Maison Satin Bomber','fashion','Outerwear','Liquid satin bomber in burnt copper.',320000,'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',0,3,21,2),
 ('Panier Woven Bag','fashion','Accessories','Hand-woven body with leather trim.',145000,'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',12,2,10,3),
 ('Rive Gauche Pump','fashion','Shoes','Pointed-toe pump in soft ivory nappa.',98000,'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=900&q=80',0,3,18,4),
 ('Lumière Wing Chair','interiors','Seating','Soft wool upholstery on a solid oak frame.',540000,'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=80',2,5,30,5),
 ('Terre Ceramic Vessel','interiors','Objects','Hand-thrown stoneware, matte glaze.',42000,'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=80',20,2,12,6),
 ('Salon Velvet Sofa','interiors','Seating','Deep-seat three-seater in emerald velvet.',1250000,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',0,7,45,7),
 ('Blanc Boudoir Chair','interiors','Seating','Button-tufted slipper chair in ivory.',186000,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80',8,3,14,8);
