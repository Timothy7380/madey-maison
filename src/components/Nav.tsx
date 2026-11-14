import { useEffect, useState } from 'react'

const LINKS = [
  ['Maison', '#maison'],
  ['Fashion', '#boutique'],
  ['Interiors', '#boutique'],
  ['Events', '#events'],
  ['FAQ', '#faq'],
]

export default function Nav({ count, onBag, onFilter }: { count: number; onBag: () => void; onFilter: (f: string) => void }) {
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
            <button className="bag-btn" onClick={onBag} aria-label={`Bag, ${count} items`}>
              <span className="bag-label">Bag</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 8h14l-1 13H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="bag-count">{count}</span>
            </button>
            <button className="bag-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? 'Close' : 'Menu'}
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
      </div>
    </>
  )
}
