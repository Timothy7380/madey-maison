export type Arm = 'fashion' | 'interiors'

export interface Product {
  id: string
  name: string
  arm: Arm
  category: string
  description: string
  price: number
  image_url: string
  stock_qty: number
  /** Days to ship when in stock */
  ship_days: number
  /** Days to make / source when out of stock (pre-order) */
  preorder_days: number
  display_order: number
  is_active?: boolean
}

export interface CartLine {
  product: Product
  qty: number
}

export interface OrderPayload {
  customer: { name: string; email: string; phone: string; address: string; notes: string }
  items: {
    product_id: string
    name: string
    unit_price: number
    qty: number
    fulfilment: 'ship' | 'preorder'
    days_to_deliver: number
  }[]
  total: number
  has_preorder: boolean
}
