-- Madey Maison: customer accounts (Supabase Auth) + per-customer orders

-- 1. Profiles: one row per auth user
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  phone      text not null default '',
  address    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Own profile read"   on public.profiles;
drop policy if exists "Own profile insert" on public.profiles;
drop policy if exists "Own profile update" on public.profiles;
create policy "Own profile read"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Own profile insert" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Own profile update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Create a profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Orders belong to a customer
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null default auth.uid();
create index if not exists orders_user_id_idx on public.orders(user_id);

-- Only signed-in customers can order, only for themselves, and only see their own orders
drop policy if exists "Public insert orders"   on public.orders;
drop policy if exists "Customer insert orders" on public.orders;
drop policy if exists "Customer read orders"   on public.orders;
create policy "Customer insert orders" on public.orders for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Customer read orders"   on public.orders for select to authenticated using (user_id = (select auth.uid()));
-- (Order status is updated by staff from the Supabase dashboard / service role.)
