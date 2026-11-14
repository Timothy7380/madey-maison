import { useCallback, useEffect, useState } from 'react'
import Intro from './components/Intro'
import Nav from './components/Nav'
import Boutique from './components/Boutique'
import CartDrawer from './components/CartDrawer'
import EventsSection from './components/EventsSection'
import { About, Arms, Faq, Footer, Hero, Statement } from './components/Sections'
import { fetchProducts } from './lib/supabase'
import { useReveal } from './lib/hooks'
import type { CartLine, Product } from './lib/types'

export default function App() {
  const [ready, setReady] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cart, setCart] = useState<CartLine[]>([])
  const [bagOpen, setBagOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchProducts().then((p) => {
      setProducts(p)
      setLoading(false)
    })
  }, [])

  useReveal([loading, filter])
  const onIntroDone = useCallback(() => setReady(true), [])

  const add = (p: Product) => {
    setCart((c) => {
      const hit = c.find((l) => l.product.id === p.id)
      return hit ? c.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l)) : [...c, { product: p, qty: 1 }]
    })
    setToast(`${p.name} ${p.stock_qty > 0 ? 'added to your bag' : 'added as a pre-order'}`)
    setTimeout(() => setToast(''), 3200)
  }
  const setQty = (id: string, q: number) =>
    setCart((c) => (q <= 0 ? c.filter((l) => l.product.id !== id) : c.map((l) => (l.product.id === id ? { ...l, qty: q } : l))))
  const remove = (id: string) => setCart((c) => c.filter((l) => l.product.id !== id))

  const count = cart.reduce((s, l) => s + l.qty, 0)

  return (
    <div className={ready ? 'ready' : ''}>
      <Intro onDone={onIntroDone} />
      <Nav count={count} onBag={() => setBagOpen(true)} onFilter={setFilter} />
      <main>
        <Hero />
        <About />
        <Arms onFilter={setFilter} />
        <Boutique products={products} loading={loading} filter={filter} setFilter={setFilter} onAdd={add} />
        <EventsSection />
        <Statement />
        <Faq />
      </main>
      <Footer />
      <CartDrawer
        open={bagOpen}
        lines={cart}
        onClose={() => setBagOpen(false)}
        setQty={setQty}
        remove={remove}
        clear={() => setCart([])}
      />
      <div className={`toast ${toast ? 'on' : ''}`} role="status">
        {toast}
        <button
          onClick={() => {
            setToast('')
            setBagOpen(true)
          }}
        >
          View bag
        </button>
      </div>
    </div>
  )
}
