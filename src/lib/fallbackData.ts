import type { Product } from './types'

/** Images live in /public/images/<unsplash-id>.jpg (downloaded from Unsplash). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const img = (id: string, _w = 1200) => `${import.meta.env.BASE_URL}images/${id}.jpg`

/** Sample catalogue used until Supabase env vars are set. Mirrors supabase/migrations seed. */
export const FALLBACK_PRODUCTS: Product[] = [
  { id: 'f1', name: 'Atelier Silk Trouser', arm: 'fashion', category: 'Trousers', description: 'Fluid silk-blend trouser with a gathered cuff.', price: 185000, image_url: img('1594633312681-425c7b97ccd1', 900), stock_qty: 6, ship_days: 3, preorder_days: 14, display_order: 1 },
  { id: 'f2', name: 'Maison Satin Bomber', arm: 'fashion', category: 'Outerwear', description: 'Liquid satin bomber in burnt copper.', price: 320000, image_url: img('1591047139829-d91aecb6caea', 900), stock_qty: 0, ship_days: 3, preorder_days: 21, display_order: 2 },
  { id: 'f3', name: 'Panier Woven Bag', arm: 'fashion', category: 'Accessories', description: 'Hand-woven body with leather trim.', price: 145000, image_url: img('1590874103328-eac38a683ce7', 900), stock_qty: 12, ship_days: 2, preorder_days: 10, display_order: 3 },
  { id: 'f4', name: 'Rive Gauche Pump', arm: 'fashion', category: 'Shoes', description: 'Pointed-toe pump in soft ivory nappa.', price: 98000, image_url: img('1535043934128-cf0b28d52f95', 900), stock_qty: 0, ship_days: 3, preorder_days: 18, display_order: 4 },
  { id: 'i1', name: 'Lumière Wing Chair', arm: 'interiors', category: 'Seating', description: 'Soft wool upholstery on a solid oak frame.', price: 540000, image_url: img('1598300042247-d088f8ab3a91', 900), stock_qty: 2, ship_days: 5, preorder_days: 30, display_order: 5 },
  { id: 'i2', name: 'Terre Ceramic Vessel', arm: 'interiors', category: 'Objects', description: 'Hand-thrown stoneware, matte glaze.', price: 42000, image_url: img('1612196808214-b8e1d6145a8c', 900), stock_qty: 20, ship_days: 2, preorder_days: 12, display_order: 6 },
  { id: 'i3', name: 'Salon Velvet Sofa', arm: 'interiors', category: 'Seating', description: 'Deep-seat three-seater in emerald velvet.', price: 1250000, image_url: img('1555041469-a586c61ea9bc', 900), stock_qty: 0, ship_days: 7, preorder_days: 45, display_order: 7 },
  { id: 'i4', name: 'Blanc Boudoir Chair', arm: 'interiors', category: 'Seating', description: 'Button-tufted slipper chair in ivory.', price: 186000, image_url: img('1567538096630-e0c55bd6374c', 900), stock_qty: 8, ship_days: 3, preorder_days: 14, display_order: 8 },
]
