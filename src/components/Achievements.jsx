import SectionHeading from './SectionHeading'
import { achievements } from '../data/content'

export default function Achievements() {
  return (
    <section className="section achievements" data-scene="5">
      <div className="container">
        <SectionHeading
          number="05"
          label="Recognition & Certificates"
          title="Awards along"
          serif="the way"
        />

        <div className="achievement-grid">
          {achievements.map((item, i) => (
            <div className="achievement-card fade-up" data-delay={i * 0.1} key={item.title} data-hover>
              <span className="achievement-star" aria-hidden="true">
                ✦
              </span>
              <h3 className="achievement-title">{item.title}</h3>
              <p className="achievement-org">{item.org}</p>
              <p className="achievement-desc">{item.description}</p>
              {item.certUrl && (
                <a
                  className="achievement-cert"
                  href={item.certUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="View ↗"
                >
                  View certificate ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
