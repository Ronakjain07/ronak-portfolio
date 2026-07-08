import SplitWords from './SplitWords'

// Shared section header: numbered eyebrow label + big split-reveal title.
// The serif flourish is split too, so the whole line animates as one.
export default function SectionHeading({ number, label, title, serif }) {
  return (
    <header className="section-heading">
      <p className="eyebrow fade-up">
        <span className="eyebrow-number">{number}</span>
        <span className="eyebrow-line" />
        {label}
      </p>
      <h2 className="section-title" data-split>
        <SplitWords text={title} />
        {serif && (
          <em className="serif-accent">
            <SplitWords text={serif} />
          </em>
        )}
      </h2>
    </header>
  )
}
