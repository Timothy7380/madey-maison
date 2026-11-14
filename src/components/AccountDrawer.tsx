import { useEffect, useState } from 'react'
import { useAuth, type OrderRecord } from '../lib/auth'
import { naira } from '../lib/hooks'

type Tab = 'orders' | 'details' | 'security'

const STATUS: Record<string, string> = {
  pending: 'Received',
  'pre-order': 'Pre-order',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const due = (created: string, days: number) => {
  const d = new Date(created)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AccountDrawer({ open, onClose, onShop }: { open: boolean; onClose: () => void; onShop: () => void }) {
  const auth = useAuth()
  const { user } = auth
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<OrderRecord[] | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })
  const [pw, setPw] = useState('')
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    setNote(null)
    setForm({ full_name: user.full_name, phone: user.phone, address: user.address })
    setOrders(null)
    auth.myOrders().then(setOrders)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id])

  if (!user) return null
  const first = user.full_name.split(' ')[0] || 'there'

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const r = await auth.updateProfile(form)
    setBusy(false)
    setNote(r.ok ? { ok: true, text: r.message ?? 'Saved.' } : { ok: false, text: r.error })
  }
  const changePw = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const r = await auth.updatePassword(pw)
    setBusy(false)
    setPw('')
    setNote(r.ok ? { ok: true, text: r.message ?? 'Updated.' } : { ok: false, text: r.error })
  }

  return (
    <>
      <div className={`scrim ${open ? 'on' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'on' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="drawer-head">
          <div>
            <span className="pill">My account</span>
            <h3 style={{ marginTop: 10 }}>
              Bonjour, <span className="script" style={{ fontSize: 30 }}>{first}</span>
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            Close ✕
          </button>
        </div>
        <div className="acct-tabs">
          {(['orders', 'details', 'security'] as Tab[]).map((t) => (
            <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => { setTab(t); setNote(null) }}>
              {t === 'orders' ? 'Orders' : t === 'details' ? 'My details' : 'Password'}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {tab === 'orders' &&
            (orders === null ? (
              <p className="muted" style={{ padding: '32px 0' }}>Loading your orders…</p>
            ) : orders.length === 0 ? (
              <div style={{ padding: '40px 0' }}>
                <p className="muted">You haven't placed an order yet.</p>
                <button className="btn btn-pill" style={{ marginTop: 20 }} onClick={onShop}>
                  Shop the boutique <span className="arrow">→</span>
                </button>
              </div>
            ) : (
              orders.map((o) => (
                <div className="order-card" key={o.reference}>
                  <div className="order-top">
                    <div>
                      <b>{o.reference}</b>
                      <small>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
                    </div>
                    <span className={`pill pill-status s-${o.status}`}>{STATUS[o.status] ?? o.status}</span>
                  </div>
                  <ul>
                    {o.items.map((i) => (
                      <li key={i.product_id}>
                        <span>
                          {i.name} × {i.qty}
                        </span>
                        <span className="muted">
                          {i.fulfilment === 'ship' ? 'Ships by' : 'Pre-order, ready'} {due(o.created_at, i.days_to_deliver)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-total">
                    <span>Total</span>
                    <span>{naira(o.total)}</span>
                  </div>
                </div>
              ))
            ))}

          {tab === 'details' && (
            <form onSubmit={save}>
              <label className="field">
                <span>Email</span>
                <input value={user.email} disabled />
              </label>
              <label className="field">
                <span>Full name</span>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} autoComplete="name" />
              </label>
              <label className="field">
                <span>Phone</span>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
              </label>
              <label className="field">
                <span>Default delivery address</span>
                <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" />
              </label>
              {note && <p className={note.ok ? 'form-ok' : 'form-err'}>{note.text}</p>}
              <button className="btn btn-pill" disabled={busy} style={{ marginTop: 24 }}>
                {busy ? 'Saving…' : 'Save details'}
              </button>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={changePw}>
              <label className="field">
                <span>New password</span>
                <input required type="password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
                <small className="hint">At least 8 characters.</small>
              </label>
              {note && <p className={note.ok ? 'form-ok' : 'form-err'}>{note.text}</p>}
              <button className="btn btn-pill" disabled={busy} style={{ marginTop: 24 }}>
                {busy ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </div>

        <div className="drawer-foot">
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={async () => {
              await auth.signOut()
              onClose()
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
