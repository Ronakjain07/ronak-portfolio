import SectionHeading from './SectionHeading'
import { profile, education } from '../data/content'

export default function About() {
  return (
    <section className="section about" id="about" data-scene="1">
      <div className="container">
        <SectionHeading number="01" label="About" title="Turning ideas into" serif="living products" />

        <div className="about-grid">
          <div className="about-portrait fade-up" data-hover data-tilt>
            <div className="about-portrait-inner" data-tilt-inner>
              <img
                className="about-photo"
                src="/ronak-jain.jpg"
                alt="Ronak Jain — AI Engineer"
                loading="lazy"
                width="900"
                height="912"
              />
              <span className="about-portrait-role">{profile.role}</span>
            </div>
            <span className="about-glare" aria-hidden="true" />
          </div>

          <div className="about-body">
            {profile.about.map((para, i) => (
              <p className="about-para fade-up" data-delay={i * 0.08} key={i}>
                {para}
              </p>
            ))}

            <div className="about-edu fade-up">
              <span className="about-edu-label">Education</span>
              <p className="about-edu-school">{education.school}</p>
              <p className="about-edu-degree">
                {education.degree} · {education.detail} · {education.period}
              </p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {profile.stats.map((stat) => (
            <div className="stat fade-up" key={stat.label}>
              <p className="stat-value">
                <span data-counter={stat.value} data-decimals={stat.decimals}>
                  0
                </span>
                {stat.suffix}
              </p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
