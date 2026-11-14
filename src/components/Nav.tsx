import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'

const LINKS = [
  ['Maison', '#maison'],
  ['Fashion', '#boutique'],
  ['Interiors', '#boutique'],
  ['Events', '#events'],
  ['FAQ', '#faq'],
]

export default function Nav({
  count,
  onBag,
  onFilter,
  onAccount,
}: {
  count: number
  onBag: () => void
  onFilter: (f: string) => void
  onAccount: () => void
}) {
  const { user } = useAuth()
  const initials = user ? (user.full_name || user.email).split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : ''
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.75)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const click = (label: string) => {
    if (label === 'Fashion') onFilter('fashion')
    if (label === 'Interiors') onFilter('interiors')
    setOpen(false)
  }

  return (
    <>
      <header className={`nav ${solid ? 'solid' : ''}`}>
        <div className="wrap nav-inner">
          <a href="#top" className="logo">
            MADEY <span>MAISON</span>
          </a>
          <nav className="nav-links">
            {LINKS.map(([l, h]) => (
              <a key={l} href={h} onClick={() => click(l)}>
                {l}
              </a>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="bag-btn acct-btn" onClick={onAccount} aria-label={user ? 'My account' : 'Sign in'}>
              {user ? (
                <>
                  <span className="avatar">{initials}</span>
                  <span className="bag-label">Account</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                  </svg>
                  <span className="bag-label">Sign in</span>
                </>
              )}
            </button>
            <button className="bag-btn" onClick={onBag} aria-label={`Bag, ${count} items`}>
              <span className="bag-label">Bag</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 8h14l-1 13H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="bag-count">{count}</span>
            </button>
            <button className="bag-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6 6 18" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8h16M4 16h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-menu ${open ? 'on' : ''}`}>
        {LINKS.map(([l, h]) => (
          <a key={l} href={h} onClick={() => click(l)}>
            {l}
          </a>
        ))}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setOpen(false)
            onAccount()
          }}
          style={{ color: 'var(--sand)' }}
        >
          {user ? 'My account' : 'Sign in'}
        </a>
      </div>
    </>
  )
}
