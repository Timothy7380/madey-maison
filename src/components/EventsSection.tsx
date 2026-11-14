import { img } from '../lib/fallbackData'

/**
 * ─────────────────────────────────────────────────────────────
 *  EVENTS — PLACEHOLDER
 *  This section is intentionally simple. It will be replaced with
 *  the detailed Events interface from the client's upcoming prompts.
 *  Keep the id="events" anchor so nav links keep working.
 * ─────────────────────────────────────────────────────────────
 */
export default function EventsSection() {
  return (
    <section className="section events" id="events">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal" style={{ color: 'var(--sand)' }}>
              03 · Service
            </div>
            <h2 className="display section-title reveal reveal-d1" style={{ marginTop: 20 }}>
              Madey <span className="script">Events</span>
            </h2>
          </div>
          <div className="reveal reveal-d2">
            <p style={{ marginBottom: 24 }}>
              Weddings, launches and private occasions, designed and styled with the same eye as our fashion and interiors.
            </p>
            <a href="mailto:events@madeymaison.com" className="btn btn-ghost-light">
              Enquire about an event <span className="arrow">→</span>
            </a>
          </div>
        </div>

        <div className="events-grid">
          <div className="events-feature img-reveal">
            <img src={img('1511795409834-ef04bbd61622', 1600)} alt="Styled event table" />
            <div className="events-cap">
              <h3>Weddings</h3>
            </div>
          </div>
          <div className="events-side">
            <div className="img-reveal">
              <img src={img('1465495976277-4387d4b0b4c6', 1000)} alt="Ceremony details" />
              <div className="events-cap">
                <h3>Ceremonies</h3>
              </div>
            </div>
            <div className="img-reveal">
              <img src={img('1519167758481-83f550bb49b3', 1000)} alt="Reception hall" />
              <div className="events-cap">
                <h3>Receptions & galas</h3>
              </div>
            </div>
          </div>
        </div>
        <p className="events-note">Full events experience coming soon</p>
      </div>
    </section>
  )
}
