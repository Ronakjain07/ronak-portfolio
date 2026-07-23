// Wraps each word in masked spans so GSAP can slide them up into view.
// The visible split words are aria-hidden; a visually-hidden copy of the
// full text carries the accessible name (putting aria-label on a generic
// <span> is a prohibited ARIA attribute). Word gaps come from CSS
// (.sw + .sw margin) — trailing spaces inside inline-blocks collapse.
export default function SplitWords({ text, as: Tag = 'span', className = '', ...rest }) {
  return (
    <Tag className={className} {...rest}>
      <span className="sr-only">{text}</span>
      {text.split(' ').map((word, i) => (
        <span className="sw" key={i} aria-hidden="true">
          <span className="sw-inner">{word}</span>
        </span>
      ))}
    </Tag>
  )
}
