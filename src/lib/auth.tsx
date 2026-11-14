import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { OrderPayload } from './types'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
}

export interface OrderRecord {
  reference: string
  created_at: string
  status: string
  total: number
  has_preorder: boolean
  items: OrderPayload['items']
}

type Result = { ok: true; message?: string } | { ok: false; error: string }

interface AuthCtx {
  user: Profile | null
  loading: boolean
  demo: boolean
  recovering: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<Result>
  signIn: (email: string, password: string) => Promise<Result>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<Result>
  updatePassword: (password: string) => Promise<Result>
  updateProfile: (p: Partial<Omit<Profile, 'id' | 'email'>>) => Promise<Result>
  myOrders: () => Promise<OrderRecord[]>
  placeOrder: (o: OrderPayload) => Promise<{ ok: boolean; reference: string; error?: string }>
}

const Ctx = createContext<AuthCtx | null>(null)
export const useAuth = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>')
  return c
}

const newRef = () => 'MM-' + Date.now().toString(36).toUpperCase().slice(-6)

/* ───────────── Demo mode (no Supabase env vars) ─────────────
 * Accounts and orders live only in this browser's localStorage so the
 * flow can be tried on the static preview. Passwords are stored hashed.
 * Connect Supabase for real, shared customer accounts. */
const LS = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k)
      return v ? (JSON.parse(v) as T) : d
    } catch {
      return d
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      /* storage unavailable */
    }
  },
  del(k: string) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}
type DemoUser = Profile & { pw: string }
const hash = async (s: string) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mm:' + s))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}
const demoUsers = () => LS.get<Record<string, DemoUser>>('mm_users', {})
const strip = ({ pw: _pw, ...p }: DemoUser): Profile => p

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = !supabase
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  const loadProfile = useCallback(async (id: string, email: string, meta?: Record<string, unknown>) => {
    if (!supabase) return
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    setUser({
      id,
      email,
      full_name: data?.full_name ?? (meta?.full_name as string) ?? '',
      phone: data?.phone ?? '',
      address: data?.address ?? '',
    })
  }, [])

  useEffect(() => {
    if (!supabase) {
      const email = LS.get<string | null>('mm_session', null)
      const u = email ? demoUsers()[email] : undefined
      setUser(u ? strip(u) : null)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session
      if (s) await loadProfile(s.user.id, s.user.email ?? '', s.user.user_metadata)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (session) loadProfile(session.user.id, session.user.email ?? '', session.user.user_metadata)
      else setUser(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value: AuthCtx = {
    user,
    loading,
    demo,
    recovering,

    async signUp(email, password, fullName) {
      email = email.trim().toLowerCase()
      if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' }
      if (!supabase) {
        const users = demoUsers()
        if (users[email]) return { ok: false, error: 'An account with this email already exists. Please sign in.' }
        const u: DemoUser = { id: crypto.randomUUID(), email, full_name: fullName, phone: '', address: '', pw: await hash(password) }
        LS.set('mm_users', { ...users, [email]: u })
        LS.set('mm_session', email)
        setUser(strip(u))
        return { ok: true }
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + window.location.pathname },
      })
      if (error) return { ok: false, error: error.message }
      if (!data.session) return { ok: true, message: 'Check your inbox to confirm your email, then sign in.' }
      return { ok: true }
    },

    async signIn(email, password) {
      email = email.trim().toLowerCase()
      if (!supabase) {
        const u = demoUsers()[email]
        if (!u || u.pw !== (await hash(password))) return { ok: false, error: 'Incorrect email or password.' }
        LS.set('mm_session', email)
        setUser(strip(u))
        return { ok: true }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { ok: false, error: error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message } : { ok: true }
    },

    async signOut() {
      if (!supabase) {
        LS.del('mm_session')
        setUser(null)
        return
      }
      await supabase.auth.signOut()
      setUser(null)
    },

    async resetPassword(email) {
      email = email.trim().toLowerCase()
      if (!supabase)
        return { ok: true, message: 'Demo mode: password reset emails are sent once Supabase is connected.' }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
      })
      return error ? { ok: false, error: error.message } : { ok: true, message: 'If an account exists, a reset link is on its way to your inbox.' }
    },

    async updatePassword(password) {
      if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' }
      if (!supabase) {
        if (!user) return { ok: false, error: 'Please sign in first.' }
        const users = demoUsers()
        users[user.email] = { ...users[user.email], pw: await hash(password) }
        LS.set('mm_users', users)
        return { ok: true, message: 'Password updated.' }
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return { ok: false, error: error.message }
      setRecovering(false)
      return { ok: true, message: 'Password updated.' }
    },

    async updateProfile(p) {
      if (!user) return { ok: false, error: 'Please sign in first.' }
      const next = { ...user, ...p }
      if (!supabase) {
        const users = demoUsers()
        users[user.email] = { ...users[user.email], ...p }
        LS.set('mm_users', users)
        setUser(next)
        return { ok: true, message: 'Details saved.' }
      }
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: next.full_name, phone: next.phone, address: next.address })
      if (error) return { ok: false, error: error.message }
      setUser(next)
      return { ok: true, message: 'Details saved.' }
    },

    async myOrders() {
      if (!user) return []
      if (!supabase) return LS.get<(OrderRecord & { email: string })[]>('mm_orders', []).filter((o) => o.email === user.email).reverse()
      const { data } = await supabase
        .from('orders')
        .select('reference, created_at, status, total, has_preorder, items')
        .order('created_at', { ascending: false })
      return (data ?? []) as OrderRecord[]
    },

    async placeOrder(order) {
      const reference = newRef()
      if (!user) return { ok: false, reference, error: 'Please sign in to place your order.' }
      if (!supabase) {
        await new Promise((r) => setTimeout(r, 600))
        const rec = {
          email: user.email,
          reference,
          created_at: new Date().toISOString(),
          status: order.has_preorder ? 'pre-order' : 'pending',
          total: order.total,
          has_preorder: order.has_preorder,
          items: order.items,
        }
        LS.set('mm_orders', [...LS.get<unknown[]>('mm_orders', []), rec])
        return { ok: true, reference }
      }
      const { error } = await supabase.from('orders').insert({
        reference,
        user_id: user.id,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        delivery_address: order.customer.address,
        notes: order.customer.notes,
        items: order.items,
        total: order.total,
        has_preorder: order.has_preorder,
        status: order.has_preorder ? 'pre-order' : 'pending',
      })
      return error ? { ok: false, reference, error: error.message } : { ok: true, reference }
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
