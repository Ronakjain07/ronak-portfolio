// Wraps each word in masked spans so GSAP can slide them up into view.
// Word gaps come from CSS (.sw + .sw margin) — trailing spaces inside
// inline-blocks would collapse and jam words together.
export default function SplitWords({ text, as: Tag = 'span', className = '', ...rest }) {
  return (
    <Tag className={className} aria-label={text} {...rest}>
      {text.split(' ').map((word, i) => (
        <span className="sw" key={i} aria-hidden="true">
          <span className="sw-inner">{word}</span>
        </span>
      ))}
    </Tag>
  )
}
