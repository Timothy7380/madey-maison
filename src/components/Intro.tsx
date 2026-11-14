import { useEffect, useState } from 'react'
import { img } from '../lib/fallbackData'

/** Asterix-style loader: the "E" in MADEY is replaced by an image tile, then the curtain lifts. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    document.body.classList.add('lock')
    const t1 = setTimeout(() => {
      setOut(true)
      onDone()
    }, 2600)
    const t2 = setTimeout(() => {
      setGone(true)
      document.body.classList.remove('lock')
    }, 3700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.classList.remove('lock')
    }
  }, [onDone])

  if (gone) return null
  const letters = ['M', 'A', 'D', null, 'Y']
  return (
    <div className={`intro ${out ? 'out' : ''}`} aria-hidden>
      <div className="intro-word">
        {letters.map((l, i) =>
          l ? (
            <span key={i} className="intro-letter" style={{ animationDelay: `${i * 0.08}s` }}>
              {l}
            </span>
          ) : (
            <span key={i} className="intro-tile">
              <img src={img('1612196808214-b8e1d6145a8c', 400)} alt="" />
            </span>
          ),
        )}
      </div>
    </div>
  )
}
