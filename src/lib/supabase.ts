import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { FALLBACK_PRODUCTS } from './fallbackData'
import type { CartLine, OrderPayload, Product } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null when env vars aren't set — the site then runs on local sample data. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) return FALLBACK_PRODUCTS
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error || !data) {
    console.warn('[Madey Maison] Falling back to sample products:', error?.message)
    return FALLBACK_PRODUCTS
  }
  return data as Product[]
}

/** Each line is either shipped now (in stock) or pre-ordered with a lead time. */
export function fulfilmentFor(p: Product, qty: number) {
  const available = p.stock_qty >= qty
  return available
    ? { type: 'ship' as const, days: p.ship_days }
    : { type: 'preorder' as const, days: p.preorder_days }
}

export function buildOrder(lines: CartLine[], customer: OrderPayload['customer']): OrderPayload {
  const items = lines.map(({ product, qty }) => {
    const f = fulfilmentFor(product, qty)
    return {
      product_id: product.id,
      name: product.name,
      unit_price: product.price,
      qty,
      fulfilment: f.type,
      days_to_deliver: f.days,
    }
  })
  return {
    customer,
    items,
    total: items.reduce((s, i) => s + i.unit_price * i.qty, 0),
    has_preorder: items.some((i) => i.fulfilment === 'preorder'),
  }
}
