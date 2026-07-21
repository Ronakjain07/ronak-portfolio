import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
if (!blocks.length) throw new Error('no JSON-LD found in dist/index.html')

for (const [, raw] of blocks) {
  const data = JSON.parse(raw) // throws if malformed
  const types = (data['@graph'] || [data]).map((n) => n['@type'])
  const faq = (data['@graph'] || []).find((n) => n['@type'] === 'FAQPage')
  const person = (data['@graph'] || []).find((n) => n['@type'] === 'Person')
  console.log('JSON-LD valid ·', types.join(', '))
  if (person) console.log('  person:', person.name, '·', person.hasOccupation?.name, '· sameAs:', person.sameAs.length)
  if (faq) console.log('  FAQ questions:', faq.mainEntity.length)
}
