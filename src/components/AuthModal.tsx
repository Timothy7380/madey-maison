import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { img } from '../lib/fallbackData'

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset'

const COPY: Record<AuthMode, { pill: string; title: [string, string]; cta: string }> = {
  signin: { pill: 'Welcome back', title: ['Sign', 'in'], cta: 'Sign in' },
  signup: { pill: 'Join the Maison', title: ['Create', 'account'], cta: 'Create account' },
  forgot: { pill: 'Account help', title: ['Reset', 'password'], cta: 'Send reset link' },
  reset: { pill: 'Account help', title: ['New', 'password'], cta: 'Save new password' },
}

export default function AuthModal({
  open,
  mode: initial,
  reason,
  onClose,
  onSuccess,
}: {
  open: boolean
  mode: AuthMode
  reason?: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const auth = useAuth()
  const [mode, setMode] = useState<AuthMode>(initial)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (open) {
      setMode(initial)
      setErr('')
      setMsg('')
      setPw('')
    }
  }, [open, initial])

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && open && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])

  const go = (m: AuthMode) => {
    setMode(m)
    setErr('')
    setMsg('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setMsg('')
    const r =
      mode === 'signin'
        ? await auth.signIn(email, pw)
        : mode === 'signup'
          ? await auth.signUp(email, pw, name.trim())
          : mode === 'forgot'
            ? await auth.resetPassword(email)
            : await auth.updatePassword(pw)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    if (r.message) setMsg(r.message)
    if ((mode === 'signin' || mode === 'signup') && !r.message) {
      onSuccess?.()
      onClose()
    }
    if (mode === 'reset') setTimeout(onClose, 1200)
  }

  const c = COPY[mode]
  return (
    <div className={`modal-wrap ${open ? 'on' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="modal-scrim" onClick={onClose} />
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label={c.cta}>
        <div className="auth-art">
          <img src={img('1558769132-cb1aea458c5e')} alt="" />
          <div className="auth-art-copy">
            <span className="logo">
              MADEY <span>MAISON</span>
            </span>
            <p>Track your orders, see pre-order dates and check out faster with saved details.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <button type="button" className="auth-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <span className="pill">{c.pill}</span>
          <h3 className="display auth-title">
            {c.title[0]} <span className="script">{c.title[1]}</span>
          </h3>
          {reason && (mode === 'signin' || mode === 'signup') && <p className="auth-reason">{reason}</p>}
          {mode === 'forgot' && <p className="auth-reason">Enter your email and we'll send you a link to set a new password.</p>}

          {mode === 'signup' && (
            <label className="field">
              <span>Full name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          )}
          {mode !== 'reset' && (
            <label className="field">
              <span>Email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
          )}
          {mode !== 'forgot' && (
            <label className="field pw-field">
              <span>{mode === 'reset' ? 'New password' : 'Password'}</span>
              <input
                required
                type={show ? 'text' : 'password'}
                minLength={mode === 'signin' ? undefined : 8}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>
                {show ? 'Hide' : 'Show'}
              </button>
              {mode !== 'signin' && <small className="hint">At least 8 characters.</small>}
            </label>
          )}

          {mode === 'signin' && (
            <button type="button" className="link-btn" onClick={() => go('forgot')} style={{ marginTop: 14 }}>
              Forgot password?
            </button>
          )}

          {err && <p className="form-err">{err}</p>}
          {msg && <p className="form-ok">{msg}</p>}

          <button className="btn btn-pill" disabled={busy} style={{ marginTop: 28, width: '100%', justifyContent: 'center' }}>
            {busy ? 'Please wait…' : c.cta}
          </button>

          <p className="auth-switch">
            {mode === 'signin' && (
              <>
                New to Madey Maison?{' '}
                <button type="button" className="link-btn" onClick={() => go('signup')}>
                  Create an account
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={() => go('signin')}>
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button type="button" className="link-btn" onClick={() => go('signin')}>
                ← Back to sign in
              </button>
            )}
          </p>
          {auth.demo && (
            <p className="demo-note">
              Preview mode: accounts are saved in this browser only until the shop's database is connected.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
