import { useState } from 'react'
import { img } from '../lib/fallbackData'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-media">
        <img src={img('1558769132-cb1aea458c5e', 2000)} alt="Madey Maison editorial" />
      </div>
      <div className="wrap hero-content">
        <h1 className="display hero-title">
          <span className="line">
            <span>Fashion</span>
          </span>
          <span className="line indent">
            <span>
              <span className="script amp">&amp;</span>Living
            </span>
          </span>
        </h1>
        <div className="hero-bottom">
          <p>
            Madey Maison is a house of fashion, interiors and events, built on considered craft and quiet luxury since 2015.
          </p>
          <div className="hero-meta">
            <div>
              <b>2015</b>Established
            </div>
            <div>
              <b>03</b>Houses under one name
            </div>
            <a href="#boutique" className="btn btn-ghost-light" style={{ alignSelf: 'center' }}>
              Shop the boutique <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="section" id="maison">
      <div className="wrap about-grid">
        <div>
          <div className="eyebrow reveal">
            The Maison
          </div>
          <p className="about-lead reveal reveal-d1" style={{ marginTop: 28 }}>
            A French-inspired house where <em>what you wear</em>, <em>where you live</em> and{' '}
            <em>how you celebrate</em> share one point of view.
          </p>
          <div className="about-facts reveal reveal-d2">
            <div>
              <b>2015</b>
              <span>Launched &amp; registered</span>
            </div>
            <div>
              <b>03</b>
              <span>Arms under one house</span>
            </div>
            <div>
              <b>24/7</b>
              <span>Order online</span>
            </div>
          </div>
        </div>
        <div className="about-imgs">
          <div className="tall img-reveal">
            <img src={img('1485968579580-b6d095142e6e', 900)} alt="Fashion at Madey Maison" />
          </div>
          <div className="tall img-reveal">
            <img src={img('1615529182904-14819c35db37', 900)} alt="Interior styled by Madey Maison" />
          </div>
        </div>
      </div>
    </section>
  )
}

const ARMS = [
  { no: '01', name: 'Fashion', tag: 'Product', href: '#boutique', filter: 'fashion', image: '1445205170230-053b83016050', desc: 'Ready-to-wear and accessories, available now or made to pre-order.' },
  { no: '02', name: 'Interiors', tag: 'Product', href: '#boutique', filter: 'interiors', image: '1600210492486-724fe5c67fb0', desc: 'Furniture, lighting and objects for calm, considered homes.' },
  { no: '03', name: 'Events', tag: 'Service', href: '#events', filter: '', image: '1519225421980-715cb0215aed', desc: 'Design and styling for weddings, launches and private occasions.' },
]

export function Arms({ onFilter }: { onFilter: (f: string) => void }) {
  return (
    <section className="section arms">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">
              Three houses
            </div>
            <h2 className="display section-title reveal reveal-d1" style={{ marginTop: 20 }}>
              One maison, <span className="script">three</span> arms
            </h2>
          </div>
          <p className="reveal reveal-d2">
            Fashion and Interiors are our product houses, ready to order online. Events is our service house, designed with you
            from first idea to final detail.
          </p>
        </div>
        <div className="arms-grid">
          {ARMS.map((a, i) => (
            <a
              key={a.no}
              href={a.href}
              className={`arm-card reveal reveal-d${i + 1}`}
              onClick={() => a.filter && onFilter(a.filter)}
            >
              <img src={img(a.image, 1000)} alt={a.name} />
              <span className="arm-no">{a.no}</span>
              <span className="arm-tag">{a.tag}</span>
              <div className="arm-body">
                <div className="arm-name">
                  {a.name}
                  <span className="go">→</span>
                </div>
                <p className="arm-desc">{a.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Statement() {
  return (
    <section className="statement">
      <div className="statement-bg">
        <img src={img('1540932239986-30128078f3c5', 2000)} alt="" />
      </div>
      <div className="wrap">
        <blockquote className="reveal">
          “Luxury is not excess. It is the <span className="script">care</span> you feel in every seam, every surface and every
          moment we design.”
        </blockquote>
        <cite className="reveal reveal-d1">The Madey Maison philosophy</cite>
      </div>
    </section>
  )
}

const FAQS = [
  ['How do I order?', 'Browse the boutique, add pieces to your bag and send your order with your delivery details. We confirm by email and phone, then arrange payment and delivery.'],
  ['What happens if an item is out of stock?', 'You can still order it as a pre-order. Each product shows how many days it takes to make or source, and your confirmation shows the expected ready date.'],
  ['How long does delivery take?', 'In-stock items ship within the days shown on the product, usually 2 to 7 days depending on the piece.'],
  ['Can I mix in-stock and pre-order items?', 'Yes. Your confirmation lists each item as shipping now or pre-ordered, with its own timeline.'],
  ['How do I book Madey Maison Events?', 'Use the enquiry button in the Events section. Our team will get back to you to discuss your date, guest count and vision.'],
]

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section" id="faq">
      <div className="wrap faq-grid">
        <div>
          <div className="eyebrow reveal">
            Good to know
          </div>
          <h2 className="display section-title reveal reveal-d1" style={{ marginTop: 20 }}>
            Frequently <span className="script">asked</span>
          </h2>
        </div>
        <div className="reveal reveal-d2">
          {FAQS.map(([q, a], i) => (
            <div key={q} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {q}
                <span className="pm" />
              </button>
              <div className="faq-a">
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <h5>Newsletter</h5>
            <p style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 300, lineHeight: 1.2, maxWidth: 360 }}>
              New collections, interiors edits and event stories.
            </p>
            <form className="news" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Email" />
              <button>Join</button>
            </form>
          </div>
          <div>
            <h5>Houses</h5>
            <ul>
              <li><a href="#boutique">Fashion</a></li>
              <li><a href="#boutique">Interiors</a></li>
              <li><a href="#events">Events</a></li>
            </ul>
          </div>
          <div>
            <h5>Client care</h5>
            <ul>
              <li><a href="#faq">Ordering</a></li>
              <li><a href="#faq">Pre-orders</a></li>
              <li><a href="#faq">Delivery</a></li>
            </ul>
          </div>
          <div>
            <h5>Follow</h5>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Pinterest</a></li>
              <li><a href="#">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="wordmark">
          <span>Madey</span>
          <span className="script" style={{ fontSize: '.3em' }}>est. 2015</span>
          <span>Maison</span>
        </div>
        <div className="footer-bottom">
          <span>© 2015–{new Date().getFullYear()} Madey Maison. Registered.</span>
          <span>Fashion · Interiors · Events</span>
        </div>
      </div>
    </footer>
  )
}
