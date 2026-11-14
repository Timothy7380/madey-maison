import { useEffect, useState } from 'react'
import { buildOrder, fulfilmentFor } from '../lib/supabase'
import { useAuth } from '../lib/auth'
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
  onNeedAuth,
  wantDetails,
}: {
  open: boolean
  lines: CartLine[]
  onClose: () => void
  setQty: (id: string, q: number) => void
  remove: (id: string) => void
  clear: () => void
  onNeedAuth: () => void
  /** bumps after a successful sign-in from checkout, to jump to the details step */
  wantDetails: number
}) {
  const auth = useAuth()
  const [step, setStep] = useState<Step>('bag')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ ref: string; order: OrderPayload } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })
  const [remember, setRemember] = useState(true)

  // Prefill delivery details from the signed-in customer's profile
  useEffect(() => {
    const u = auth.user
    if (!u) return
    setForm((f) => ({
      ...f,
      name: f.name || u.full_name,
      email: u.email,
      phone: f.phone || u.phone,
      address: f.address || u.address,
    }))
  }, [auth.user])

  useEffect(() => {
    if (wantDetails && auth.user) setStep('details')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantDetails])

  useEffect(() => {
    if (!auth.user && step === 'details') setStep('bag')
  }, [auth.user, step])

  const toDetails = () => (auth.user ? setStep('details') : onNeedAuth())

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
    const res = await auth.placeOrder(order)
    if (res.ok && remember && auth.user && (form.phone !== auth.user.phone || form.address !== auth.user.address || form.name !== auth.user.full_name))
      await auth.updateProfile({ full_name: form.name, phone: form.phone, address: form.address })
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
                <button className="btn btn-pill" style={{ width: '100%', justifyContent: 'center' }} onClick={toDetails}>
                  {auth.user ? 'Continue' : 'Sign in to check out'} <span className="arrow">→</span>
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
                <input required type="email" value={form.email} onChange={up('email')} autoComplete="email" readOnly />
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
              <label className="check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Save these details to my account</span>
              </label>
              {err && <p className="form-err">{err}</p>}
            </div>
            <div className="drawer-foot">
              <div className="totals">
                <span>Total</span>
                <span>{naira(total)}</span>
              </div>
              <p className="foot-note">We'll confirm your order and payment details by email and phone.</p>
              <button className="btn btn-pill" disabled={sending} style={{ width: '100%', justifyContent: 'center', opacity: sending ? 0.6 : 1 }}>
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
                {done.order.customer.email} to confirm. Track it any time in My account.
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
