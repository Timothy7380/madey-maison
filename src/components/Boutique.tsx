import { etaDate, naira } from '../lib/hooks'
import type { Product } from '../lib/types'

const FILTERS = [
  ['all', 'All'],
  ['fashion', 'Fashion'],
  ['interiors', 'Interiors'],
  ['instock', 'In stock'],
  ['preorder', 'Pre-order'],
]

export default function Boutique({
  products,
  loading,
  filter,
  setFilter,
  onAdd,
}: {
  products: Product[]
  loading: boolean
  filter: string
  setFilter: (f: string) => void
  onAdd: (p: Product) => void
}) {
  const shown = products.filter((p) =>
    filter === 'all'
      ? true
      : filter === 'instock'
        ? p.stock_qty > 0
        : filter === 'preorder'
          ? p.stock_qty === 0
          : p.arm === filter,
  )

  return (
    <section className="section" id="boutique" style={{ background: '#f4efe9' }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">
              The Boutique
            </div>
            <h2 className="display section-title reveal reveal-d1" style={{ marginTop: 20 }}>
              Shop the <span className="script">collection</span>
            </h2>
          </div>
          <div className="filters reveal reveal-d2">
            {FILTERS.map(([k, l]) => (
              <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--umber)' }}>Loading the collection…</p>
        ) : (
          <div className="product-grid">
            {shown.map((p, i) => {
              const inStock = p.stock_qty > 0
              return (
                <article key={p.id} className={`product-card reveal reveal-d${(i % 4) as 0 | 1 | 2 | 3}`}>
                  <div className="product-media">
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                    <span className={`status ${inStock ? '' : 'pre'}`}>
                      <i />
                      {inStock ? 'In stock' : 'Pre-order'}
                    </span>
                    <button className="quick-add" onClick={() => onAdd(p)}>
                      {inStock ? 'Add to bag' : 'Pre-order now'}
                    </button>
                  </div>
                  <div className="product-info">
                    <div>
                      <h3>{p.name}</h3>
                      <small>
                        {p.arm} · {p.category}
                      </small>
                    </div>
                    <span className="price">{naira(p.price)}</span>
                  </div>
                  <p className="eta">
                    {inStock
                      ? `Ships in ${p.ship_days} days · arrives by ${etaDate(p.ship_days)}`
                      : `Ready in ${p.preorder_days} days · est. ${etaDate(p.preorder_days)}`}
                  </p>
                </article>
              )
            })}
          </div>
        )}

        <div className="how">
          {[
            ['01', 'Order online', 'Add pieces to your bag and send your order in minutes, any time.'],
            ['02', 'In stock? It ships', 'Available pieces are packed and shipped within the days shown.'],
            ['03', 'Not in stock? Pre-order', 'We make or source it for you, and tell you exactly how many days it takes.'],
          ].map(([n, t, d], i) => (
            <div key={n} className={`reveal reveal-d${i + 1}`}>
              <h4 style={{ marginTop: 0 }}>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
