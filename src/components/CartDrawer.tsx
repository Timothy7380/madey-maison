import { useState } from 'react'
import { buildOrder, fulfilmentFor, submitOrder } from '../lib/supabase'
import { etaDate, naira } from '../lib/hooks'
import type { CartLine, OrderPayload } from '../lib/types'

type Step = 'bag' | 'details' | 'done'

export default function CartDrawer({
  open,
  lines,
  onClose,
  setQty,
  remove,
  clear,
}: {
  open: boolean
  lines: CartLine[]
  onClose: () => void
  setQty: (id: string, q: number) => void
  remove: (id: string) => void
  clear: () => void
}) {
  const [step, setStep] = useState<Step>('bag')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ ref: string; order: OrderPayload } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })

  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0)
  const hasPre = lines.some((l) => fulfilmentFor(l.product, l.qty).type === 'preorder')

  const close = () => {
    onClose()
    if (step === 'done') setTimeout(() => setStep('bag'), 700)
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErr('')
    const order = buildOrder(lines, form)
    const res = await submitOrder(order)
    setSending(false)
    if (!res.ok) return setErr(res.error || 'Something went wrong. Please try again.')
    setDone({ ref: res.reference, order })
    setStep('done')
    clear()
  }

  const up = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <div className={`scrim ${open ? 'on' : ''}`} onClick={close} />
      <aside className={`drawer ${open ? 'on' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="drawer-head">
          <h3>{step === 'bag' ? 'Your bag' : step === 'details' ? 'Delivery details' : 'Order received'}</h3>
          <button onClick={close} aria-label="Close">
            Close ✕
          </button>
        </div>

        {step === 'bag' && (
          <>
            <div className="drawer-body">
              {lines.length === 0 ? (
                <p style={{ padding: '48px 0', color: 'var(--umber)' }}>Your bag is empty.</p>
              ) : (
                lines.map(({ product: p, qty }) => {
                  const f = fulfilmentFor(p, qty)
                  return (
                    <div className="line-item" key={p.id}>
                      <img src={p.image_url} alt={p.name} />
                      <div>
                        <h4>{p.name}</h4>
                        <span className={`ful ${f.type === 'preorder' ? 'pre' : ''}`}>
                          <i />
                          {f.type === 'ship'
                            ? `Ships in ${f.days} days`
                            : p.stock_qty > 0
                              ? `Only ${p.stock_qty} in stock · pre-order, ${f.days} days`
                              : `Pre-order · ready in ${f.days} days`}
                        </span>
                        <div className="qty">
                          <button onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease">−</button>
                          <span>{qty}</span>
                          <button onClick={() => setQty(p.id, qty + 1)} aria-label="Increase">+</button>
                        </div>
                        <button className="remove" onClick={() => remove(p.id)}>
                          Remove
                        </button>
                      </div>
                      <span className="price">{naira(p.price * qty)}</span>
                    </div>
                  )
                })
              )}
            </div>
            {lines.length > 0 && (
              <div className="drawer-foot">
                <div className="totals">
                  <span>Total</span>
                  <span>{naira(total)}</span>
                </div>
                <p className="foot-note">
                  {hasPre
                    ? 'Your bag includes pre-order items. Each piece ships on its own timeline, shown above.'
                    : 'All items are in stock and ready to ship.'}{' '}
                  Delivery is confirmed with you after ordering.
                </p>
                <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('details')}>
                  Continue <span className="arrow">→</span>
                </button>
              </div>
            )}
          </>
        )}

        {step === 'details' && (
          <form onSubmit={send} style={{ display: 'contents' }}>
            <div className="drawer-body">
              <button type="button" className="remove" onClick={() => setStep('bag')} style={{ margin: '16px 0 0' }}>
                ← Back to bag
              </button>
              <label className="field">
                <span>Full name</span>
                <input required value={form.name} onChange={up('name')} autoComplete="name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input required type="email" value={form.email} onChange={up('email')} autoComplete="email" />
              </label>
              <label className="field">
                <span>Phone</span>
                <input required type="tel" value={form.phone} onChange={up('phone')} autoComplete="tel" />
              </label>
              <label className="field">
                <span>Delivery address</span>
                <textarea required rows={2} value={form.address} onChange={up('address')} autoComplete="street-address" />
              </label>
              <label className="field">
                <span>Notes (sizes, colours, anything else)</span>
                <textarea rows={2} value={form.notes} onChange={up('notes')} />
              </label>
              {err && <p style={{ color: '#a63e2d', marginTop: 16, fontSize: 14 }}>{err}</p>}
            </div>
            <div className="drawer-foot">
              <div className="totals">
                <span>Total</span>
                <span>{naira(total)}</span>
              </div>
              <p className="foot-note">We'll confirm your order and payment details by email and phone.</p>
              <button className="btn btn-dark" disabled={sending} style={{ width: '100%', justifyContent: 'center', opacity: sending ? 0.6 : 1 }}>
                {sending ? 'Sending…' : 'Place order'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && done && (
          <div className="drawer-body">
            <div className="confirm">
              <span className="script" style={{ fontSize: 56 }}>Merci</span>
              <h4>Order {done.ref}</h4>
              <p>
                Thank you, {done.order.customer.name.split(' ')[0]}. We've received your order and will contact you at{' '}
                {done.order.customer.email} to confirm.
              </p>
              <ul>
                {done.order.items.map((i) => (
                  <li key={i.product_id}>
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span style={{ color: 'var(--umber)' }}>
                      {i.fulfilment === 'ship' ? 'Ships' : 'Pre-order, ready'} by {etaDate(i.days_to_deliver)}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="btn btn-ghost" onClick={close}>
                Continue browsing
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
